import { tech } from './tech';
import { healthcare } from './healthcare';
import { financialServices } from './financial-services';
import { manufacturing } from './manufacturing';
import { retail } from './retail';
import type { IndustryRadar } from '../types';

export const INDUSTRIES: IndustryRadar[] = [tech, healthcare, financialServices, manufacturing, retail];

export const getIndustry = (slug: string): IndustryRadar | undefined =>
  INDUSTRIES.find((industry) => industry.slug === slug);

export const DEFAULT_INDUSTRY_SLUG = tech.slug;
