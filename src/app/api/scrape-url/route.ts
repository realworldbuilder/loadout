import { NextRequest, NextResponse } from 'next/server';

// Try to extract Shopify product ID from URL for .json fallback
function getShopifyJsonUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/products\/([^/?]+)/);
    if (match) {
      return `${u.origin}/products/${match[1]}.json`;
    }
  } catch {}
  return null;
}

// Scrape title and og:image from a URL
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    // Strategy 1: Try Google's cache/AMP version for metadata
    // Strategy 2: Try direct fetch with browser-like headers
    // Strategy 3: Try Shopify .json endpoint if it's a Shopify store

    let html = '';
    let fetchOk = false;

    // Try direct fetch first with full browser headers
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'identity',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        html = await res.text();
        // Check if it's a Cloudflare challenge page
        if (!html.includes('challenge-platform') && !html.includes('Just a moment')) {
          fetchOk = true;
        }
      }
    } catch {}

    // If direct fetch failed/blocked, try Shopify JSON endpoint
    if (!fetchOk) {
      const shopifyUrl = getShopifyJsonUrl(url);
      if (shopifyUrl) {
        try {
          const shopifyRes = await fetch(shopifyUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(8000),
          });
          
          if (shopifyRes.ok) {
            const data = await shopifyRes.json();
            const product = data.product;
            if (product) {
              const image = product.image?.src || product.images?.[0]?.src || '';
              return NextResponse.json({
                title: product.title || '',
                image,
                description: product.body_html?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
                price: product.variants?.[0]?.price || '',
                raw_title: product.title || '',
              });
            }
          }
        } catch {}
      }

      // Try opengraph.io as last resort (free tier: 100 req/mo)
      try {
        const ogRes = await fetch(
          `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=default`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (ogRes.ok) {
          const ogData = await ogRes.json();
          const site = ogData.hybridGraph || ogData.openGraph || {};
          if (site.title || site.image) {
            const cleanTitle = (site.title || '')
              .replace(/\s*[\|–—-]\s*[^|–—-]+$/, '')
              .trim();
            return NextResponse.json({
              title: cleanTitle || site.title || '',
              image: site.image || '',
              description: site.description || '',
              price: '',
              raw_title: site.title || '',
            });
          }
        }
      } catch {}

      // If everything fails
      if (!fetchOk) {
        return NextResponse.json({ 
          error: 'Could not fetch URL (site may be blocking requests)',
          title: '',
          image: '',
        }, { status: 200 }); // Return 200 so frontend doesn't error
      }
    }

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
