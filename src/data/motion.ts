// JS mirrors of the CSS motion tokens in src/styles/global.css — keep in sync.
// Motion (motion/react) uses seconds; the CSS uses ms. Same numbers, different units.
export const EASE = [0.16, 1, 0.3, 1] as const;
export const DUR = { fast: 0.2, base: 0.4, slow: 0.7, reveal: 0.6 } as const;
