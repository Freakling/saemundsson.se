#!/usr/bin/env node
// Makes the list thumbnails: for each post's featured image (`image:` in its
// frontmatter), a 480px-wide WebP at public/thumbs/<same path>.webp, which
// thumbFor() in src/lib/site.ts points at. Runs before every dev and build;
// a thumbnail newer than its image is kept. public/thumbs/ is gitignored.

import { mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const UPLOADS = '/wp-content/uploads/';
const mtime = (p) => stat(p).then((s) => s.mtimeMs, () => 0);

let made = 0;
for (const dir of ['src/content/posts', 'drafts']) {
  const files = await readdir(join(ROOT, dir)).catch(() => []);
  for (const f of files.filter((n) => n.endsWith('.md'))) {
    const image = (await readFile(join(ROOT, dir, f), 'utf8')).match(/^image: *"?([^"\n]+?)"? *$/m)?.[1];
    if (!image?.startsWith(UPLOADS)) continue;
    const src = join(PUBLIC, image);
    const out = join(PUBLIC, 'thumbs', image.slice(UPLOADS.length).replace(/\.[a-z]+$/i, '.webp'));
    const age = await mtime(src);
    if (!age) throw new Error(`${dir}/${f}: image ${image} not found in public/`);
    if ((await mtime(out)) > age) continue;
    await mkdir(dirname(out), { recursive: true });
    await sharp(src).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    made++;
  }
}
console.log(`Thumbnails: ${made} made`);
