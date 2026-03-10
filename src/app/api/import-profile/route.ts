import { NextRequest, NextResponse } from 'next/server';

// ── Types ──────────────────────────────────────────────────────────────────

interface ImportedLink {
  id: string;
  title: string;
  url: string;
  position: number;
  type: 'link' | 'product';
  price?: string;
  image?: string;
}

interface ImportedProfile {
  platform: 'linktree' | 'stan' | 'payhip' | 'gumroad' | 'hoobe' | 'linkme' | 'unknown';
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string | null;
  links: ImportedLink[];
  products: ImportedLink[];
  socialLinks: Record<string, string>;
}

// ── Platform Detection ─────────────────────────────────────────────────────

function detectPlatform(url: string): { platform: string; normalizedUrl: string } {
  const lower = url.toLowerCase().trim();

  if (lower.includes('linktr.ee') || lower.includes('linktree.com')) {
    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = `https://${normalized}`;
    return { platform: 'linktree', normalizedUrl: normalized };
  }

  if (lower.includes('stan.store')) {
    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = `https://${normalized}`;
    return { platform: 'stan', normalizedUrl: normalized };
  }

  if (lower.includes('payhip.com')) {
    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = `https://${normalized}`;
    return { platform: 'payhip', normalizedUrl: normalized };
  }

  if (lower.includes('hoo.be')) {
    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = `https://${normalized}`;
    return { platform: 'hoobe', normalizedUrl: normalized };
  }

  if (lower.includes('link.me')) {
    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = `https://${normalized}`;
    return { platform: 'linkme', normalizedUrl: normalized };
  }

  if (lower.includes('gumroad.com') || lower.includes('.gumroad.com')) {
    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = `https://${normalized}`;
    return { platform: 'gumroad', normalizedUrl: normalized };
  }

  // Assume it's a username — try linktree first
  const username = url.trim().replace(/^@/, '');
  if (/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return { platform: 'linktree', normalizedUrl: `https://linktr.ee/${username}` };
  }

  return { platform: 'unknown', normalizedUrl: url };
}

// ── Fetcher ────────────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ── Linktree Parser ────────────────────────────────────────────────────────

async function parseLinktree(url: string): Promise<ImportedProfile> {
  const html = await fetchPage(url);
  const match = html.match(/__NEXT_DATA__[^>]*>([\s\S]+?)<\/script>/);
  if (!match) throw new Error('could not parse linktree data');

  const data = JSON.parse(match[1]);
  const account = data?.props?.pageProps?.account;
  if (!account) throw new Error('linktree profile not found');

  const links: ImportedLink[] = (account.links || [])
    .filter((l: any) => l.type === 'CLASSIC' && l.url)
    .map((l: any, i: number) => ({
      id: String(l.id),
      title: l.title || '',
      url: l.url,
      position: l.position ?? i,
      type: 'link' as const,
      image: l.modifiers?.thumbnailUrl || undefined,
    }));

  const socialLinks: Record<string, string> = {};
  for (const link of links) {
    const u = link.url.toLowerCase();
    if (u.includes('instagram.com') && !socialLinks.instagram) socialLinks.instagram = link.url;
    if (u.includes('tiktok.com') && !socialLinks.tiktok) socialLinks.tiktok = link.url;
    if (u.includes('youtube.com') && !socialLinks.youtube) socialLinks.youtube = link.url;
    if ((u.includes('twitter.com') || u.includes('x.com')) && !socialLinks.twitter) socialLinks.twitter = link.url;
  }

  return {
    platform: 'linktree',
    username: account.username,
    displayName: account.pageTitle || account.username,
    bio: account.description || '',
    profilePicture: account.profilePictureUrl || account.customAvatar || null,
    links,
    products: [],
    socialLinks,
  };
}

// ── Stan.store Parser ──────────────────────────────────────────────────────

