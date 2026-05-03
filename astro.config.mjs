// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://åland.website',
  output: 'static',
  trailingSlash: 'never',

  build: {
    format: 'file',
  },

  server: {
    host: '127.0.0.1',
    port: 4321,
  },

  adapter: cloudflare()
});