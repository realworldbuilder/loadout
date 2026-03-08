import { NextRequest, NextResponse } from 'next/server';

const BRANDFETCH_KEY = process.env.BRANDFETCH_API_KEY || 'Yd83VKTqp7BsUI6Wo3YXImTbzo76R2l7JFAdK7Fc-Bls-OgMMyEFH559R9JHaAwCtgMzmFSNyxgDXLqpynD0cg';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${BRANDFETCH_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();

    // Map to simplified format, take top 8 results
    const results = (Array.isArray(data) ? data : []).slice(0, 8).map((item: Record<string, unknown>) => ({
      name: item.name as string,
      domain: item.domain as string,
      // Use higher quality icon format
      icon: `https://cdn.brandfetch.io/${item.brandId}/w/400/h/400/theme/dark/icon.jpeg`,
      brandId: item.brandId as string,
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}