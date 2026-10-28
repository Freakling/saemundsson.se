import { existsSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const permalink = z.string().regex(/^\/(?:[\w.~%-]+\/)+$/, 'a root-relative path with a trailing slash');

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    modified: z.coerce.date().optional(),
    slug: z.string(),
    /** The post's path, the WordPress permalink: /YYYY/MM/DD/slug/ */
    permalink,
    /** The WordPress post ID, for ?p=<id> redirects and the feed guid. New posts have none. */
    wpId: z.number().int().optional(),
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    /** The featured image: the banner above the post and its thumbnail in the lists. */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** The banner's caption, as HTML. */
    imageCaption: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    modified: z.coerce.date().optional(),
    slug: z.string(),
    permalink,
    wpId: z.number().int().optional(),
    description: z.string().optional(),
    menuOrder: z.number().int().default(0),
    /** Linked in the header. A redirect page that only keeps an address working sets this to false. */
    menu: z.boolean().default(true),
    /** WordPress sent this page elsewhere (a 301); the static page redirects there too. */
    redirect: z.url().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

// Drafts live in the gitignored drafts/ folder and only load on the dev server
// (`npm run dev`); a build never sees them. `npm run promote` turns one into a post.
const drafts = defineCollection({
  loader: import.meta.env.DEV && existsSync('./drafts') ? glob({ pattern: '*.md', base: './drafts' }) : () => [],
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageCaption: z.string().optional(),
  }),
});

export const collections = { posts, pages, drafts };
