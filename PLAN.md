# PLAN.md — Jelani Woods Portfolio: Audit Findings & Upgrade Plan

Workflow: the **architect** (main session) plans, reviews, and generates
imagery (Higgsfield). The **builder** agent executes tasks. Every task below is
sized for one builder run, with explicit files and acceptance criteria. All
animation work must follow **MOTION.md**.

Scoping decisions (confirmed 2026-07-07):

1. Motion **complements** the CSS scroll reveals (islands only) — it does not
   replace them. Static reveals get an IntersectionObserver fallback.
2. Replace sirv with a tiny dependency-free Node server so security headers,
   immutable caching, and 404.html actually work on Railway.
3. Placeholder `VideoObject` JSON-LD on /ugc is removed until real clips exist.
4. Architect generates editorial placeholder imagery with Higgsfield for all
   Frame slots; builder wires them in.

---

## Phase 1 — Audit findings (complete, 2026-07-07)

### 1.1 Current state / placeholder inventory

Real: all copy, layout, design system, nav/footer, inquiry form logic, SEO
plumbing, sitemap, robots, manifest, icons, CSP config.

Placeholder (blocking launch, tracked in Phase 6):

- **All photography** — 14 `Frame` slots: home hero full-bleed, home portrait
  (5/4), home coaching (4/5); career 6× timeline (4/3); about portrait (4/5);
  work-with-me hero (4/5) + 3× results (4/5).
- **All video** — 6 `VideoFrame` slots on /ugc (no `src`).
- `site.contact.applyUrl` — placeholder Calendly URL.
- `site.contact.web3formsKey` — empty (form falls back to mailto).
- Both testimonials in `site.ts` — explicitly marked placeholder.
- /ugc media-kit stats — placeholder figures.
- About credentials — note says certifications unconfirmed.
- InstagramGrid — curated fallback tiles only (`beholdFeedId` unset).

### 1.2 Accessibility

Good: skip link; global `:focus-visible`; `aria-current` nav; labeled form
fields with honeypot correctly hidden; `role="alert"` on form errors;
`inert` + `aria-hidden` on the closed mobile menu; decorative footer
watermark `aria-hidden`; reveals fully gated behind
`prefers-reduced-motion: no-preference`.

Issues:

- **A11Y-1 (MobileMenu)**: overlay lacks `role="dialog"`/`aria-modal`; focus is
  not moved into the menu on open, not trapped, not returned on close.
  `src/components/MobileMenu.tsx`.
