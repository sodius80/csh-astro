// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.contractorsoftwarehub.com',
  cacheDir: './.astro-cache/',
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['chriss-macbook-pro-1.tail311e16.ts.net']
    }
  },

  integrations: [mdx(), sitemap()]
});
