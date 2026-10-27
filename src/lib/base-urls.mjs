// Markdown (Sätteri) hast plugin: puts the site's base path in front of every
// root-relative URL in content (href, src, srcset, poster), raw HTML included
// (the processor runs with `rawHtml`, so raw <img> and <figure> are real nodes).
// Content links are written root-relative ("/2026/10/19/slug/",
// "/wp-content/uploads/...") so they work at any base: "/" on saemundsson.se,
// "/saemundsson.se/" on the github.io project site.

/** @param {string} base @param {unknown} url */
export function prefixBase(base, url) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return url;
  if (base === '/' || url.startsWith(base)) return url;
  return base.replace(/\/$/, '') + url;
}

/**
 * @param {string} base The site's base, such as "/" or "/saemundsson.se/".
 */
export function baseUrls(base) {
  return {
    name: 'base-urls',
    element: {
      filter: ['a', 'img', 'iframe', 'source', 'video', 'audio', 'track', 'embed', 'object'],
      /** @param {any} node @param {any} ctx */
      visit(node, ctx) {
        const props = node.properties ?? {};
        for (const key of ['href', 'src', 'poster', 'data']) {
          const next = prefixBase(base, props[key]);
          if (next !== props[key]) ctx.setProperty(node, key, next);
        }
        for (const key of ['srcSet', 'srcset']) {
          const value = props[key];
          if (!value) continue;
          const list = Array.isArray(value) ? value : String(value).split(',');
          const next = list
            .map((/** @type {string} */ s) => {
              const [u = '', ...d] = s.trim().split(/\s+/);
              return [prefixBase(base, u), ...d].join(' ');
            })
            .join(', ');
          ctx.setProperty(node, key, next);
        }
      },
    },
  };
}
