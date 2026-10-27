#!/usr/bin/env node
// Exports the public WordPress site at https://saemundsson.se into import/ (JSON)
// and downloads every upload the content or the featured media references into
// public/wp-content/uploads/, keeping the original paths.
//
// Read-only: it uses only the public REST API (no credentials) and plain GETs,
// one request at a time. Rerunning it refreshes the JSON and skips images that
// are already on disk (pass --force to download them again).
//
// Usage: node tools/export-wordpress.mjs [--force] [--no-images]

import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://saemundsson.se';
const API = `${ORIGIN}/wp-json/wp/v2`;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMPORT_DIR = join(ROOT, 'import');
const PUBLIC_DIR = join(ROOT, 'public');
const USER_AGENT = 'saemundsson.se-static-export/1.0 (read-only migration script)';
const PAUSE_MS = 250;

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const NO_IMAGES = args.has('--no-images');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, { binary = false } = {}) {
  const attempts = 4;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    await sleep(PAUSE_MS);
    if (res.ok) return { res, body: binary ? Buffer.from(await res.arrayBuffer()) : await res.json() };
    if (res.status === 404 || attempt === attempts) {
      throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    }
    // 429 and 503 are the host asking us to slow down: back off for longer.
    const retryAfter = Number(res.headers.get('retry-after')) || 0;
    await sleep(Math.max(retryAfter * 1000, (res.status === 429 || res.status === 503 ? 10000 : 1000) * attempt));
  }
  throw new Error('unreachable');
}

/** Every item of a collection, following X-WP-TotalPages. */
async function getAll(endpoint, query = '') {
  const items = [];
  let page = 1;
  let totalPages = 1;
  do {
    const sep = query ? `&${query}` : '';
    const { res, body } = await get(`${API}/${endpoint}?per_page=100&page=${page}${sep}`);
    totalPages = Number(res.headers.get('x-wp-totalpages') || '1');
    items.push(...body);
    page++;
  } while (page <= totalPages);
  return items;
}

const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));

// --- uploads referenced by HTML -------------------------------------------

