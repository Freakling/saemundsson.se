import { getCollection, type CollectionEntry } from 'astro:content';
import taxonomy from '../data/taxonomy.json';

export const SITE_TITLE = 'Saemundsson.se';
export const SITE_TAGLINE = 'Azure, tech and other random stuff';
export const SITE_AUTHOR = 'Vikingur Saemundsson';
export const SITE_LANG = 'en';
/** The real domain. Canonical and Open Graph URLs always point here, also on github.io. */
export const CANONICAL_ORIGIN = 'https://saemundsson.se';

export type Post = CollectionEntry<'posts'>;
export type Page = CollectionEntry<'pages'>;
export type Draft = CollectionEntry<'drafts'>;

/** A root-relative path ("/2026/10/19/slug/") as a URL under the site's base. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(?:[a-z]+:)?\/\//i.test(path) || !path.startsWith('/')) return path;
  return `${base}${path}`;
}

/** The list thumbnail of a featured image, made by tools/thumbs.mjs; none for images outside the uploads. */
export function thumbFor(image?: string): string | undefined {
  const uploads = '/wp-content/uploads/';
  return image?.startsWith(uploads) ? `/thumbs/${image.slice(uploads.length).replace(/\.[a-z]+$/i, '.webp')}` : undefined;
}

/** The canonical URL of a root-relative path, always on the real domain. */
export function canonical(path: string): string {
  return new URL(path, CANONICAL_ORIGIN).href;
}

/** An absolute URL on the host the site is actually served from (for images in previews). */
export function absolute(path: string, site: URL | undefined): string {
  return new URL(withBase(path), site ?? CANONICAL_ORIGIN).href;
}

export const categoryName = (slug: string): string => (taxonomy.categories as Record<string, string>)[slug] ?? slug;
export const tagName = (slug: string): string => (taxonomy.tags as Record<string, string>)[slug] ?? slug;
export const categoryPath = (slug: string): string => `/category/${slug}/`;
export const tagPath = (slug: string): string => `/tag/${slug}/`;

/** All published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The pages, in their WordPress menu order. */
export async function getPages(): Promise<Page[]> {
  const pages = await getCollection('pages');
  return pages.sort((a, b) => a.data.menuOrder - b.data.menuOrder || a.data.title.localeCompare(b.data.title));
}

/** Drafts from drafts/, on the dev server only (empty in a build). */
export async function getDrafts(): Promise<Draft[]> {
  if (!import.meta.env.DEV) return [];
  return getCollection('drafts');
}

export const draftPath = (id: string): string => `/drafts/${id}/`;

/** A meta description: the excerpt, cut at a word boundary. */
export function metaDescription(text: string | undefined, max = 160): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,.;:]+$/, '')}…`;
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Stockholm' });
export const formatDate = (d: Date): string => dateFormat.format(d);

/** Minutes to read a Markdown body, at 230 words a minute (code counts as text). */
export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
