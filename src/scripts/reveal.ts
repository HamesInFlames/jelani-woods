/*
 * IntersectionObserver reveal fallback for non-Chromium browsers.
 *
 * Chromium supports `animation-timeline: view()` and runs the scroll-scrubbed
 * reveal in global.css. Safari/Firefox do not, so this script drives a
 * time-based reveal instead. It must NEVER run alongside the scroll-driven
 * version (no double-animation) and must NEVER hide content unless it is the
 * one gating that hidden state — so elements stay visible for JS-disabled users
 * and before this script executes.
 *
 * FOUC guard: the script adds `reveal-io` to <html> as its first action. CSS
 * only hides `[data-reveal]` under `.reveal-io ... :not(.is-revealed)`, so the
 * hidden initial state exists only once JS has both loaded and confirmed the
 * fallback should run.
 */

const root = document.documentElement;

const supportsScrollTimeline =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline: view()');

const prefersReducedMotion =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

// Chromium keeps its scroll-scrubbed reveal; reduced-motion users see content
// immediately with no observer. In both cases leave the DOM untouched so the
// `.reveal-io` gating class is never applied and nothing is hidden.
if (!supportsScrollTimeline && !prefersReducedMotion) {
  // Gate the hidden initial state before observing anything.
  root.classList.add('reveal-io');

  const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        }
      },
      // Edge-based trigger (element top crosses 15% above the viewport
      // bottom) instead of a ratio threshold: elements taller than ~5× the
      // viewport can never reach a 0.2 intersectionRatio and would stay
      // hidden forever.
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // No IntersectionObserver support: reveal everything rather than trap it
    // behind the hidden `.reveal-io` state.
    revealEls.forEach((el) => el.classList.add('is-revealed'));
  }
}

export {};
