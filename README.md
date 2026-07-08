# Jelani Woods — Athlete Portfolio

Five-page portfolio for **Jelani Woods** — IFBB road-to-pro bodybuilding
competitor, Toronto coach, and content creator. Built for fast Core Web Vitals,
strong local SEO, and an editorial, photography-first design that deliberately
avoids the generic "AI-generated" look.

## Stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | [Astro](https://astro.build) 5 (static / SSG)       |
| Interactivity  | React 19 islands (`client:visible` / `client:idle`) |
| Styling        | Tailwind CSS v4 (custom theme, no default palette)  |
| Type system    | Anton (display) · Archivo (body) · Fraunces (serif) — self-hosted via `@fontsource` |
| Deploy target  | Cloudflare Pages (static output)                    |

Astro ships zero JS by default and hydrates only the three interactive pieces
(mobile menu, Instagram grid), so the marketing pages stay light and fast.

## Getting started

```bash
npm install
npm run dev        # local dev at http://localhost:4321
npm run build      # static build to ./dist
npm run preview    # preview the production build
```

## Project structure

```
src/
  data/
    site.ts        # ← single source of truth: copy, links, packages, rates, tiers
    schema.ts      # JSON-LD builders (Person, LocalBusiness, Service, Breadcrumb)
  components/
    Nav.astro / MobileMenu.tsx   # header + mobile menu island
    Footer.astro
    Seo.astro                    # per-page meta + JSON-LD
    Frame.astro                  # editorial photo slot (placeholder → real image)
    VideoFrame.astro             # 9:16 phone-frame video slot (UGC)
    InstagramGrid.tsx            # curated grid + optional Behold live feed
    SectionHead.astro
  layouts/Base.astro
  pages/
    index.astro          # Home
    career.astro         # Career timeline
    about.astro          # About / What I Stand For
    ugc.astro            # Brand / UGC portfolio
    work-with-me.astro   # Coaching funnel + application
    404.astro
  styles/global.css      # design tokens, type scale, scroll-driven reveals
```

## Design system

- **Palette** (`src/styles/global.css`, `@theme`): warm near-black `--color-ink`,
  bone off-white `--color-bone`, single oxblood accent `--color-rust`. No indigo,
  no default Tailwind tokens.
- **Type**: condensed athletic display (Anton), clean grotesk body (Archivo),
  editorial serif for ledes/pull-quotes (Fraunces). Self-hosted — no Google
  Fonts CDN.
- **Motion**: CSS scroll-driven reveals via `animation-timeline: view()`, gated
  behind `@supports` and `prefers-reduced-motion`. Content is fully visible where
  scroll-driven animations aren't supported (e.g. Firefox today).

## Before launch — content checklist

Everything below is wired up with placeholders; swap in the real thing.

1. **Images.** Replace every `<Frame>` / `<VideoFrame>` placeholder with real,
   **owned or licensed** photography. Drop files in `src/assets/` and import them
   for Astro's optimized `<Image>`. ⚠️ Do **not** use IFBB/NPC stage photos
   without a written license from the specific photographer — being the subject
   grants publicity rights, not copyright.
2. **Links & contact** (`src/data/site.ts`): real domain, email addresses,
   Instagram handle, and the Calendly/Typeform **application** URL.
3. **Career timeline** (`src/data/site.ts` → `careerTimeline`): confirm real
   years, shows, placements, and medal counts.
4. **Credentials** (`src/pages/about.astro`): list exact certifications (CPT,
   nutrition, F45) — remove the placeholder note.
5. **UGC rates** (`src/data/site.ts` → `ugcPackages` / `ugcAddOns`): confirm his
   actual "starting at" pricing. Current numbers are 2025–26 market benchmarks.
6. **Media-kit stats** (`src/pages/ugc.astro` → `stats`): real follower count,
   avg views/reel, audience geo + age, engagement rate.
7. **Testimonials** (`src/data/site.ts` → `testimonials`): replace placeholders
   with real, attributed quotes (with permission).
8. **Brand inquiry form** (`src/data/site.ts` → `contact.web3formsKey`): paste a
   free access key from [web3forms.com](https://web3forms.com) to make the UGC
   form submit inline. Left blank, it falls back to a prefilled email — so it
   works day one either way.
9. **OG image**: `public/og-default.png` (1200×630) ships as a generated
   type-only card — swap for one with a real photo when available.
10. **SEO**: update the production domain in `astro.config.mjs` and
    `public/robots.txt`; submit the sitemap in Google Search Console; set up the
    Google Business Profile with consistent NAP.

## Security & performance headers

- **Content-Security-Policy**: a strict, hash-based CSP is emitted as a `<meta>`
  tag by Astro (`astro.config.mjs → experimental.csp`). No `'unsafe-inline'` for
  scripts *or* styles — the codebase avoids inline `style=""` attributes so the
  policy stays tight. Extra sources are allow-listed for the Behold Instagram
  feed and the Web3Forms endpoint.
- **`public/_headers`** (Cloudflare Pages): `X-Frame-Options`, `X-Content-Type-
  Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and 1-year immutable
  caching for fingerprinted `/_astro/*` assets and fonts.
- **PWA basics**: `site.webmanifest` + `apple-touch-icon.png` + maskable icons,
  so the site installs cleanly to a phone home screen.

## Instagram feed — two modes

The `InstagramGrid` island degrades gracefully:

- **Launch (default):** a hand-curated grid that links out to Instagram — zero
  API risk, works day one. Edit the tiles in `src/components/InstagramGrid.tsx`.
- **Live (Phase 2):** convert `@jelaniwoodstv` to a **Professional (Creator)**
  account, connect it to [Behold.so](https://behold.so), and pass the feed id:

  ```astro
  <InstagramGrid client:visible ... beholdFeedId="YOUR_BEHOLD_FEED_ID" />
  ```

  Behold's JSON feed is client-safe (no tokens). If the fetch ever fails, the
  component automatically falls back to the curated grid — the section never
  breaks on an API change.

> The Instagram Basic Display API was shut down Dec 4, 2024, and the Graph API
> now requires a Professional account + Meta app review. Behold (or a manual
> grid) avoids that maintenance burden.

## Deploy to Cloudflare Pages

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework preset:** Astro

No server runtime needed — it's fully static.

## Roadmap (Phase 2)

- Behold live Instagram feed once the account is Professional.
- Dedicated transformations / results gallery.
- Downloadable press / media kit one-pager.
- Newsletter capture for the retirement-to-coaching audience.
- On-domain link-in-bio page to replace hoobe.
