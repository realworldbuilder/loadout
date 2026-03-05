import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUser(request: NextRequest) {
  // Get the access token from the sb-access-token cookie or Authorization header
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Try to find the access token from cookies
  const allCookies = request.cookies.getAll();
  let accessToken: string | null = null;
  
  // Supabase stores tokens in cookies like sb-<ref>-auth-token
  for (const cookie of allCookies) {
    if (cookie.name.includes('auth-token')) {
      try {
        // Could be a JSON array with [access_token, refresh_token, ...]
        const parsed = JSON.parse(decodeURIComponent(cookie.value));
        if (Array.isArray(parsed) && parsed.length > 0) {
          accessToken = parsed[0];
        } else if (typeof parsed === 'string') {
          accessToken = parsed;
        }
      } catch {
        // Maybe it's stored as base64 or direct token
        accessToken = cookie.value;
      }
      break;
    }
  }
  
  if (!accessToken) {
    // Try Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7);
    }
  }
  
  if (!accessToken) {
    return null;
  }
  
  // Verify the token
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  
  const { data: { user }, error } = await client.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