async function parseStan(url: string): Promise<ImportedProfile> {
  const html = await fetchPage(url);

  // Extract __NUXT__ data — it's a JS function call, we need to eval-safe parse it
  // Instead, extract key data from meta tags and visible HTML
  const ogTitle = html.match(/property="og:title"\s+content="([^"]*)"/)?.[1] || '';
  const ogDesc = html.match(/property="og:description"\s+content="([^"]*)"/)?.[1] || '';
  const ogImage = html.match(/property="og:image"\s+content="([^"]*)"/)?.[1] || null;

  // Extract username from URL
  const urlObj = new URL(url);
  const username = urlObj.pathname.replace(/^\//, '').split('/')[0] || '';

  // Try to extract data from __NUXT__ state
  const nuxtMatch = html.match(/__NUXT__=\(function\([^)]*\)\{([\s\S]*?)\}\(/);
  
  let displayName = ogTitle || username;
  let bio = ogDesc || '';
  let profilePicture = ogImage;
  const links: ImportedLink[] = [];
  const products: ImportedLink[] = [];
  const socialLinks: Record<string, string> = {};

  // Try parsing NUXT data for socials
  const socialsMatch = html.match(/socials:\{([^}]+)\}/);
  if (socialsMatch) {
    const socialsStr = socialsMatch[1];
    const socialPairs = socialsStr.match(/(instagram|tiktok|youtube|twitter|link):"([^"]*)"/g);
    if (socialPairs) {
      for (const pair of socialPairs) {
        const [, platform, value] = pair.match(/(instagram|tiktok|youtube|twitter|link):"([^"]*)"/) || [];
        if (platform && value) {
          const decoded = value.replace(/\\u002F/g, '/');
          if (platform === 'instagram') socialLinks.instagram = decoded;
          if (platform === 'tiktok') socialLinks.tiktok = decoded;
          if (platform === 'youtube') socialLinks.youtube = decoded;
          if (platform === 'twitter') socialLinks.twitter = decoded;
        }
      }
    }
  }

  // Extract product titles and URLs from the HTML
  // Stan renders product cards with titles
  const productMatches = Array.from(html.matchAll(/product_title[^>]*>([^<]+)/g));
  let i = 0;
  for (const m of productMatches) {
    products.push({
      id: `stan-${i}`,
      title: m[1].trim(),
      url: url,
      position: i,
      type: 'product',
    });
    i++;
  }

  // Also try extracting from nuxt data - look for product arrays
  const titleMatches = Array.from(html.matchAll(/title:"([^"]{3,100})"/g));
  const seenTitles = new Set(products.map(p => p.title));
  for (const m of titleMatches) {
    const title = m[1].replace(/\\u002F/g, '/').replace(/\\u0026/g, '&');
    if (!seenTitles.has(title) && !title.includes('{') && !title.includes('function')) {
      products.push({
        id: `stan-${i}`,
        title,
        url: url,
        position: i,
        type: 'product',
      });
      seenTitles.add(title);
      i++;
    }
  }

  return {
    platform: 'stan',
    username,
    displayName: displayName.replace(' | Stan Store', '').replace(' | Stan', ''),
    bio,
    profilePicture,
    links,
    products,
    socialLinks,
  };
}

// ── Payhip Parser ──────────────────────────────────────────────────────────

