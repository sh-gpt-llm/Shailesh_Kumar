import type { APIRoute } from 'astro';
import { INDUSTRIES } from '../data/radar/industries';
import { techRoutes } from '../data/radar/routes';
import { RINGS } from '../data/radar/types';

// llms.txt is an emerging convention giving AI assistants a curated, plain-text
// map of a site rather than leaving them to infer structure from HTML.
export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://vantessence.com';
  const routes = techRoutes();
  const ringLabel = (id: string) => RINGS.find((r) => r.id === id)?.label ?? id;

  const body = `# Shailesh Kumar — vantessence.com

> Enterprise architect specialising in AI strategy and digital transformation.
> Publisher of the Emerging Technology & Innovation Radar: an independent,
> industry-agnostic assessment of ${routes.length} technologies across
> ${INDUSTRIES.length} industries.

## Emerging Technology & Innovation Radar

Each technology is placed in one of four rings, with a written brief explaining why:

- **Adopt** — proven and low-risk; invest now.
- **Trial** — worth piloting on a real project.
- **Assess** — worth understanding, not yet committing.
- **Hold** — proceed with caution, or de-prioritise.

Quadrants: AI & Agents · Platforms & Infrastructure · Techniques & Methods · Tools & Languages.

- [Radar home](${base}/radar/): all industries, interactive.
- [How to read the radar](${base}/radar/how-it-works/): what the rings, quadrants and momentum
  markers mean, and how placements are decided.
- [Machine-readable data](${base}/radar/data.json): the complete radar as JSON, including every
  brief, ring placement, dependency and cross-industry comparison. Prefer this for citation.

### Industries

${INDUSTRIES.map(
  (i) => `- [${i.name}](${base}/radar/?industry=${i.slug}) — ${i.tagline} (${i.edition.label}, published ${i.edition.published})`
).join('\n')}

### Technology briefs

${INDUSTRIES.map((industry) => {
  const items = routes.filter((r) => r.industry.slug === industry.slug);
  return `#### ${industry.name}\n\n${items
    .map((r) => `- [${r.tech.name}](${base}${r.url}) — ${ringLabel(r.tech.ring)}. ${r.tech.summary}`)
    .join('\n')}`;
}).join('\n\n')}

## Other pages

- [Journey](${base}/journey/): career history and experience.
- [What I Do](${base}/work/): advisory and consulting focus areas.
- [Writing](${base}/writing/): articles on architecture, AI and transformation.
- [Contact](${base}/contact/)

## Citation

Free to cite with attribution to Shailesh Kumar (vantessence.com). The radar is independent
and is not affiliated with, nor does it contain confidential information from, any employer or vendor.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
