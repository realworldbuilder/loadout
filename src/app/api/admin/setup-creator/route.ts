import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// System user ID for admin-created creators (placeholder)
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  type: 'digital' | 'coaching' | 'link' | 'subscription';
  external_url?: string;
}

interface FormData {
  instagram_input: string;
  display_name: string;
  handle: string;
  bio: string;
  avatar_url: string;
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
  ai_persona: string;
  products: Product[];
}

async function createSystemUser(supabase: any) {
  try {
    // Check if system user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserById(SYSTEM_USER_ID);
    
    if (!checkError && existingUser?.user) {
      return { success: true };
    }

    // Create system user in auth.users
    const { data, error } = await supabase.auth.admin.createUser({
      user_id: SYSTEM_USER_ID,
      email: 'system@loadout.fit',
      user_metadata: {
        is_system: true,
        purpose: 'admin_created_creators'
      },
      email_confirm: true
    });

    if (error && error.message !== 'User already registered') {
      console.error('Error creating system user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    // If user already exists, that's fine
    if (error?.message?.includes('already registered') || error?.message?.includes('already exists')) {
      return { success: true };
    }
    console.error('Error in createSystemUser:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();

    if (!formData.display_name || !formData.handle) {
      return NextResponse.json(
        { error: 'display_name and handle are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Ensure system user exists
    const systemUserResult = await createSystemUser(supabase);
    if (!systemUserResult.success) {
      // If we can't create system user, we'll try to proceed anyway
      // as the user might already exist but be inaccessible via admin API
      console.warn('Could not create/verify system user:', systemUserResult.error);
    }

    // Check if handle already exists
    const { data: existingCreator, error: checkError } = await supabase
      .from('creators')
      .select('handle')
      .eq('handle', formData.handle)
      .single();

    if (existingCreator) {
      return NextResponse.json(
        { error: 'Handle already exists' },
        { status: 400 }
      );
    }

    // Create creator record
    const creatorData = {
      user_id: SYSTEM_USER_ID,
      handle: formData.handle,
      display_name: formData.display_name,
      bio: formData.bio || null,
      avatar_url: formData.avatar_url || null,
      social_links: formData.social_links || {},
      theme: {
        primary: '#10a37f',
        background: '#0a0a0a',
        ai_persona: formData.ai_persona || null
      },
      is_active: true,
      tier: 'free',
      stripe_onboarding_complete: false
    };

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .insert([creatorData])
      .select()
      .single();

    if (creatorError) {
      console.error('Creator creation error:', creatorError);
      return NextResponse.json(
        { error: `Failed to create creator: ${creatorError.message}` },
        { status: 500 }
      );
    }

    // Create products if any
    const createdProducts = [];
    if (formData.products && formData.products.length > 0) {
      for (const product of formData.products) {
        if (!product.title.trim()) continue; // Skip empty products

        const productData: any = {
          creator_id: creator.id,
          title: product.title,
          description: product.description || null,
          price_cents: Math.round(parseFloat(product.price || '0') * 100),
          type: product.type,
          external_url: product.external_url || null,
          is_active: true,
          sort_order: createdProducts.length
        };

        const { data: createdProduct, error: productError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (productError) {
          console.error('Product creation error:', productError);
          // Don't fail the whole request for a product error
          continue;
        }

        createdProducts.push(createdProduct);
      }
    }

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        handle: creator.handle,
        display_name: creator.display_name,
        url: `https://loadout.fit/${creator.handle}`
      },
      products: createdProducts,
      message: `Creator page created! Live at: loadout.fit/${creator.handle}`
    });

  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: `Failed to create creator: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}