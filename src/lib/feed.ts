import { getRssString } from '@astrojs/rss';
import { CANONICAL_ORIGIN, SITE_AUTHOR, SITE_TAGLINE, SITE_TITLE, canonical, categoryName, getPosts, tagName } from './site';

/** Root-relative href and src values in rendered HTML, made absolute for feed readers. */
function absolutize(html: string, origin: string): string {
  return html.replace(/\s(href|src)="(\/(?!\/)[^"]*)"/g, (_m, attr: string, url: string) => ` ${attr}="${origin}${url}"`);
}

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The RSS feed: every post, full text, newest first. Item links are the canonical
 * saemundsson.se URLs; images and links inside the text point at the host the
 * site is served from. Imported posts keep their WordPress guid
 * (https://saemundsson.se/?p=<id>), so feed readers don't show them again.
 */
export async function feedXml(site: URL | undefined, selfPath: string): Promise<string> {
  const origin = (site ?? new URL(CANONICAL_ORIGIN)).origin;
  const posts = await getPosts();
  const xml = await getRssString({
    title: SITE_TITLE,
    description: SITE_TAGLINE,
    site: CANONICAL_ORIGIN,
    xmlns: { atom: 'http://www.w3.org/2005/Atom', dc: 'http://purl.org/dc/elements/1.1/' },
    customData: [
      '<language>en-US</language>',
      `<atom:link href="${escapeXml(canonical(selfPath))}" rel="self" type="application/rss+xml"/>`,
      posts[0] ? `<lastBuildDate>${(posts[0].data.modified ?? posts[0].data.date).toUTCString()}</lastBuildDate>` : '',
    ].join(''),
    items: posts.map((post) => ({
      title: post.data.title,
      link: canonical(post.data.permalink),
      pubDate: post.data.date,
      description: post.data.description,
      content: absolutize(post.rendered?.html ?? '', origin),
      categories: [...post.data.categories.filter((c) => c !== 'uncategorized').map(categoryName), ...post.data.tags.map(tagName)],
      customData: `<dc:creator><![CDATA[${SITE_AUTHOR}]]></dc:creator>`,
    })),
  });
  // Swap the generated guid (the link) for the WordPress one where there is one.
  const guidByLink = new Map(posts.filter((p) => p.data.wpId).map((p) => [canonical(p.data.permalink), `${CANONICAL_ORIGIN}/?p=${p.data.wpId}`]));
  return xml.replace(/<guid isPermaLink="true">([^<]*)<\/guid>/g, (m, link: string) => {
    const guid = guidByLink.get(link);
    return guid ? `<guid isPermaLink="false">${escapeXml(guid)}</guid>` : m;
  });
}

export const FEED_HEADERS = { 'Content-Type': 'application/rss+xml; charset=utf-8' };
