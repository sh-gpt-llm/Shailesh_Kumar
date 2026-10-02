import type { APIRoute } from 'astro';
import { INDUSTRIES } from '../../data/radar/industries';
import { QUADRANTS, RINGS, MOMENTUM } from '../../data/radar/types';
import { CANONICAL_THEMES, canonicalKeyFor } from '../../data/radar/canonical';
import { slugify } from '../../data/radar/routes';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://vantessence.com';

  const payload = {
    name: 'Emerging Technology & Innovation Radar',
    description:
      'An independent, industry-agnostic technology radar. Each technology is placed in Adopt, Trial, Assess or Hold with a written brief explaining the placement.',
    author: { name: 'Shailesh Kumar', url: `${base}/` },
    url: `${base}/radar/`,
    license: 'Free to cite with attribution to Shailesh Kumar (vantessence.com).',
    taxonomy: {
      rings: RINGS.map((r) => ({
        id: r.id,
        label: r.label,
        meaning: {
          adopt: 'Proven and low-risk; invest now.',
          trial: 'Worth piloting on a real project.',
          assess: 'Worth understanding, not yet committing.',
          hold: 'Proceed with caution, or de-prioritise.',
        }[r.id],
      })),
      quadrants: QUADRANTS.map((q) => ({ id: q.id, code: q.code, name: q.name })),
      momentum: MOMENTUM.map((m) => ({ id: m.id, label: m.label })),
    },
    industries: INDUSTRIES.map((industry) => ({
      slug: industry.slug,
      name: industry.name,
      tagline: industry.tagline,
      scope: industry.scope,
      edition: industry.edition,
      themes: industry.themes,
      editorsNote: industry.editorsNote,
      technologies: industry.technologies.map((t) => ({
        id: t.id,
        name: t.name,
        url: `${base}/radar/${industry.slug}/${slugify(t.name)}/`,
        ring: t.ring,
        quadrant: QUADRANTS.find((q) => q.id === t.quadrant)?.name,
        momentum: t.momentum,
        timeHorizon: t.timeHorizon,
        tags: t.tags,
        summary: t.summary,
        brief: t.brief,
        evidence: t.evidence ?? [],
        dependsOn: (t.dependsOn ?? []).map((id) => industry.technologies.find((x) => x.id === id)?.name).filter(Boolean),
        crossIndustryTheme: canonicalKeyFor(t.name) ?? null,
      })),
      watchlist: industry.watchlist,
      geography: industry.geography,
    })),
    crossIndustryThemes: CANONICAL_THEMES.map((theme) => ({
      key: theme.key,
      label: theme.label,
      blurb: theme.blurb,
      placements: INDUSTRIES.flatMap((ind) => {
        const tech = ind.technologies.find((t) => canonicalKeyFor(t.name) === theme.key);
        return tech ? [{ industry: ind.name, technology: tech.name, ring: tech.ring }] : [];
      }),
    })).filter((t) => t.placements.length >= 2),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
