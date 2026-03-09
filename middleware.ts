import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cache for custom domain lookups (in-memory cache)
const domainCache = new Map<string, { handle: string; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || req.nextUrl.hostname
  const pathname = req.nextUrl.pathname
  
  // Check if this is a custom domain (not our main domains)
  const isMainDomain = hostname === 'loadout.fit' || 
                      hostname === 'loadout-self.vercel.app' || 
                      hostname.includes('localhost') ||
                      hostname.includes('vercel.app')
  
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              req.cookies.set(name, value)
            )
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Handle custom domain routing
    if (!isMainDomain && pathname === '/') {
      // Check cache first
      const cached = domainCache.get(hostname)
      if (cached && cached.expires > Date.now()) {
        // Rewrite to the creator's handle page
        return NextResponse.rewrite(new URL(`/${cached.handle}`, req.url))
      }

      // Look up custom domain in database
      const { data, error } = await supabase
        .from('creators')
        .select('handle')
        .eq('custom_domain', hostname)
        .eq('domain_verified', true)
        .eq('is_active', true)
        .single()

      if (data && !error) {
        // Cache the result
        domainCache.set(hostname, {
          handle: data.handle,
          expires: Date.now() + CACHE_TTL
        })
        
        // Rewrite to the creator's handle page
        return NextResponse.rewrite(new URL(`/${data.handle}`, req.url))
      }
    }

    // Clean up expired cache entries occasionally
    if (Math.random() < 0.01) { // 1% chance
      const now = Date.now()
      Array.from(domainCache.entries()).forEach(([domain, cache]) => {
        if (cache.expires <= now) {
          domainCache.delete(domain)
        }
      })
    }

    // Refresh session if expired
    await supabase.auth.getUser()
  } catch (e) {
    console.error('Middleware auth error:', e)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