const UPLOAD_RE = /^(?:https?:)?\/\/(?:www\.)?saemundsson\.se(\/wp-content\/uploads\/[^\s"'?#)]+)/i;

function uploadPath(url) {
  if (!url) return null;
  const m = String(url).trim().match(UPLOAD_RE);
  if (m) return decodeURI(m[1]);
  if (String(url).startsWith('/wp-content/uploads/')) return decodeURI(String(url).split(/[?#]/)[0]);
  return null;
}

/** Largest candidate of a srcset (by w descriptor, else x descriptor). */
function largestSrcset(srcset) {
  let best = null;
  let bestSize = -1;
  for (const part of srcset.split(',')) {
    const [u, d = '1x'] = part.trim().split(/\s+/);
    if (!u) continue;
    const size = parseFloat(d) * (d.endsWith('w') ? 1 : 10000);
    if (size > bestSize) { best = u; bestSize = size; }
  }
  return best;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]).replace(/&amp;/g, '&') : null;
};

/** Upload paths an HTML fragment references: img src, the largest srcset entry, and links to uploads. */
function referencedUploads(html) {
  const found = new Set();
  for (const [tag] of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    const src = uploadPath(attr(tag, 'src'));
    if (src) found.add(src);
    const srcset = attr(tag, 'srcset');
    if (srcset) {
      const big = uploadPath(largestSrcset(srcset));
      if (big) found.add(big);
    }
  }
  // Links straight to an upload (a full-size image behind a thumbnail, a PDF):
  // their rewritten links must keep working too.
  for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = uploadPath(attr(tag, 'href'));
    if (href) found.add(href);
  }
  // Upload URLs written as plain text, which the conversion turns into links.
  const text = html.replace(/<[^>]*>/g, ' ');
  for (const [url] of text.matchAll(/https?:\/\/(?:www\.)?saemundsson\.se\/wp-content\/uploads\/[^\s<"']+/gi)) {
    const p = uploadPath(url);
    if (p) found.add(p);
  }
  return found;
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function main() {
  await mkdir(IMPORT_DIR, { recursive: true });

  console.log('Site info');
  const { body: site } = await get(`${ORIGIN}/wp-json/`);
  const siteInfo = pick(site, ['name', 'description', 'url', 'home', 'gmt_offset', 'timezone_string']);

  console.log('Posts');
  const postsRaw = await getAll('posts', 'status=publish&orderby=date&order=desc');
  console.log('Pages');
  const pagesRaw = await getAll('pages', 'status=publish&orderby=menu_order&order=asc');
  console.log('Categories, tags, authors');
  const categories = (await getAll('categories')).map((c) => pick(c, ['id', 'name', 'slug', 'description', 'count', 'parent', 'link']));
  const tags = (await getAll('tags')).map((t) => pick(t, ['id', 'name', 'slug', 'description', 'count', 'link']));
  let authors = [];
  try {
    authors = (await getAll('users')).map((u) => pick(u, ['id', 'name', 'slug', 'description', 'link']));
  } catch (e) {
    console.warn(`  authors not public: ${e.message}`);
  }

  const keepPost = (p) => ({
    id: p.id,
    date: p.date,
    date_gmt: p.date_gmt,
    modified: p.modified,
    modified_gmt: p.modified_gmt,
    slug: p.slug,
    link: p.link,
    type: p.type,
    title: p.title?.rendered ?? '',
    excerpt: p.excerpt?.rendered ?? '',
    content: p.content?.rendered ?? '',
    author: p.author,
    categories: p.categories ?? [],
    tags: p.tags ?? [],
    featured_media: p.featured_media ?? 0,
    parent: p.parent ?? 0,
    menu_order: p.menu_order ?? 0,
    comment_status: p.comment_status,
    format: p.format,
    sticky: p.sticky,
  });
  const posts = postsRaw.map(keepPost);
  const pages = pagesRaw.map(keepPost);

  // Pages that a plugin redirects elsewhere (the REST API doesn't show it):
  // ask for each page without following redirects and keep the target.
  console.log('Page redirects');
  for (const page of pages) {
    const res = await fetch(page.link, { redirect: 'manual', headers: { 'User-Agent': USER_AGENT } });
    await res.arrayBuffer();
    await sleep(PAUSE_MS);
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      const target = new URL(location, page.link).href;
      if (target !== page.link) page.redirect = target;
    }
  }

  console.log('Featured media and linked attachments');
  // Featured images, plus attachment pages the content links to (?attachment_id=N),
  // which the conversion points at the file itself.
  const attachmentIds = [...posts, ...pages].flatMap((p) => [...p.content.matchAll(/[?&](?:amp;)?attachment_id=(\d+)/g)].map((m) => Number(m[1])));
  const mediaIds = [...new Set([...[...posts, ...pages].map((p) => p.featured_media), ...attachmentIds].filter(Boolean))];
  const media = [];
  for (let i = 0; i < mediaIds.length; i += 100) {
    const chunk = mediaIds.slice(i, i + 100);
    media.push(...(await getAll('media', `include=${chunk.join(',')}`)));
  }
  const mediaOut = media.map((m) => ({
    id: m.id,
    source_url: m.source_url,
    alt_text: m.alt_text ?? '',
    mime_type: m.mime_type,
    width: m.media_details?.width ?? null,
    height: m.media_details?.height ?? null,
    title: m.title?.rendered ?? '',
  }));

  const write = (name, data) => writeFile(join(IMPORT_DIR, name), JSON.stringify(data, null, 2) + '\n');
  await write('site.json', siteInfo);
  await write('posts.json', posts);
  await write('pages.json', pages);
  await write('categories.json', categories);
  await write('tags.json', tags);
  await write('authors.json', authors);
  await write('media.json', mediaOut);
  console.log(`Exported ${posts.length} posts, ${pages.length} pages, ${categories.length} categories, ${tags.length} tags, ${authors.length} authors, ${mediaOut.length} media items`);

  // --- images -------------------------------------------------------------
  const uploads = new Set();
  for (const item of [...posts, ...pages]) {
    for (const u of referencedUploads(item.content)) uploads.add(u);
    for (const u of referencedUploads(item.excerpt)) uploads.add(u);
  }
  for (const m of mediaOut) {
    const u = uploadPath(m.source_url);
    if (u) uploads.add(u);
  }
  const list = [...uploads].sort();
  const failures = [];
  let downloaded = 0;
  let bytes = 0;
  if (!NO_IMAGES) {
    console.log(`Uploads: ${list.length} referenced`);
    for (const path of list) {
      const target = join(PUBLIC_DIR, ...path.split('/').filter(Boolean));
      if (!FORCE && (await exists(target))) {
        bytes += (await readFile(target)).length;
        continue;
      }
      try {
        const { body } = await get(ORIGIN + encodeURI(path), { binary: true });
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, body);
        downloaded++;
        bytes += body.length;
        process.stdout.write('.');
      } catch (e) {
        failures.push({ path, error: e.message });
      }
    }
    process.stdout.write('\n');
  }
  await write('uploads.json', { referenced: list, failures });
  console.log(`Uploads: ${list.length} referenced, ${downloaded} downloaded now, ${(bytes / 1048576).toFixed(1)} MB on disk, ${failures.length} failed`);
  for (const f of failures) console.warn(`  FAILED ${f.path}: ${f.error}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
