import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyDomain(domain: string): Promise<boolean> {
  try {
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Check CNAME record
    const cnameRecords = await resolveCname(cleanDomain);
    
    // Check if CNAME points to loadout.fit
    return cnameRecords.some(record => 
      record === 'loadout.fit' || 
      record === 'loadout.fit.'
    );
  } catch (error) {
    console.error('DNS lookup error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { domain, userId } = await request.json();

    if (!domain || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: domain, userId' 
      }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.([a-zA-Z]{2,})$/;
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ 
        error: 'Invalid domain format' 
      }, { status: 400 });
    }

    // Verify DNS configuration
    const isVerified = await verifyDomain(cleanDomain);

    if (!isVerified) {
      return NextResponse.json({
        verified: false,
        error: 'Domain DNS not configured correctly. Please set up a CNAME record pointing to loadout.fit'
      }, { status: 200 });
    }

    // Update database with verification status
    const supabase = getServiceSupabase();
    
    // Check if user has pro subscription
    const { data: creator, error: fetchError } = await supabase
      .from('creators')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    if (fetchError || !creator) {
      return NextResponse.json({ 
        error: 'Creator not found' 
      }, { status: 404 });
    }

    if (creator.subscription_tier !== 'pro') {
      return NextResponse.json({ 
        error: 'Custom domains are only available for Pro subscribers' 
      }, { status: 403 });
    }

    // Check if domain is already in use by another creator
    const { data: existingDomain } = await supabase
      .from('creators')
      .select('user_id')
      .eq('custom_domain', cleanDomain)
      .neq('user_id', userId)
      .single();

    if (existingDomain) {
      return NextResponse.json({
        verified: false,
        error: 'Domain is already in use by another creator'
      }, { status: 409 });
    }

    // Update creator with verified domain
    const { data, error } = await supabase
      .from('creators')
      .update({
        custom_domain: cleanDomain,
        domain_verified: true
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ 
        error: 'Failed to update domain verification' 
      }, { status: 500 });
    }

    return NextResponse.json({
      verified: true,
      domain: cleanDomain,
      message: 'Domain successfully verified and configured!'
    });

  } catch (error) {
    console.error('Domain verification error:', error);
    return NextResponse.json({ 
      error: 'Failed to verify domain' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from('creators')
      .select('custom_domain, domain_verified, subscription_tier')
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Creator not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      customDomain: data.custom_domain,
      domainVerified: data.domain_verified,
      subscriptionTier: data.subscription_tier
    });

  } catch (error) {
    console.error('Domain fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch domain information' 
    }, { status: 500 });
  }
}