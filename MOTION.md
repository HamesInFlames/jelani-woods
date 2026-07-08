# MOTION.md — Motion Design Spec

Single source of truth for every animation on the site. The builder must not
introduce durations, easings, or patterns that are not defined here.

## 1. Architecture decision (settled)

**CSS + Motion complement each other. Motion does not replace the CSS reveals.**

- **Static Astro content** (sections, headings, frames): CSS scroll-driven
  reveals (`animation-timeline: view()`) where supported, with an
  IntersectionObserver fallback for Safari/Firefox. Zero React cost on static
  pages.
- **React islands** (`MobileMenu`, `InquiryForm`, `InstagramGrid`): use the
  **Motion** library (`motion/react`). Nothing else (no framer-motion import
  path, no GSAP, no hand-rolled rAF).
- Page-load hero choreography is CSS keyframes (static pages must not hydrate
  just to animate).

## 2. Easing — one curve site-wide

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1); /* strong ease-out ("expo out") */
```

This is the curve already used by `.link-underline` in `global.css`, promoted
to the site-wide standard.

- **All** transitions and entrance animations use `var(--ease-out)`.
- Scroll-driven reveals keep `linear` **only** because their progress is bound
  to scroll position (`animation-timeline`) — scrubbing an eased curve feels
  broken. The IO fallback (time-based) uses `var(--ease-out)`.
- In Motion (JS), the same curve is `ease: [0.16, 1, 0.3, 1]`. Use tweens, not
  springs, so CSS and JS motion feel identical.
- Exit/close animations may reverse direction but keep the same curve.

## 3. Duration scale

```css
--dur-fast: 200ms;   /* color, opacity, border micro-feedback */
--dur-base: 400ms;   /* link underlines, cards, menu overlay, form states */
--dur-slow: 700ms;   /* large-surface moves: image scale, full-screen panel */
--dur-reveal: 600ms; /* IO-fallback reveal tween, hero load choreography */
```

Mapping from today's ad-hoc values → tokens:

| Current | Where | Becomes |
| --- | --- | --- |
| 150ms Tailwind default (`transition-colors`) | nav links, buttons | `--dur-fast` |
| 300ms (`duration-300`) | menu overlay, IG hover ring/overlay, play button | `--dur-base` for surfaces, `--dur-fast` for color-only |
| 400ms | `.link-underline` | `--dur-base` |
| 700ms (`duration-700`) | IG image hover scale | `--dur-slow` |

No raw millisecond values in components. Tailwind arbitrary values reference
tokens (e.g. `duration-[var(--dur-fast)] ease-[var(--ease-out)]`), or the
effect lives in `global.css` using the variables.

## 4. Reveal patterns

### 4.1 `data-reveal` (scroll reveal, static content)

- **fade** (`data-reveal`): opacity 0 → 1.
- **fade-up** (`data-reveal="up"`): opacity 0 → 1, `translateY(2.5rem)` → 0.
- Scroll-driven range stays `entry 5% cover 32%`.
- IO fallback: same start/end values, `--dur-reveal` + `--ease-out`, triggered
  at ~20% element visibility, plays once, never reverses.
- **Stagger** (`data-reveal-group` on a parent): children delay 70ms × index,
  capped at 350ms (index 5+ share the cap). For stat grids, card grids, lists.

### 4.2 Motion island patterns

- **Overlay/panel enter** (MobileMenu): backdrop opacity 0 → 1 at `--dur-base`;
  nav items fade-up 1rem with 70ms stagger; close reverses at `--dur-fast`.
- **State swap** (InquiryForm idle → sending → success): crossfade + 0.5rem
  rise, `--dur-base`. No layout jumps — reserve height or animate height with
  the same tween.
- **Media hover** (InstagramGrid, VideoFrame): scale 1 → 1.05 max, `--dur-slow`.
  Never scale above 1.05; never animate blur/filters.

### 4.3 Hero page-load choreography (CSS keyframes)

Eyebrow → H1 → lede → CTA row: fade-up 1.5rem, `--dur-reveal`, `--ease-out`,
80ms stagger between elements. Runs once on load, only on above-the-fold hero
elements, so it cannot double-fire with scroll reveals (hero elements drop
`data-reveal` and use the load animation instead).

## 5. Reduced-motion rules (non-negotiable)

Under `@media (prefers-reduced-motion: reduce)`:

1. All entrance/reveal animations disabled — content simply visible (already
   true for `data-reveal`; must stay true for the IO fallback and hero
   choreography).
2. No transform animations of any kind (no translate, no scale — including
   hover scale on images/play buttons). Color and opacity transitions at
   `--dur-fast` remain allowed.
3. `scroll-behavior: auto` (already in place — keep it).
4. In Motion islands, gate with `useReducedMotion()` from `motion/react`:
   render final state instantly or animate opacity-only at `--dur-fast`.
5. The mobile menu must still open/close instantly and remain fully usable.

## 6. Accessibility invariants for animated UI

- Animation never delays interactivity: buttons/links are clickable at
  animation start, not end.
- Focus management is independent of animation (focus moves immediately on
  open/close, even mid-transition).
- Nothing flashes more than 3 times per second; no parallax on body text.

## 7. Token home

CSS tokens (`--ease-out`, `--dur-*`) are defined once in
`src/styles/global.css`. Motion islands import the same numbers from
`src/data/motion.ts` (exports `EASE` and `DUR` constants mirroring the CSS
values) so JS and CSS can never drift.
