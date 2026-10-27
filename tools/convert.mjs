#!/usr/bin/env node
// Converts the raw WordPress export in import/ into Markdown content:
// src/content/posts/<slug>.md, src/content/pages/<slug>.md and
// src/data/taxonomy.json (category and tag names by slug).
//
// Links to https://saemundsson.se/... that point at posts, pages, archives or
// uploads become root-relative ("/2026/10/19/slug/", "/wp-content/uploads/...");
// the site adds its base path to every root-relative URL at build time
// (src/lib/rehype-base.mjs), so the content never names the base.
//
// Usage: node tools/convert.mjs   (rerunnable; it overwrites the generated files)

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { stringify } from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMPORT_DIR = join(ROOT, 'import');
const POSTS_DIR = join(ROOT, 'src', 'content', 'posts');
const PAGES_DIR = join(ROOT, 'src', 'content', 'pages');
const DATA_DIR = join(ROOT, 'src', 'data');

const missingUploads = new Set();
const load = async (name) => JSON.parse(await readFile(join(IMPORT_DIR, name), 'utf8'));

// --- text helpers ----------------------------------------------------------

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
function decode(text) {
  return String(text)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
}
const stripTags = (html) => String(html).replace(/<[^>]*>/g, ' ');
function plainExcerpt(html) {
  return decode(stripTags(html))
    .replace(/\s*\[(?:&hellip;|…|\.\.\.)\]\s*/g, ' ')
    .replace(/\s*Continue reading.*$/s, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- URLs ------------------------------------------------------------------

const SITE_HOST_RE = /^(?:https?:)?\/\/(?:www\.)?saemundsson\.se(?=[/?#]|$)/i;

/** Builds a rewriter that turns site URLs into root-relative paths, and records the ones it can't map. */
function makeRewriter({ postsById, pagesById, knownPaths, mediaById }) {
  const unmapped = new Set();
  function rewrite(url, where) {
    if (!url) return url;
    const raw = url.trim();
    if (!SITE_HOST_RE.test(raw)) return url;
    const rest = raw.replace(SITE_HOST_RE, '') || '/';
    const u = new URL(rest, 'https://saemundsson.se');
    const path = decodeURI(u.pathname);
    const hash = u.hash;
    if (path.startsWith('/wp-content/uploads/')) return encodeURI(path);
    const p = u.searchParams.get('p');
    if (path === '/' && p && postsById.has(Number(p))) return postsById.get(Number(p)) + hash;
    const attachment = u.searchParams.get('attachment_id');
    if (path === '/' && attachment && mediaById.has(Number(attachment))) {
      return encodeURI(new URL(mediaById.get(Number(attachment)).source_url).pathname);
    }
    const pageId = u.searchParams.get('page_id');
    if (path === '/' && pageId && pagesById.has(Number(pageId))) return pagesById.get(Number(pageId)) + hash;
    const withSlash = path.endsWith('/') ? path : `${path}/`;
    if (knownPaths.has(withSlash) && !u.search) return encodeURI(withSlash) + hash;
    unmapped.add(`${where}: ${raw}`);
    return url;
  }
  return { rewrite, unmapped };
}

// --- HTML clean-up before Turndown -----------------------------------------

/**
 * Old posts put code in plain <pre> blocks without escaping it, so "<?xml",
 * "<variable>" or "<Save />" inside them would be parsed as markup and the text
 * lost (the live site loses it too). Escape every "<" inside those blocks,
 * keeping only <code> and <br>. A <pre> opened inside another one (a broken
 * paste) closes the first block, which is how browsers show it.
 */
function escapePlainPre(html) {
  let out = '';
  let i = 0;
  const open = /<pre(\s+class="lang:[^"]*")?\s*>/gi;
  while (true) {
    open.lastIndex = i;
    const m = open.exec(html);
    if (!m) { out += html.slice(i); break; }
    out += html.slice(i, m.index) + m[0];
    let start = m.index + m[0].length;
    const close = html.indexOf('</pre>', start);
    const end = close === -1 ? html.length : close;
    let body = html.slice(start, end);
    // A nested <pre> splits the block in two.
    body = body.replace(/<pre(\s[^>]*)?>/gi, '\u0000');
    body = body
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<(?!\/?code\b)/g, '&lt;')
      .replace(/\u0000/g, '</pre><pre>');
    out += body;
    i = end;
  }
  return out;
}

// --- Turndown --------------------------------------------------------------

const PS_HINT = /\$[A-Za-z_][\w:]*|\b(?:Get|Set|New|Remove|Write|Import|Invoke|Add|Test|Split|Join|Out|Select|Where|ForEach)-[A-Z][A-Za-z]+\b/;
const PS_STRONG = /\b(?:Param\s*\(|Function\s+[\w-]+|Write-Host|Get-Content|New-Object|\[CmdletBinding\(\)\]|\[Parameter\(|ForEach-Object|Where-Object)/i;

/** The fence language of a code block: an explicit class first, then a conservative PowerShell guess. */
function codeLanguage(pre, text) {
  const classes = `${pre.getAttribute('class') || ''} ${pre.querySelector('code')?.getAttribute('class') || ''}`;
  const lang = classes.match(/(?:^|\s)(?:lang:|language-|lang-)([\w+#-]+)/);
  if (lang) {
    const l = lang[1].toLowerCase();
    return { ps: 'powershell', ps1: 'powershell', shell: 'sh' }[l] ?? l;
  }
  if (PS_STRONG.test(text) || (PS_HINT.test(text) && /[{}]/.test(text))) return 'powershell';
  if (/^\s*\/[a-z-]+ /m.test(text) && !/[{};]/.test(text)) return 'text';
  return '';
}

function fence(text, lang) {
  const ticks = Math.max(2, ...[...text.matchAll(/`+/g)].map((m) => m[0].length)) + 1;
  const f = '`'.repeat(ticks);
  return `\n\n${f}${lang}\n${text.replace(/\n+$/, '')}\n${f}\n\n`;
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function makeTurndown(rewrite) {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
    hr: '---',
  });
  td.use(gfm);

  // Code blocks: keep the text exactly, with a language when one is known.
  td.addRule('pre', {
    filter: (node) => node.nodeName === 'PRE',
    replacement: (_content, node) => {
      const text = node.textContent.replace(/\r\n?/g, '\n').replace(/^\n/, '');
      return fence(text, codeLanguage(node, text));
    },
  });

  // Table cells: escape pipes and keep line breaks, which GFM tables can't hold raw.
  td.addRule('tableCellSafe', {
    filter: ['th', 'td'],
    replacement: (content, node) => {
      const index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
      const prefix = index === 0 ? '| ' : ' ';
      const cell = content.trim().replace(/\n+/g, '<br>').replace(/\|/g, '\\|');
      return `${prefix}${cell} |`;
    },
  });

  // A table wrapped in a block figure: just the table.
  td.addRule('tableFigure', {
    filter: (node) => node.nodeName === 'FIGURE' && !!node.querySelector('table'),
    replacement: (content) => `\n\n${content.trim()}\n\n`,
  });

  // Embeds stay raw HTML (YouTube and the like), without presentational attributes.
  td.addRule('iframe', {
    filter: 'iframe',
    replacement: (_content, node) => {
      const keep = ['src', 'title', 'width', 'height', 'allow', 'referrerpolicy', 'loading'];
      const attrs = keep
        .filter((a) => node.getAttribute(a))
        .map((a) => `${a}="${escapeAttr(a === 'src' ? rewrite(node.getAttribute(a), 'iframe') : node.getAttribute(a))}"`);
      if (node.hasAttribute('allowfullscreen')) attrs.push('allowfullscreen');
      return `\n\n<div class="embed"><iframe ${attrs.join(' ')}></iframe></div>\n\n`;
    },
  });

  const imgHtml = (img) => {
    const src = rewrite(img.getAttribute('src') || '', 'img');
    const attrs = [`src="${escapeAttr(src)}"`, `alt="${escapeAttr(img.getAttribute('alt') || '')}"`];
    for (const a of ['width', 'height']) if (img.getAttribute(a)) attrs.push(`${a}="${escapeAttr(img.getAttribute(a))}"`);
    attrs.push('loading="lazy"', 'decoding="async"');
    return `<img ${attrs.join(' ')}>`;
  };
  const linkWrap = (inner, a) => (a ? `<a href="${escapeAttr(rewrite(a.getAttribute('href') || '', 'a'))}">${inner}</a>` : inner);

  // Captioned images: raw <figure> HTML, since Markdown has no caption.
  // Uncaptioned figures fall through to the image (and link) rules below.
  td.addRule('figureCaption', {
    filter: (node) => node.nodeName === 'FIGURE' && !!node.querySelector('img') && !!node.querySelector('figcaption'),
    replacement: (_content, node) => {
      const img = node.querySelector('img');
      const a = img.parentNode.nodeName === 'A' ? img.parentNode : null;
      const cap = node.querySelector('figcaption');
      const capHtml = cap.innerHTML.replace(/href="([^"]*)"/g, (_m, h) => `href="${escapeAttr(rewrite(h.replace(/&amp;/g, '&'), 'figcaption'))}"`).trim();
      return `\n\n<figure>${linkWrap(imgHtml(img), a)}<figcaption>${capHtml}</figcaption></figure>\n\n`;
    },
  });
  td.addRule('figurePlain', {
    filter: (node) => node.nodeName === 'FIGURE' && !node.querySelector('figcaption') && !node.querySelector('table'),
    replacement: (content) => `\n\n${content.trim()}\n\n`,
  });

  // Images keep their size: raw <img> keeps width and height (no layout shift) and the alt text.
  td.addRule('img', {
    filter: 'img',
    replacement: (_content, node) => imgHtml(node),
  });

  // Links go through the rewriter.
  td.addRule('link', {
    filter: (node) => node.nodeName === 'A' && node.getAttribute('href'),
    replacement: (content, node) => {
      const href = rewrite(node.getAttribute('href'), 'a');
      const title = node.getAttribute('title');
      if (!content.trim()) return content;
      // A download the old site no longer has either: keep the words, drop the dead link.
      if (href.startsWith('/wp-content/uploads/') && !existsSync(join(ROOT, 'public', ...decodeURI(href).split('/').filter(Boolean)))) {
        missingUploads.add(href);
        return `${content} (file no longer available)`;
      }
      const t = title ? ` "${title.replace(/"/g, '\\"')}"` : '';
      return `[${content}](${href.replace(/ /g, '%20').replace(/\)/g, '%29')}${t})`;
    },
  });

  return td;
}

/** Upload URLs written as plain text become links named after the file. */
function linkBareUploads(html) {
  return html.replace(/(^|>)([^<]*)/g, (_m, gt, text) =>
    gt + text.replace(/https?:\/\/(?:www\.)?saemundsson\.se\/wp-content\/uploads\/[^\s<"']+/gi, (url) => `<a href="${url}">${decodeURI(url.split('/').pop())}</a>`),
  );
}

function tidy(md) {
  return md
    .split('\n')
    .map((l) => (/^[\s ]*$/.test(l) ? '' : l.replace(/\s+$/, (s) => (s === '  ' ? s : ''))))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

// --- dates -----------------------------------------------------------------

/** WordPress local time with its real UTC offset, from date and date_gmt. */
function isoWithOffset(local, gmt) {
  const diffMin = Math.round((Date.parse(`${local}Z`) - Date.parse(`${gmt}Z`)) / 60000);
  const sign = diffMin < 0 ? '-' : '+';
  const abs = Math.abs(diffMin);
  const off = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  return `${local}${off}`;
}

const pathOf = (link) => new URL(link).pathname;

async function clean(dir) {
  await mkdir(dir, { recursive: true });
  for (const f of await readdir(dir)) if (f.endsWith('.md')) await rm(join(dir, f));
}

async function main() {
  const [posts, pages, categories, tags, media, authors] = await Promise.all(
    ['posts.json', 'pages.json', 'categories.json', 'tags.json', 'media.json', 'authors.json'].map(load),
  );
  const catById = new Map(categories.map((c) => [c.id, c]));
  const tagById = new Map(tags.map((t) => [t.id, t]));
  const mediaById = new Map(media.map((m) => [m.id, m]));
  const authorById = new Map(authors.map((a) => [a.id, a]));

  const postsById = new Map(posts.map((p) => [p.id, pathOf(p.link)]));
  const pagesById = new Map(pages.map((p) => [p.id, pathOf(p.link)]));
  const knownPaths = new Set([
    '/',
    '/feed/',
    ...postsById.values(),
    ...pagesById.values(),
    ...categories.map((c) => `/category/${c.slug}/`),
    ...tags.map((t) => `/tag/${t.slug}/`),
  ]);
  const { rewrite, unmapped } = makeRewriter({ postsById, pagesById, knownPaths, mediaById });

  await clean(POSTS_DIR);
  await clean(PAGES_DIR);
  await mkdir(DATA_DIR, { recursive: true });

  const usedAuthors = new Set(posts.map((p) => p.author));
  const write = async (dir, item, extra) => {
    const td = makeTurndown((url, where) => rewrite(url, `${item.slug} ${where}`));
    const body = tidy(td.turndown(linkBareUploads(escapePlainPre(item.content))));
    const fm = {
      title: decode(item.title),
      date: isoWithOffset(item.date, item.date_gmt),
      modified: isoWithOffset(item.modified, item.modified_gmt),
      slug: item.slug,
      permalink: pathOf(item.link),
      wpId: item.id,
      description: plainExcerpt(item.excerpt) || undefined,
      ...extra,
    };
    const featured = mediaById.get(item.featured_media);
    if (featured) {
      fm.image = rewrite(featured.source_url, `${item.slug} featured`);
      fm.imageAlt = decode(featured.alt_text || '');
    }
    for (const k of Object.keys(fm)) if (fm[k] === undefined) delete fm[k];
    const yaml = stringify(fm, { lineWidth: 0 });
    await writeFile(join(dir, `${item.slug}.md`), `---\n${yaml}---\n\n${body}`);
  };

  for (const p of posts) {
    await write(POSTS_DIR, p, {
      categories: p.categories.map((id) => catById.get(id)?.slug).filter(Boolean),
      tags: p.tags.map((id) => tagById.get(id)?.slug).filter(Boolean),
      ...(usedAuthors.size > 1 ? { author: authorById.get(p.author)?.name } : {}),
    });
  }
  for (const p of pages) await write(PAGES_DIR, p, { menuOrder: p.menu_order, ...(p.redirect ? { redirect: p.redirect } : {}) });

  const taxonomy = {
    categories: Object.fromEntries(categories.map((c) => [c.slug, decode(c.name)])),
    tags: Object.fromEntries(tags.map((t) => [t.slug, decode(t.name)])),
  };
  await writeFile(join(DATA_DIR, 'taxonomy.json'), JSON.stringify(taxonomy, null, 2) + '\n');

  console.log(`Converted ${posts.length} posts and ${pages.length} pages.`);
  if (missingUploads.size) {
    console.log(`Links to uploads the export couldn't download, marked "(file no longer available)":`);
    for (const u of missingUploads) console.log(`  ${u}`);
  }
  if (unmapped.size) {
    console.log(`Links to saemundsson.se left absolute (no matching post, page, archive or upload):`);
    for (const u of [...unmapped].sort()) console.log(`  ${u}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
