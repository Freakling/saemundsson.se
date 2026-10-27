import type { APIRoute } from 'astro';
import { FEED_HEADERS, feedXml } from '../lib/feed';

// The RSS feed with an XML content type (GitHub Pages serves .xml as XML).
export const GET: APIRoute = async ({ site }) => new Response(await feedXml(site, '/feed.xml'), { headers: FEED_HEADERS });
