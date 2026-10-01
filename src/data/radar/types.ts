// Shared schema for the Emerging Technology & Innovation Radar.
// One universal taxonomy (quadrants, rings, momentum) applied per-industry,
// so every industry gets its own fully curated dataset but a consistent
// mental model for comparing across industries.

export type Ring = 'adopt' | 'trial' | 'assess' | 'hold';
export type Momentum = 'new' | 'accelerating' | 'cooling' | 'steady';
export type QuadrantId = 1 | 2 | 3 | 4;

export interface Quadrant {
  id: QuadrantId;
  code: string; // Q01 etc.
  name: string;
}

export interface Technology {
  id: number;
  name: string;
  quadrant: QuadrantId;
  ring: Ring;
  momentum: Momentum;
  summary: string; // one-line description
  brief: string; // longer "read the brief" paragraph
  timeHorizon: string; // e.g. "Now", "12-18 mo", "2-3 yr"
  tags: string[];
  /** Ring in the prior edition. Absent on the baseline edition. */
  previousRing?: Ring;
  /** Ids of technologies within the same industry this one builds on. */
  dependsOn?: number[];
  /** Observable market signals supporting this placement. */
  evidence?: string[];
}

export interface Edition {
  label: string;
  published: string;
  /** True when there is no prior edition to compare movement against. */
  baseline?: boolean;
}

export interface Theme {
  title: string;
  description: string;
}

export interface EcosystemPlayer {
  rank: number;
  name: string;
  posture: 'Deepen' | 'Maintain' | 'Watch';
  note: string;
  mix: Partial<Record<Ring, number>>;
  onRadar: number;
  overHorizon: number;
}

export interface Movement {
  title: string;
  horizon: string;
  description: string;
}

export interface FunctionLens {
  name: string;
  description: string;
  posture: string;
  newCount: number;
  mix: Partial<Record<Ring, number>>;
}

export interface GeographyEntry {
  rank: number;
  place: string;
  score: number;
}

export interface WatchlistSignal {
  name: string;
  blurb: string;
}

export interface IndustryRadar {
  slug: string;
  name: string;
  tagline: string;
  scope: string;
  edition: Edition;
  themes: Theme[];
  technologies: Technology[];
  editorsPicks: number[]; // technology ids
  editorsNote: string;
  watchlist: WatchlistSignal[];
  ecosystem: EcosystemPlayer[];
  movements: Movement[];
  functions: FunctionLens[];
  geography: {
    categories: string[];
    leaders: Record<string, GeographyEntry[]>;
  };
}

export const QUADRANTS: Quadrant[] = [
  { id: 1, code: 'Q01', name: 'AI & Agents' },
  { id: 2, code: 'Q02', name: 'Platforms & Infrastructure' },
  { id: 3, code: 'Q03', name: 'Techniques & Methods' },
  { id: 4, code: 'Q04', name: 'Tools & Languages' },
];

export const RINGS: { id: Ring; label: string }[] = [
  { id: 'adopt', label: 'Adopt' },
  { id: 'trial', label: 'Trial' },
  { id: 'assess', label: 'Assess' },
  { id: 'hold', label: 'Hold' },
];

export const MOMENTUM: { id: Momentum; label: string; glyph: string }[] = [
  { id: 'new', label: 'New', glyph: '◌' },
  { id: 'accelerating', label: 'Accelerating', glyph: '▲' },
  { id: 'cooling', label: 'Cooling', glyph: '▼' },
  { id: 'steady', label: 'Steady', glyph: '—' },
];
