import { NextRequest, NextResponse } from 'next/server';
import { COMPONENT_SCHEMA } from '@/lib/component-schema';

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

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({
      ...COMPONENT_SCHEMA,
      meta: {
        description: 'Loadout.fit Component API Schema',
        documentation: '/api-docs',
        endpoints: {
          creators: {
            list: 'GET /api/v1/creators',
            profile: 'GET /api/v1/creators/{handle}',
            products: 'GET /api/v1/creators/{handle}/products',
            forms: 'GET /api/v1/creators/{handle}/forms'
          },
          schema: 'GET /api/v1/schema'
        }
      }
    });
    
    return addCORSHeaders(response);

  } catch (error) {
    console.error('Schema API Error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error', status: 500 },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}