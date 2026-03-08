import { NextRequest, NextResponse } from 'next/server';

// Scrape title and og:image from a URL
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    // Fetch the page HTML
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Loadout/1.0; +https://loadout.fit)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 502 });
    }

    const html = await res.text();

    // Extract og:image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    
    // Extract og:title, then <title>
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    // Extract og:description as fallback
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

    // Extract product price if available (schema.org or meta)
    const priceMatch = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']product:price:amount["']/i)
      || html.match(/"price":\s*"?(\d+\.?\d*)"?/i);

    const title = ogTitleMatch?.[1]?.trim() || titleTagMatch?.[1]?.trim() || '';
    const image = ogImageMatch?.[1]?.trim() || '';
    const description = ogDescMatch?.[1]?.trim() || '';
    const price = priceMatch?.[1]?.trim() || '';

    // Clean up title — remove site name suffixes like " | YoungLA" or " - DFYNE"
    const cleanTitle = title
      .replace(/\s*[\|–—-]\s*[^|–—-]+$/, '')
      .trim();

    return NextResponse.json({
      title: cleanTitle || title,
      image,
      description,
      price,
      raw_title: title,
    });
  } catch (error: any) {
    console.error('Scrape error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to scrape URL', detail: error?.message },
      { status: 500 }
    );
  }
}
