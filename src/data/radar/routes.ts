import { INDUSTRIES } from './industries';
import type { IndustryRadar, Technology } from './types';

/** URL-safe slug for a technology name, e.g. "Agent & Tool Protocols (MCP, A2A)" -> "agent-tool-protocols-mcp-a2a". */
export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export interface TechRoute {
  industry: IndustryRadar;
  tech: Technology;
  slug: string;
  url: string;
}

export const techRoutes = (): TechRoute[] =>
  INDUSTRIES.flatMap((industry) =>
    industry.technologies.map((tech) => {
      const slug = slugify(tech.name);
      return { industry, tech, slug, url: `/radar/${industry.slug}/${slug}/` };
    })
  );

export const routeFor = (industrySlug: string, techName: string) =>
  `/radar/${industrySlug}/${slugify(techName)}/`;
