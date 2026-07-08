# Remaining work

Status: Phases 1–4 of PLAN.md are complete and deployed (placeholder imagery
wired, motion system done, heroes eager-loaded). What's left before launch:

## Phase 5 — Manual review pass (in browser)

Scriptable checks already done: security headers (X-Frame-Options, nosniff,
Referrer-Policy, Permissions-Policy, HSTS, COOP) verified via `npm start` +
curl; custom 404 returns a real 404; hash-based CSP meta present in built HTML.

Still needs a human in a browser:

- [ ] Golden path: home → work-with-me → apply CTA; home → ugc → inquiry form
      (mailto fallback fires with no Web3Forms key).
- [ ] Keyboard nav: mobile menu (focus moves to close button, Tab trap,
      Escape closes, focus returns to hamburger), skip link, form fields.
- [ ] Reduced-motion emulation: hero load stagger, scroll reveals, menu,
      form swaps, and all hovers show zero movement — content instantly visible.
- [ ] Firefox/Safari: IO reveal fallback + `data-reveal-group` stagger works.
- [ ] Lighthouse: target ≥ 95 a11y/SEO, ≥ 90 perf on home + work-with-me.
- [ ] No console or CSP errors on any page.

## Phase 6 — Launch content (owner tasks)

| Item | Where |
| --- | --- |
| Real Calendly/Typeform application URL | `src/data/site.ts` `applyUrl` |
| Web3Forms access key | `src/data/site.ts` `web3formsKey` |
| 2+ real attributed testimonials | `src/data/site.ts` `testimonials` |
| Real media-kit stats (followers, avg views, geo/age) | `src/pages/ugc.astro` `stats` |
| Exact certification names | `src/pages/about.astro` credentials |
| 3–6 real UGC clips (mp4 + poster) → re-enable VideoObject schema | `src/pages/ugc.astro` |
| Behold feed id for live Instagram (optional) | `src/pages/index.astro` `beholdFeedId` |
| Replace Higgsfield placeholders with real photography (rolling) | `src/assets/placeholders/` |