async function parsePayhip(url: string): Promise<ImportedProfile> {
  const html = await fetchPage(url);

  const ogTitle = html.match(/og:title"\s+content="([^"]*)"/)?.[1] || '';
  const ogDesc = html.match(/og:description"\s+content="([^"]*)"/)?.[1] || '';
  const ogImage = html.match(/og:image"\s+content="([^"]*)"/)?.[1] || null;

  // Username from URL
  const urlObj = new URL(url);
  const username = urlObj.pathname.replace(/^\//, '').split('/')[0] || '';

  // Extract product keys
  const productKeys = new Set<string>();
  const keyMatches = Array.from(html.matchAll(/data-product-key="([a-zA-Z0-9]+)"/g));
  for (const m of keyMatches) {
    if (m[1].length > 3) productKeys.add(m[1]);
  }

  // For each product key, try to get the product page
  const products: ImportedLink[] = [];
  let i = 0;
  for (const key of Array.from(productKeys)) {
    try {
      const productUrl = `https://payhip.com/b/${key}`;
      const productHtml = await fetchPage(productUrl);
      const title = productHtml.match(/<title>([^<]*)/)?.[1]?.replace(/ - Payhip$/, '').trim() || `Product ${key}`;
      const price = productHtml.match(/price-value[^>]*>([^<]*)/)?.[1]?.trim() || '';
      const image = productHtml.match(/og:image"\s+content="([^"]*)"/)?.[1] || undefined;

      products.push({
        id: key,
        title,
        url: productUrl,
        position: i,
        type: 'product',
        price: price || undefined,
        image,
      });
      i++;
    } catch {
      products.push({
        id: key,
        title: `Product ${key}`,
        url: `https://payhip.com/b/${key}`,
        position: i,
        type: 'product',
      });
      i++;
    }
  }

  return {
    platform: 'payhip',
    username,
    displayName: ogTitle?.replace(/ - Payhip$/, '').replace(/ - .*$/, '') || username,
    bio: ogDesc || '',
    profilePicture: ogImage,
    links: [],
    products,
    socialLinks: {},
  };
}

// ── Gumroad Parser ─────────────────────────────────────────────────────────

async function parseGumroad(url: string): Promise<ImportedProfile> {
  const html = await fetchPage(url);

  const ogTitle = html.match(/og:title"\s+content="([^"]*)"/)?.[1] || '';
  const ogDesc = html.match(/og:description"\s+content="([^"]*)"/)?.[1] || '';
  const ogImage = html.match(/og:image"\s+content="([^"]*)"/)?.[1] || null;

  const urlObj = new URL(url);
  let username = urlObj.pathname.replace(/^\//, '').split('/')[0] || '';
  // Gumroad uses subdomains too: creator.gumroad.com
  if (!username && urlObj.hostname.endsWith('.gumroad.com')) {
    username = urlObj.hostname.replace('.gumroad.com', '');
  }

  // Gumroad embeds product data in the page
  const products: ImportedLink[] = [];
  const productMatches = Array.from(html.matchAll(/class="product-card"[^>]*href="([^"]*)"[^>]*>[\s\S]*?class="product-card-name[^"]*"[^>]*>([^<]*)/g));
  let i = 0;
  for (const m of productMatches) {
    products.push({
      id: `gumroad-${i}`,
      title: m[2].trim(),
      url: m[1].startsWith('http') ? m[1] : `https://gumroad.com${m[1]}`,
      position: i,
      type: 'product',
    });
    i++;
  }

  return {
    platform: 'gumroad',
    username,
    displayName: ogTitle || username,
    bio: ogDesc || '',
    profilePicture: ogImage,
    links: [],
    products,
    socialLinks: {},
  };
}

// ── Hoo.be Parser ──────────────────────────────────────────────────────────

async function parseHoobe(url: string): Promise<ImportedProfile> {
  const html = await fetchPage(url);

  const ogTitle = html.match(/og:title"\s+content="([^"]*)"/)?.[1] || '';
  const ogDesc = html.match(/og:description"\s+content="([^"]*)"/)?.[1] || '';
  const ogImage = html.match(/og:image"\s+content="([^"]*)"/)?.[1] || null;

  // Username from URL
  const urlObj = new URL(url);
  const username = urlObj.pathname.replace(/^\//, '').split('/')[0] || '';

  // Parse display name and bio from og:description format "Name || bio text"
  let displayName = ogTitle || username;
  let bio = '';
  if (ogDesc.includes('||')) {
    const parts = ogDesc.split('||');
    displayName = parts[0].trim() || displayName;
    bio = parts.slice(1).join('||').trim();
  } else {
    bio = ogDesc;
  }

  // Extract social links (hoobe adds utm_source=hoobe to all outbound links)
  const socialLinks: Record<string, string> = {};
  const socialMatches = Array.from(html.matchAll(/class="SocialItem[^"]*"[^>]*href="([^"]*)\?utm_source=hoobe/g));
  for (const m of socialMatches) {
    const linkUrl = m[1].replace(/&amp;/g, '&');
    const lower = linkUrl.toLowerCase();
    if (lower.includes('instagram.com') && !socialLinks.instagram) socialLinks.instagram = linkUrl;
    if (lower.includes('tiktok.com') && !socialLinks.tiktok) socialLinks.tiktok = linkUrl;
    if (lower.includes('youtube.com') && !socialLinks.youtube) socialLinks.youtube = linkUrl;
    if ((lower.includes('twitter.com') || lower.includes('x.com')) && !socialLinks.twitter) socialLinks.twitter = linkUrl;
    if (lower.includes('snapchat.com') || lower.includes('t.snapchat.com')) socialLinks.snapchat = linkUrl;
  }

  // Extract content links (non-social outbound links with utm_source=hoobe)
  const links: ImportedLink[] = [];
  const linkMatches = Array.from(html.matchAll(/<a[^>]*href="([^"]*)\?utm_source=hoobe[^"]*"[^>]*data-block-container="true"[^>]*>/g));
  let i = 0;
  for (const m of linkMatches) {
    const linkUrl = m[1].replace(/&amp;/g, '&');
    // Skip social links we already captured
    const lower = linkUrl.toLowerCase();
    if (lower.includes('instagram.com') || lower.includes('tiktok.com') || 
        lower.includes('youtube.com') || lower.includes('twitter.com') || 
        lower.includes('x.com') || lower.includes('snapchat.com')) continue;

    // Determine if it's a product (shopping card) or regular link
    const isProduct = m[0].includes('ShoppingLinkCard');
    
    // Try to extract title from URL path
    let title = '';
    try {
      const u = new URL(linkUrl);
      const pathParts = u.pathname.split('/').filter(Boolean);
      title = pathParts[pathParts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || u.hostname;
    } catch {
      title = linkUrl;
    }

    links.push({
      id: `hoobe-${i}`,
      title,
      url: linkUrl,
      position: i,
      type: isProduct ? 'product' : 'link',
    });
    i++;
  }

  return {
    platform: 'hoobe',
    username,
    displayName,
    bio,
    profilePicture: ogImage,
    links: links.filter(l => l.type === 'link'),
    products: links.filter(l => l.type === 'product'),
    socialLinks,
  };
}

// ── Link.me Parser ─────────────────────────────────────────────────────────

async function parseLinkme(url: string): Promise<ImportedProfile> {
  const html = await fetchPage(url);

  // Link.me uses __NEXT_DATA__ with full profile data
  const match = html.match(/__NEXT_DATA__[^>]*>([\s\S]+?)<\/script>/);
  if (!match) throw new Error('could not parse link.me data');

  const data = JSON.parse(match[1]);
  const profile = data?.props?.pageProps?.profile;
  if (!profile) throw new Error('link.me profile not found');

  const socialLinks: Record<string, string> = {};
  const links: ImportedLink[] = [];
  let i = 0;

  // Parse webLinks array
  for (const wl of (profile.webLinks || [])) {
    const title = wl.title || '';
    const linkData = wl.links?.[0];
    if (!linkData) continue;

    const linkUrl = linkData.linkValue || '';
    if (!linkUrl) continue;

    const lower = linkUrl.toLowerCase();
    const titleLower = title.toLowerCase();

    // Check if it's a social link
    if (titleLower === 'instagram' || lower.includes('instagram.com')) {
      socialLinks.instagram = linkUrl;
      continue;
    }
    if (titleLower === 'tiktok' || lower.includes('tiktok.com')) {
      socialLinks.tiktok = linkUrl;
      continue;
    }
    if (titleLower === 'youtube' || lower.includes('youtube.com')) {
      socialLinks.youtube = linkUrl;
      continue;
    }
    if (titleLower === 'twitter' || titleLower === 'x' || lower.includes('twitter.com') || lower.includes('x.com')) {
      socialLinks.twitter = linkUrl;
      continue;
    }
    if (titleLower === 'snapchat' || lower.includes('snapchat.com')) {
      socialLinks.snapchat = linkUrl;
      continue;
    }

    links.push({
      id: `linkme-${i}`,
      title: title || linkUrl,
      url: linkUrl,
      position: i,
      type: 'link',
      image: linkData.linkImage || undefined,
    });
    i++;
  }

  // Profile image URL construction
  let profilePicture: string | null = null;
  if (profile.profileImage) {
    // link.me stores relative paths, need to construct full URL
    profilePicture = profile.profileImage.startsWith('http') 
      ? profile.profileImage 
      : `https://link.me/${profile.profileImage}`;
  }

  return {
    platform: 'linkme',
    username: profile.username || '',
    displayName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || '',
    bio: profile.bio || '',
    profilePicture,
    links,
    products: [],
    socialLinks,
  };
}

// ── Main Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const { platform, normalizedUrl } = detectPlatform(url);

    let profile: ImportedProfile;

    switch (platform) {
      case 'linktree':
        profile = await parseLinktree(normalizedUrl);
        break;
      case 'stan':
        profile = await parseStan(normalizedUrl);
        break;
      case 'payhip':
        profile = await parsePayhip(normalizedUrl);
        break;
      case 'gumroad':
        profile = await parseGumroad(normalizedUrl);
        break;
      case 'hoobe':
        profile = await parseHoobe(normalizedUrl);
        break;
      case 'linkme':
        profile = await parseLinkme(normalizedUrl);
        break;
      default:
        return NextResponse.json(
          { error: 'platform not supported yet. try a linktree, stan.store, payhip, or gumroad url.' },
          { status: 400 }
        );
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'failed to import profile' },
      { status: 500 }
    );
  }
}