- **A11Y-2 (contrast)**: bone (#efe8d9) text on rust (#c24a32) buttons ≈ 3.8:1
  — fails AA (4.5:1) at the 14px semibold size used. Hover state rust-bright
  (#dd5a3c) is worse (≈ 3.1:1). Affects every primary CTA site-wide.
- **A11Y-3 (InquiryForm)**: on success the form is replaced by a message but
  focus/announcement is not managed — screen readers get silence.
- **A11Y-4 (anchor offset)**: `#packages` on /ugc has no scroll-margin; the
  fixed header covers the target. (`#inquiry` already has `scroll-mt-24`.)
- **A11Y-5 (minor)**: `✓`/`✕` list glyphs on /work-with-me are read literally
  by screen readers; hover scale transforms aren't reduced-motion gated.

### 1.3 Performance

- Hydration boundaries are sensible (`client:idle` menu, `client:visible` form
  + grid), but React ships on **every** page solely for the hamburger menu.
  Accepted cost since Motion islands are planned; revisit only if Lighthouse
  suffers.
- **PERF-1 (fonts)**: 10+ woff2 subsets load via CSS `@import` — discovered
  late (after CSS parse), no preload, and unused subsets (Vietnamese,
  latin-ext) ship for all three families. Fraunces italic is a 4th variable
  file.
- **PERF-2**: no real images yet — when wired, they must use `astro:assets`
  (`Image`) with width/height, lazy loading below the fold, and the hero as
  the only eager/high-priority image.
- `body { overflow-x: hidden }` can mask layout bugs — acceptable, noted.

### 1.4 SEO / schema / deploy

Good: unique titles/descriptions; canonical URLs; OG + Twitter cards;
sitemap-index linked and 404 correctly excluded; robots.txt points at the
sitemap; breadcrumbs on subpages; Person/ProfessionalService/Service schema;
hash-based CSP meta.

Issues:

- **SEO-1 (critical)**: 6 fabricated `VideoObject` blocks on /ugc (fake
  uploadDate 2026-01-01, contentUrl = Instagram profile). Invalid structured
  data. Remove (decision #3).
- **DEPLOY-1 (critical)**: `public/_headers` is Cloudflare Pages syntax —
  **sirv on Railway ignores it**. Production serves no HSTS,
  X-Content-Type-Options, X-Frame-Options, Referrer-Policy, or immutable
  caching, and sirv returns a plain 404 instead of 404.html.
- **SEO-2 (minor)**: no `og:image:alt`; no `WebSite` schema; `personSchema`
  lacks `image`; footer year hardcoded `2026`.

### 1.5 Animation inventory (as of audit)

| # | Animation | Location | Duration / easing | Reduced-motion safe? |
| --- | --- | --- | --- | --- |
| 1 | Scroll reveal fade / fade-up (2.5rem) | `[data-reveal]`, global.css | scroll-scrubbed, linear, `entry 5% cover 32%` | ✅ gated + `@supports` (but **Chromium-only** — Safari/Firefox get no reveal) |
| 2 | Smooth anchor scroll | `html`, global.css | browser default | ✅ gated |
| 3 | Link underline grow | `.link-underline` | 400ms `cubic-bezier(0.16,1,0.3,1)` | ⚠️ not gated (opacity/bg only — acceptable) |
| 4 | Color transitions (nav, buttons) | `transition-colors` everywhere | 150ms Tailwind default ease | ⚠️ not gated (color only — acceptable) |
| 5 | Mobile menu overlay fade | MobileMenu.tsx | 300ms opacity, default ease | ⚠️ not gated (opacity only — acceptable) |
| 6 | IG image hover zoom | InstagramGrid.tsx | 700ms scale 1→1.05 | ❌ transform, not gated |
| 7 | IG hover overlay/ring | InstagramGrid.tsx | 300ms color | ⚠️ acceptable |
| 8 | Play button hover scale | VideoFrame.astro | 300ms scale 1→1.1 | ❌ transform, not gated |

Verdict: three easings and four durations in circulation; no entrance
choreography; no stagger; two ungated transforms. MOTION.md consolidates all
of this to one curve + four duration tokens.

---

## Phase 2 — Foundations & critical fixes (builder)

### T2.1 Motion tokens + `src/data/motion.ts`

- Files: `src/styles/global.css`, new `src/data/motion.ts`.
- Add `--ease-out`, `--dur-fast`, `--dur-base`, `--dur-slow`, `--dur-reveal`
  per MOTION.md §2–3. Refactor `.link-underline` to use them. Create
  `motion.ts` exporting `EASE = [0.16, 1, 0.3, 1]` and `DUR` object.
- Accept: build passes; no behavior change; tokens are the only place these
  numbers appear in CSS.

### T2.2 Cross-browser reveal fallback + stagger

- Files: `src/styles/global.css`, `src/layouts/Base.astro` (small inline
  `is:inline` script or `src/scripts/reveal.js`).
- Where `animation-timeline: view()` is unsupported: IntersectionObserver adds
  `.is-revealed`; CSS transitions per MOTION.md §4.1. Guard with
  `CSS.supports('animation-timeline: view()')` so Chromium keeps the scrubbed
  version and never double-animates. Honor reduced motion (no observer, content
  visible). Implement `data-reveal-group` stagger.
- Note: the CSP is hash-based (`experimental.csp`) — the script must be an
  Astro-processed inline script so it gets hashed; verify the built page has no
  CSP violation.
- Accept: reveals visible in Firefox/Safari (dev-tools emulation OK); Chromium
  unchanged; reduced-motion shows everything instantly; no console/CSP errors.

### T2.3 Replace sirv with a dependency-free Node server

- Files: new `server.mjs` (repo root), `package.json` (start/serve scripts,
  remove `sirv-cli` dep), `railway.json` (startCommand `node server.mjs`),
  delete `public/_headers` (server becomes the single source of truth for
  headers — port every directive from it).
- Behavior: serve `dist/`; correct MIME types; `/_astro/*` + `*.woff2` →
  `Cache-Control: public, max-age=31536000, immutable`; HTML → `no-cache`;
  security headers from `_headers` (HSTS, nosniff, DENY, Referrer-Policy,
  Permissions-Policy, COOP); unknown paths → 404.html with status 404;
  directory URLs resolve `index.html`; reject path traversal.
- Accept: `npm run build && npm start` then curl checks: `/` 200 with security
  headers; `/_astro/<any>` has immutable cache; `/nope` returns 404 status +
  404.html body; `/about/` serves the page.

### T2.4 Remove placeholder VideoObject schema

- Files: `src/pages/ugc.astro`.
- Emit `VideoObject` JSON-LD only for clips that have a real `src`; today that
  is none, so the built page has zero VideoObject blocks. Keep breadcrumbs.
- Accept: `dist/ugc/index.html` contains no `VideoObject`; build passes.

### T2.5 MobileMenu dialog semantics + focus management

- Files: `src/components/MobileMenu.tsx`.
- `role="dialog"` + `aria-modal="true"` + `aria-label="Menu"`; on open, focus
  the close button; trap Tab within the overlay while open; on close, return
  focus to the hamburger; Escape keeps working. Keep `inert` on closed state.
- Accept: keyboard-only walkthrough works (open → focus inside → Tab cycles →
  Esc closes → focus back on hamburger); build passes.

### T2.6 CTA contrast fix (AA)

- Files: `src/styles/global.css` (+ the components using `bg-rust` CTAs if a
  new token name is introduced).
- Introduce `--color-rust-ui: #b03e28` (≈ 4.9:1 with bone) for small-text
  button surfaces; hover may darken (e.g. rust-deep #8b2f1f) instead of
  brightening — hover must also be ≥ 4.5:1 with bone text. Large display
  usages of rust (headings ≥ 24px) may keep #c24a32. Keep the visual identity:
  same hue family, only darkened for text-bearing surfaces.
- Accept: every button/CTA text-on-rust pair ≥ 4.5:1 in default *and* hover
  states (list the computed ratios in the task report); site still reads
  ink/bone/rust.

### T2.7 Small a11y + SEO fixes (one pass)

- Files: `src/pages/ugc.astro`, `src/components/InquiryForm.tsx`,
  `src/components/Footer.astro`, `src/components/Seo.astro`,
  `src/data/schema.ts`, `src/pages/work-with-me.astro`.
- Fixes: `scroll-mt-24` on `#packages`; InquiryForm success block gets
  `role="status"` and programmatic focus; footer year = `new Date().getFullYear()`
  (build-time); add `og:image:alt` meta; add `WebSite` schema (name, url) on
  home; add `image` to `personSchema`; wrap ✓/✕ glyphs in `aria-hidden` spans.
- Accept: build passes; each fix verifiable in `dist/` output.

### T2.8 Font loading cleanup

- Files: `src/styles/global.css`, possibly `src/layouts/Base.astro`.
- Trim to needed subsets/weights: import per-subset fontsource CSS
  (`/400.css`-style latin-only paths) for Archivo and Fraunces instead of the
  all-subset variable imports if the copy is latin-only; drop the Fraunces
  italic file if italic usage can be covered by the normal file's `slnt`/faux —
  the About/Career pull-quotes use italic, so keep italic **only if** used
  (about.astro pull-quote uses `italic`; career quote does not — keep italic,
  drop Vietnamese subsets). Preload the two above-the-fold fonts (Anton latin,
  Archivo latin) in `Base.astro` head.
- Accept: built font count drops (no vietnamese/latin-ext files in dist unless
  referenced); hero text renders identically; Lighthouse font-display warnings
  absent; build passes.

## Phase 3 — Motion system (builder)

### T3.1 Install Motion + animated MobileMenu

- Files: `package.json` (add `motion`), `src/components/MobileMenu.tsx`.
- Rebuild open/close with `motion/react` per MOTION.md §4.2 (backdrop fade
  `--dur-base`, items fade-up 1rem, 70ms stagger, reverse close at
  `--dur-fast`, tween with `EASE`). `useReducedMotion()` → instant states.
  Must preserve T2.5 focus behavior exactly.
- Accept: build passes; menu animates per spec in browser; reduced-motion
  emulation gives instant open/close; focus behavior unchanged.

### T3.2 InquiryForm state transitions

- Files: `src/components/InquiryForm.tsx`.
- Crossfade + rise between idle/sending/success/error per MOTION.md §4.2, no
  layout jump; keep `role="status"`/focus from T2.7; `useReducedMotion()`
  fallback.
- Accept: build passes; mailto fallback path (no key) still works; success
  swap has no visible layout jump.

### T3.3 Hero load choreography + reveal polish

- Files: `src/styles/global.css`, the five page heroes
  (`index/career/about/ugc/work-with-me.astro`).
- CSS-only load stagger per MOTION.md §4.3 (hero elements drop `data-reveal`,
  gain the load animation); apply `data-reveal-group` stagger to the stat
  grids (home §c, ugc media kit), card grids (packages, tiers, values), and
  brand strips.
- Accept: hero animates once on load in all browsers; scroll reveals below the
  fold unchanged; reduced-motion = everything instantly visible; no
  double-animation of hero elements.

### T3.4 Media hover conformance

- Files: `src/components/InstagramGrid.tsx`, `src/components/VideoFrame.astro`,
  `src/styles/global.css`.
- Bring hover effects onto tokens: IG zoom → `--dur-slow`, scale cap 1.05;
  play button scale 1.1 → 1.05 at `--dur-base`; gate all hover *transforms*
  behind `prefers-reduced-motion: no-preference` (fixes inventory #6/#8).
- Accept: build passes; reduced-motion emulation shows no scale movement
  anywhere; hovers use only token values.

## Phase 4 — Imagery (architect generates, builder wires)

### T4.1 [ARCHITECT] Generate the image set with Higgsfield

Editorial, dark, warm, high-contrast, film-grain aesthetic matching
ink/bone/rust. Slots: home hero (full-bleed, ~3:4 crop-safe), home portrait
5:4, home coaching 4:5, about portrait 4:5, wwm hero 4:5, wwm results ×3 4:5,
career timeline ×6 4:3. Output to `src/assets/`. Not a builder task.

### T4.2 Frame accepts real images

- Files: `src/components/Frame.astro`.
- Add optional `src` (ImageMetadata) + `alt` props; when present render
  `astro:assets` `<Image>` (correct ratio class, cover) with the grain/ring
  overlays kept as a stylistic layer; placeholder path unchanged when absent.
  Hero usage must support `loading="eager"` + `fetchpriority="high"` via prop.
- Accept: build passes with and without `src`; no CLS (width/height emitted);
  placeholder rendering byte-identical when `src` absent.

### T4.3 Wire images: home page

- Files: `src/pages/index.astro` (+ assets from T4.1).
- Hero eager/high-priority; portrait + coaching lazy. Meaningful `alt` text
  (athlete/scene description, no "image of").
- Accept: build passes; hero LCP element is the image; below-fold images lazy.

### T4.4 Wire images: career, about, work-with-me

- Files: `src/pages/career.astro`, `src/pages/about.astro`,
  `src/pages/work-with-me.astro`.
- All lazy except the wwm hero frame (visible above fold → eager on that page
  only). Same alt-text standard.
- Accept: build passes; every Frame on these pages shows a real image.

## Phase 5 — Review gate (architect)

- Full-site pass in browser: golden path + keyboard nav + reduced-motion +
  Firefox emulation; Lighthouse (target ≥ 95 a11y/SEO, ≥ 90 perf); verify
  headers via `npm start` + curl. Fix list feeds back into builder tasks.

## Phase 6 — Launch content (owner/user tasks — not builder work)

| Item | Where |
| --- | --- |
| Real Calendly/Typeform application URL | `src/data/site.ts` `applyUrl` |
| Web3Forms access key | `src/data/site.ts` `web3formsKey` |
| 2+ real attributed testimonials | `src/data/site.ts` `testimonials` |
| Real media-kit stats (followers, avg views, geo/age) | `src/pages/ugc.astro` `stats` |
| Exact certification names | `src/pages/about.astro` credentials |
| 3–6 real UGC clips (mp4 + poster) → re-enable VideoObject schema with real dates | `src/pages/ugc.astro` |
| Behold feed id for live Instagram (optional) | `index.astro` `beholdFeedId` |
| Replace Higgsfield placeholders with real photography (rolling) | `src/assets/` |
