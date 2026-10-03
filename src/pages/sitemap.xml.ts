import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { techRoutes } from '../data/radar/routes';
import { INDUSTRIES } from '../data/radar/industries';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://vantessence.com';
  const today = new Date().toISOString().slice(0, 10);

  const posts = (await getCollection('writing')).filter((p) => !p.data.draft);

  const urls: { loc: string; lastmod: string; priority: string }[] = [
    { loc: `${base}/`, lastmod: today, priority: '1.0' },
    { loc: `${base}/radar/`, lastmod: INDUSTRIES[0].edition.published, priority: '0.9' },
    { loc: `${base}/radar/how-it-works/`, lastmod: INDUSTRIES[0].edition.published, priority: '0.8' },
    { loc: `${base}/nexa/`, lastmod: today, priority: '0.9' },
    { loc: `${base}/nexa/framework/`, lastmod: today, priority: '0.8' },
    { loc: `${base}/practice/`, lastmod: today, priority: '0.9' },
    { loc: `${base}/earb/`, lastmod: today, priority: '0.9' },
    { loc: `${base}/earb/engage/`, lastmod: today, priority: '0.8' },
    { loc: `${base}/earb/framework/`, lastmod: today, priority: '0.8' },
    { loc: `${base}/ai-governance/`, lastmod: today, priority: '0.9' },
    { loc: `${base}/ai-governance/framework/`, lastmod: today, priority: '0.9' },
    { loc: `${base}/journey/`, lastmod: today, priority: '0.7' },
    { loc: `${base}/work/`, lastmod: today, priority: '0.7' },
    { loc: `${base}/writing/`, lastmod: today, priority: '0.7' },
    { loc: `${base}/contact/`, lastmod: today, priority: '0.5' },
    ...posts.map((p) => ({
      loc: `${base}/writing/${p.id}/`,
      lastmod: p.data.date.toISOString().slice(0, 10),
      priority: '0.6',
    })),
    ...techRoutes().map(({ industry, url }) => ({
      loc: `${base}${url}`,
      lastmod: industry.edition.published,
      priority: '0.8',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
