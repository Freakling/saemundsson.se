import type { APIRoute } from 'astro';
import { FEED_HEADERS, feedXml } from '../../lib/feed';

// /feed/, the WordPress feed URL that subscribers already have. GitHub Pages
// serves a folder only through its index.html, as text/html, so this file holds
// the same RSS XML as /feed.xml and /rss.xml: feed readers parse the body and
// accept it, and the pages link /feed.xml for new subscribers.
export const GET: APIRoute = async ({ site }) => new Response(await feedXml(site, '/feed/'), { headers: FEED_HEADERS });
