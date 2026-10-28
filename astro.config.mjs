// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { readdirSync, readFileSync } from 'node:fs';
import { baseUrls } from './src/lib/base-urls.mjs';

// Where the site is served. The deploy workflow passes the outputs of
// actions/configure-pages: PAGES_BASE_URL (such as
// https://freakling.github.io/saemundsson.se) and PAGES_BASE_PATH (such as
// /saemundsson.se, empty once the custom domain is set). Without them (a local
// build, or CI before Pages is enabled) the site builds for https://saemundsson.se
// at the root. Canonical URLs always use https://saemundsson.se (src/lib/site.ts).
const baseUrl = process.env.PAGES_BASE_URL || 'https://saemundsson.se';
const basePath = (process.env.PAGES_BASE_PATH || '').replace(/\/+$/, '');
const site = new URL(baseUrl).origin;
const base = basePath ? `${basePath}/` : '/';

// Pages that only redirect elsewhere stay out of the sitemap.
const pagesDir = new URL('./src/content/pages/', import.meta.url);
const redirectPaths = new Set(
  readdirSync(pagesDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readFileSync(new URL(f, pagesDir), 'utf8'))
    .filter((md) => /^redirect:/m.test(md))
    .map((md) => md.match(/^permalink:\s*(\S+)/m)?.[1])
    .filter(Boolean),
);

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.slice(basePath.length);
        return !/^\/(?:404|drafts)\//.test(path) && !redirectPaths.has(path);
      },
    }),
  ],
  markdown: {
    // rawHtml: raw HTML in posts (figures, images with their size, embeds) becomes
    // real nodes, so the base-path plugin reaches its URLs too.
    processor: satteri({ features: { rawHtml: true }, hastPlugins: [baseUrls(base)] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
});
