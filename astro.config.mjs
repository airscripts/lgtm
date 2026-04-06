// @ts-check
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lgtm.airscript.it',
  output: 'static',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  adapter: vercel({ webAnalytics: { enabled: false } }),
});
