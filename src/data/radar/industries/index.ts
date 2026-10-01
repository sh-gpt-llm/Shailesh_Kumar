import { tech } from './tech';
import { healthcare } from './healthcare';
import { financialServices } from './financial-services';
import { manufacturing } from './manufacturing';
import { retail } from './retail';
import { AUGMENTS } from '../augment';
import type { IndustryRadar } from '../types';

const withAugments = (industry: IndustryRadar): IndustryRadar => {
  const augments = AUGMENTS[industry.slug];
  if (!augments) return industry;
  return {
    ...industry,
    technologies: industry.technologies.map((t) => {
      const extra = augments[t.id];
      return extra ? { ...t, ...extra } : t;
    }),
  };
};

export const INDUSTRIES: IndustryRadar[] = [tech, healthcare, financialServices, manufacturing, retail].map(
  withAugments
);

export const getIndustry = (slug: string): IndustryRadar | undefined =>
  INDUSTRIES.find((industry) => industry.slug === slug);

export const DEFAULT_INDUSTRY_SLUG = tech.slug;
