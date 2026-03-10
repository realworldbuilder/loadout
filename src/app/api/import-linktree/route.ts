import { NextRequest, NextResponse } from 'next/server';

interface LinktreeLink {
  id: number;
  type: string;
  title: string;
  url: string;
  position: number;
  locked?: boolean;
  thumbnail_url?: string;
}

interface LinktreeProfile {
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string | null;
  links: LinktreeLink[];
  socialLinks: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    // Normalize URL
    let linktreeUrl = url.trim();
    if (!linktreeUrl.startsWith('http')) {
      // Could be just a username like "aline_tdn" or "linktr.ee/aline_tdn"
      if (linktreeUrl.includes('linktr.ee')) {
        linktreeUrl = `https://${linktreeUrl}`;
      } else {
        // Assume it's just a username
        linktreeUrl = `https://linktr.ee/${linktreeUrl.replace(/^@/, '')}`;
      }
    }

    // Validate it's a linktree URL
    const parsed = new URL(linktreeUrl);
    if (!parsed.hostname.includes('linktr.ee')) {
      return NextResponse.json({ error: 'please provide a linktree url or username' }, { status: 400 });
    }

    // Fetch the Linktree page
    const res = await fetch(linktreeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'could not fetch linktree profile' }, { status: 400 });
    }

    const html = await res.text();

    // Extract __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/__NEXT_DATA__[^>]*>([\s\S]+?)<\/script>/);
    if (!nextDataMatch) {
      return NextResponse.json({ error: 'could not parse linktree data' }, { status: 400 });
    }

    let nextData: any;
    try {
      nextData = JSON.parse(nextDataMatch[1]);
    } catch {
      return NextResponse.json({ error: 'could not parse linktree data' }, { status: 400 });
    }

    const account = nextData?.props?.pageProps?.account;
    if (!account) {
      return NextResponse.json({ error: 'linktree profile not found' }, { status: 404 });
    }

    // Extract links
    const links: LinktreeLink[] = (account.links || [])
      .filter((link: any) => link.type === 'CLASSIC' && link.url)
      .map((link: any) => ({
        id: link.id,
        type: link.type,
        title: link.title || '',
        url: link.url,
        position: link.position,
        locked: link.locked || false,
        thumbnail_url: link.modifiers?.thumbnailUrl || null,
      }));

    // Extract social integrations
    const socialLinks: Record<string, string> = {};
    const integrations = account.socialIntegrations || [];
    for (const integration of integrations) {
      const type = (integration.type || '').toLowerCase();
      if (type.includes('instagram')) {
        socialLinks.instagram = `https://instagram.com/${account.username}`;
      }
      if (type.includes('tiktok')) {
        socialLinks.tiktok = `https://tiktok.com/@${account.username}`;
      }
      if (type.includes('youtube')) {
        socialLinks.youtube = `https://youtube.com/@${account.username}`;
      }
      if (type.includes('twitter')) {
        socialLinks.twitter = `https://x.com/${account.username}`;
      }
    }

    // Also check for social links embedded in links themselves
    for (const link of links) {
      const u = link.url.toLowerCase();
      if (u.includes('instagram.com') && !socialLinks.instagram) {
        socialLinks.instagram = link.url;
      }
      if (u.includes('tiktok.com') && !socialLinks.tiktok) {
        socialLinks.tiktok = link.url;
      }
      if (u.includes('youtube.com') && !socialLinks.youtube) {
        socialLinks.youtube = link.url;
      }
      if ((u.includes('twitter.com') || u.includes('x.com')) && !socialLinks.twitter) {
        socialLinks.twitter = link.url;
      }
    }

    const profile: LinktreeProfile = {
      username: account.username,
      displayName: account.pageTitle || account.username,
      bio: account.description || '',
      profilePicture: account.profilePictureUrl || account.customAvatar || null,
      links,
      socialLinks,
    };

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Linktree import error:', error);
    return NextResponse.json(
      { error: error.message || 'failed to import linktree profile' },
      { status: 500 }
    );
  }
}
