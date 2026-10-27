#!/usr/bin/env node
// Turns a draft in drafts/ into a published post.
//
//   npm run promote -- drafts/<file>.md [--date YYYY-MM-DD]
//
// - date: --date, or today (local time); modified: now.
// - slug: the draft's `slug` if it has one, else the file name, else the title.
// - permalink: /YYYY/MM/DD/<slug>/, the same frontmatter shape as imported posts.
// - Images the draft references from drafts/ (Markdown, HTML or the `image`
//   field) move to public/images/YYYY/MM/ and the links become
//   /images/YYYY/MM/<file> (the site adds its base path at build time).
// - The post is written to src/content/posts/<slug>.md and the draft is removed.
// It refuses, and changes nothing, if the slug, the permalink or an image's
// target already exists.

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRAFTS = join(ROOT, 'drafts');
const POSTS = join(ROOT, 'src', 'content', 'posts');

function die(msg) {
  console.error(`promote: ${msg}`);
  process.exit(1);
}

/** Lower-case ASCII slug, the way WordPress makes them. */
function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const pad = (n) => String(n).padStart(2, '0');

/** An ISO timestamp with the machine's UTC offset, such as 2026-10-27T09:30:00+01:00. */
function isoLocal(d) {
  const off = -d.getTimezoneOffset();
  const sign = off < 0 ? '-' : '+';
  const abs = Math.abs(off);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--date');
  const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : undefined;
  if (!file) die('usage: npm run promote -- drafts/<file>.md [--date YYYY-MM-DD]');

  const draftPath = resolve(ROOT, file);
  if (!draftPath.startsWith(DRAFTS + sep)) die(`${file} is not in drafts/`);
  if (!existsSync(draftPath)) die(`${file} not found`);

  const source = await readFile(draftPath, 'utf8');
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) die(`${file} has no frontmatter (it needs at least a title)`);
  const fm = parse(m[1]) ?? {};
  let body = m[2];
  if (!fm.title || typeof fm.title !== 'string') die(`${file} has no title`);

  // Date: --date (at the current time of day) or now.
  const now = new Date();
  let date = now;
  if (dateArg) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateArg)) die(`--date must be YYYY-MM-DD, not ${dateArg}`);
    const [y, mo, d] = dateArg.split('-').map(Number);
    date = new Date(y, mo - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
    if (date.getMonth() !== mo - 1) die(`--date ${dateArg} is not a real date`);
  }
  const y = String(date.getFullYear());
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  const slug = slugify(fm.slug || basename(draftPath, extname(draftPath))) || slugify(fm.title);
  if (!slug) die('could not derive a slug from the file name or the title');
  const permalink = `/${y}/${mo}/${d}/${slug}/`;

  // Refuse duplicates: the file, any post's slug, any post's permalink.
  const target = join(POSTS, `${slug}.md`);
  if (existsSync(target)) die(`src/content/posts/${slug}.md already exists`);
  for (const f of (await readdir(POSTS)).filter((f) => f.endsWith('.md'))) {
    const text = await readFile(join(POSTS, f), 'utf8');
    if (new RegExp(`^slug:\\s*["']?${slug}["']?\\s*$`, 'm').test(text)) die(`slug "${slug}" is already used by ${f}`);
    if (text.includes(`permalink: ${permalink}`)) die(`permalink ${permalink} is already used by ${f}`);
  }

  // Images from drafts/: Markdown ![](x), HTML src="x", and the image field.
  const imageDir = join(ROOT, 'public', 'images', y, mo);
  const moves = new Map(); // draft file -> new URL
  const localImage = (ref) => {
    if (!ref || /^(?:[a-z]+:|\/|#)/i.test(ref)) return null;
    const clean = decodeURI(ref.split(/[?#]/)[0]);
    const abs = resolve(dirname(draftPath), clean);
    if (!abs.startsWith(DRAFTS + sep) || !existsSync(abs)) return null;
    return abs;
  };
  const plan = (ref) => {
    const abs = localImage(ref);
    if (!abs) return ref;
    if (!moves.has(abs)) moves.set(abs, `/images/${y}/${mo}/${basename(abs)}`);
    return moves.get(abs);
  };
  body = body
    .replace(/(!\[[^\]]*\]\()(<[^>]+>|[^)\s]+)((?:\s+"[^"]*")?\))/g, (_all, pre, ref, post) => pre + plan(ref.replace(/^<|>$/g, '')) + post)
    .replace(/(\s(?:src|href)=")([^"]+)(")/g, (_all, pre, ref, post) => pre + plan(ref) + post)
    .replace(/(\]\()([^)\s]+\.(?:png|jpe?g|gif|webp|avif|svg))(\))/gi, (_all, pre, ref, post) => pre + plan(ref) + post);
  if (typeof fm.image === 'string') fm.image = plan(fm.image);
  for (const url of moves.values()) {
    const dest = join(ROOT, 'public', ...url.split('/').filter(Boolean));
    if (existsSync(dest)) die(`${relative(ROOT, dest)} already exists (rename the image in drafts/)`);
  }

  // The post, in the imported posts' frontmatter shape.
  const post = {
    title: fm.title,
    date: isoLocal(date),
    modified: isoLocal(now > date ? now : date),
    slug,
    permalink,
    ...(fm.description ? { description: fm.description } : {}),
    categories: Array.isArray(fm.categories) ? fm.categories.map(slugify) : [],
    tags: Array.isArray(fm.tags) ? fm.tags.map(slugify) : [],
    ...(fm.image ? { image: fm.image, imageAlt: fm.imageAlt ?? '' } : {}),
  };

  await mkdir(imageDir, { recursive: true });
  for (const [abs, url] of moves) await rename(abs, join(ROOT, 'public', ...url.split('/').filter(Boolean)));
  await writeFile(target, `---\n${stringify(post, { lineWidth: 0 })}---\n\n${body.replace(/^\s+/, '')}`);
  await rm(draftPath);

  console.log(`Published ${relative(ROOT, target)} at ${permalink}`);
  for (const [abs, url] of moves) console.log(`  moved ${relative(ROOT, abs)} -> public${url}`);
  console.log('Build with `npm run build`, then commit and push to deploy.');
}

main().catch((e) => die(e.message));
