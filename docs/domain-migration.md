# Domain Migration: deezwatchez.com

Phase 1 moves the existing Watch Compare AI app to `deezwatchez.com` without changing the product experience or internal project names.

## Canonical Domain

- Primary: `https://deezwatchez.com`
- Redirects:
  - `https://www.deezwatchez.com/:path*` -> `https://deezwatchez.com/:path*`
  - `https://watchcompareai.com/:path*` -> `https://deezwatchez.com/:path*`
  - `https://www.watchcompareai.com/:path*` -> `https://deezwatchez.com/:path*`

The app-level redirects are defined in `next.config.ts`. Keep `watchcompareai.com` attached to the Vercel project so those permanent redirects continue to work.

## Vercel

In the existing Vercel project, add these domains:

- `deezwatchez.com`
- `www.deezwatchez.com`
- `watchcompareai.com`
- `www.watchcompareai.com`

Set these environment variables for Production, Preview, and Development as appropriate:

- `NEXT_PUBLIC_SITE_URL=https://deezwatchez.com`
- `NEXT_PUBLIC_CONTACT_EMAIL=contact@deezwatchez.com`

Keep the existing Supabase and OpenAI variables unchanged unless the backing services are intentionally moved.

## DNS

At the registrar for `deezwatchez.com`, point the apex/root domain to Vercel:

- Type: `A`
- Name: `@`
- Value: `216.198.79.1`

Point `www` to Vercel:

- Type: `CNAME`
- Name: `www`
- Value: `19c6471e9f2e75dd.vercel-dns-017.com.`

These are the exact values Vercel displayed for this project after `deezwatchez.com` and `www.deezwatchez.com` were added.

## Supabase

This app currently uses Supabase for database access, not user login callbacks. If Supabase Auth is added or enabled later, update the Supabase dashboard before launch:

- Site URL: `https://deezwatchez.com`
- Redirect URLs:
  - `https://deezwatchez.com/*`
  - `https://www.deezwatchez.com/*`

Keep any local callback URLs needed for development.

## Launch Checks

Before switching traffic:

- Visit `https://deezwatchez.com`, `/compare`, `/about`, `/privacy`, and several `/watches/[slug]` pages.
- Confirm `/sitemap.xml` emits `https://deezwatchez.com` URLs.
- Confirm `/robots.txt` references `https://deezwatchez.com/sitemap.xml`.
- Confirm `https://www.deezwatchez.com/compare` redirects to `https://deezwatchez.com/compare`.
- Confirm `https://watchcompareai.com/compare` redirects to `https://deezwatchez.com/compare`.
- Confirm admin routes still require the existing password.
- Confirm Supabase-backed pages and AI comparison generation still work.
- Confirm contact email forwarding or mailbox setup exists for `contact@deezwatchez.com`.

After launch, update Google Search Console, analytics, affiliate profiles, social profiles, and any external links that still point to `watchcompareai.com`.
