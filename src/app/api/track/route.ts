import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) return realIp;
  if (cfConnectingIp) return cfConnectingIp;
  
  // Fallback
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabase();
    const { type, creator_id, product_id, referrer, session_id } = body;

    // Extract user agent and IP
    const user_agent = request.headers.get('user-agent') || '';
    const ip_address = getClientIP(request);

    // Basic validation
    if (!type || !creator_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'click' && !product_id) {
      return NextResponse.json({ error: 'product_id required for click tracking' }, { status: 400 });
    }

    if (type === 'pageview') {
      // Insert into page_views table
      const { error } = await supabase
        .from('page_views')
        .insert({
          creator_id,
          referrer,
          user_agent,
          ip_address,
          session_id,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting pageview:', error);
        // Don't return error to client - always return 200
      }
    } else if (type === 'click') {
      // Insert into link_clicks table
      const { error } = await supabase
        .from('link_clicks')
        .insert({
          product_id,
          creator_id,
          referrer,
          user_agent,
          ip_address,
          session_id,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting click:', error);
        // Don't return error to client - always return 200
      }
    }

    // Always return success to client
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    // Never error to client - tracking should be invisible
    return NextResponse.json({ success: true });
  }
}