// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Update this to the production domain once it is live.
const SITE = 'https://jelaniwoods.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  experimental: {
    // Hash-based Content-Security-Policy injected as a <meta> tag. Astro
    // auto-hashes its inline island-hydration scripts and inlined styles, so we
    // avoid 'unsafe-inline' for scripts. Extra sources below cover the Behold
    // Instagram feed (fetch + CDN images) and an optional Calendly embed.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://feeds.behold.so https://api.web3forms.com",
        "frame-src https://calendly.com",
        "base-uri 'self'",
        "form-action 'self' https://api.web3forms.com",
        "object-src 'none'",
      ],
    },
  },
});
