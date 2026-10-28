#!/usr/bin/env node
// Checks a built dist/ against the WordPress export and the site's rules:
// - every post and page from import/ exists at its WordPress path, except the retired ones;
// - /cv/ redirects to the CV, as it did on WordPress;
// - the feeds, sitemap, robots.txt, 404 page and every category and tag archive exist;
// - no HTML links to saemundsson.se/wp-content or saemundsson.se/20.. remain,
//   except the canonical, Open Graph and Twitter tags;
// - every internal link and image the HTML references exists in dist/, under the base.
//
// Usage: node tools/verify-dist.mjs [--base /saemundsson.se/]
// (PAGES_BASE_PATH is read too, so it matches the build's environment.)

import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const argBase = process.argv.indexOf('--base');
const rawBase = argBase > -1 ? process.argv[argBase + 1] : process.env.PAGES_BASE_PATH || '/';
const base = `/${rawBase.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');

// WordPress pages the new site drops on purpose.
const RETIRED = new Set(['/xenit-se-blog/']);

const errors = [];
const fail = (msg) => errors.push(msg);
const exists = async (p) => stat(p).then(() => true, () => false);
const load = async (name) => JSON.parse(await readFile(join(ROOT, 'import', name), 'utf8'));

/** The file in dist/ that serves a URL path under the base, or null when it's outside the base. */
function fileFor(urlPath) {
  if (!urlPath.startsWith(base)) return null;
  let p = decodeURIComponent(urlPath.slice(base.length - 1));
  if (p.endsWith('/')) p += 'index.html';
  return join(DIST, ...p.split('/').filter(Boolean));
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

async function main() {
  if (!(await exists(DIST))) throw new Error('dist/ not found: run npm run build first');
  const [posts, pages, categories, tags] = await Promise.all(['posts.json', 'pages.json', 'categories.json', 'tags.json'].map(load));

  // 1. Posts and pages at their WordPress paths.
  let found = 0;
  const kept = [...posts, ...pages].filter((item) => !RETIRED.has(new URL(item.link).pathname));
  for (const item of kept) {
    const path = new URL(item.link).pathname;
    const file = fileFor(base.replace(/\/$/, '') + path);
    if (file && (await exists(file))) {
      found++;
      const html = await readFile(file, 'utf8');
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      if (canonical !== `https://saemundsson.se${path}`) fail(`${path}: canonical is ${canonical}`);
    } else fail(`missing ${item.type} ${path}`);
  }
  console.log(`Posts and pages at their WordPress paths: ${found} of ${kept.length} (${RETIRED.size} retired)`);
  const cv = await readFile(join(DIST, 'cv', 'index.html'), 'utf8').catch(() => '');
  if (!/http-equiv="refresh" content="0; url=https:\/\/docs\.google\.com\//.test(cv)) fail('/cv/ does not redirect to the CV');

  // 2. Feeds, sitemap, robots.txt, 404 and archives.
  const required = ['feed/index.html', 'feed.xml', 'rss.xml', 'sitemap-index.xml', 'robots.txt', '404.html', 'index.html',
    ...categories.map((c) => `category/${c.slug}/index.html`),
    ...tags.map((t) => `tag/${t.slug}/index.html`)];
  for (const r of required) if (!(await exists(join(DIST, r)))) fail(`missing ${r}`);
  for (const feed of ['feed/index.html', 'feed.xml', 'rss.xml']) {
    const xml = await readFile(join(DIST, feed), 'utf8').catch(() => '');
    const items = (xml.match(/<item>/g) || []).length;
    if (!xml.startsWith('<?xml') || items < posts.length) fail(`${feed}: ${items} items, expected at least ${posts.length}`);
    const guids = (xml.match(/<guid isPermaLink="false">https:\/\/saemundsson\.se\/\?p=\d+<\/guid>/g) || []).length;
    if (guids !== posts.length) fail(`${feed}: ${guids} WordPress guids, expected ${posts.length}`);
  }
  const robots = await readFile(join(DIST, 'robots.txt'), 'utf8').catch(() => '');
  const sitemapUrl = robots.match(/^Sitemap: (\S+)/m)?.[1];
  if (!sitemapUrl || !(await exists(fileFor(new URL(sitemapUrl).pathname) ?? ''))) fail(`robots.txt names no sitemap in dist: ${sitemapUrl}`);
  console.log(`Feeds, sitemap, robots.txt, 404, ${categories.length} category and ${tags.length} tag archives: checked`);

  // 3. HTML: absolute links to the old site, and internal links and images that don't exist.
  const htmlFiles = (await walk(DIST)).filter((f) => f.endsWith('.html') && !f.endsWith(join('feed', 'index.html')));
  const allowedAbsolute = /<link rel="canonical"[^>]*>|<meta (?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/g;
  let refs = 0;
  const missing = new Set();
  for (const file of htmlFiles) {
    const rel = file.slice(DIST.length).replace(/\\/g, '/');
    const html = await readFile(file, 'utf8');
    const stripped = html.replace(allowedAbsolute, '');
    // Host-form URLs only ("//saemundsson.se/..."): the base path "/saemundsson.se/" is fine.
    for (const m of stripped.matchAll(/(?:https?:)?\/\/(?:www\.)?saemundsson\.se\/(?:wp-content|20\d\d\/)[^"'\s<]*/g)) fail(`${rel}: absolute link ${m[0]}`);
    const urls = [];
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) urls.push(m[1]);
    for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) urls.push(...m[1].split(',').map((s) => s.trim().split(/\s+/)[0]));
    for (const raw of urls) {
      const url = raw.replace(/&amp;/g, '&');
      if (!url.startsWith('/') || url.startsWith('//')) continue;
      refs++;
      const path = url.split(/[?#]/)[0];
      const target = fileFor(path);
      if (!target) fail(`${rel}: internal URL outside the base ${base}: ${url}`);
      else if (!(await exists(target))) missing.add(`${rel}: ${url}`);
    }
  }
  for (const m of missing) fail(`missing target ${m}`);
  console.log(`HTML files: ${htmlFiles.length}; internal links and images checked: ${refs}; missing: ${missing.size}`);

  if (errors.length) {
    console.error(`\n${errors.length} problem(s):`);
    for (const e of errors.slice(0, 50)) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log(`OK (base ${base})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
