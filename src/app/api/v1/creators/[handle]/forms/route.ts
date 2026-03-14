import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CoachingFormComponent } from '@/lib/component-schema';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function addCORSHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('X-Loadout-Version', '1.0');
  response.headers.set('X-RateLimit-Limit', '1000');
  response.headers.set('X-RateLimit-Remaining', '999'); // TODO: Implement real rate limiting
  return response;
}

// Handle CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCORSHeaders(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const supabase = getSupabase();
    const handle = params.handle;

    // First, get the creator ID
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('handle', handle)
      .eq('is_active', true)
      .single();

    if (creatorError || !creator) {
      const response = NextResponse.json(
        { error: 'Creator not found', status: 404 },
        { status: 404 }
      );
      return addCORSHeaders(response);
    }

    // Fetch active application forms
    const { data: forms, error: formsError } = await supabase
      .from('application_forms')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (formsError) {
      const response = NextResponse.json(
        { error: 'Failed to fetch forms', status: 500 },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }

    // Transform forms into CoachingForm components
    const formComponents: CoachingFormComponent[] = (forms || []).map(form => ({
      component: 'CoachingForm',
      data: {
        id: form.id,
        name: form.name,
        fields: form.fields || [],
        submitEndpoint: `/api/coaching-apply?form_id=${form.id}`,
        submitText: 'Submit Application'
      }
    }));

    const responseData = {
      data: formComponents,
      meta: {
        creatorHandle: handle,
        count: formComponents.length
      }
    };

    const response = NextResponse.json(responseData);
    return addCORSHeaders(response);

  } catch (error) {
    console.error('API Error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error', status: 500 },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}