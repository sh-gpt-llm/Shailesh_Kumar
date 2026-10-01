import type { Ring, QuadrantId } from '../../data/radar/types';

export type Tab = 'radar' | 'list' | 'roadmap' | 'compare' | 'position' | 'ecosystem' | 'functions' | 'geography';

export interface RadarState {
  industrySlug: string;
  tab: Tab;
  search: string;
  quadrant: QuadrantId | 'all';
  ring: Ring | 'all';
  selectedId: number | null;
  compareKey: string | null;
  geoCategory: string;
  role: string | null;
}

const VALID_TABS: Tab[] = ['radar', 'list', 'roadmap', 'compare', 'position', 'ecosystem', 'functions', 'geography'];
const VALID_RINGS: Ring[] = ['adopt', 'trial', 'assess', 'hold'];

export function readStateFromUrl(fallback: RadarState): RadarState {
  const p = new URLSearchParams(window.location.search);
  const tab = p.get('tab') as Tab | null;
  const ring = p.get('ring') as Ring | null;
  const quadrant = p.get('quadrant');
  const tech = p.get('tech');

  return {
    industrySlug: p.get('industry') || fallback.industrySlug,
    tab: tab && VALID_TABS.includes(tab) ? tab : fallback.tab,
    search: p.get('q') || '',
    quadrant: quadrant && ['1', '2', '3', '4'].includes(quadrant) ? (Number(quadrant) as QuadrantId) : 'all',
    ring: ring && VALID_RINGS.includes(ring) ? ring : 'all',
    selectedId: tech && /^\d+$/.test(tech) ? Number(tech) : null,
    compareKey: p.get('compare'),
    geoCategory: p.get('geo') || '',
    role: p.get('role'),
  };
}

export function writeStateToUrl(state: RadarState, defaultIndustry: string) {
  const p = new URLSearchParams();
  if (state.industrySlug !== defaultIndustry) p.set('industry', state.industrySlug);
  if (state.tab !== 'radar') p.set('tab', state.tab);
  if (state.search) p.set('q', state.search);
  if (state.quadrant !== 'all') p.set('quadrant', String(state.quadrant));
  if (state.ring !== 'all') p.set('ring', state.ring);
  if (state.selectedId != null) p.set('tech', String(state.selectedId));
  if (state.compareKey) p.set('compare', state.compareKey);
  if (state.geoCategory) p.set('geo', state.geoCategory);
  if (state.role) p.set('role', state.role);

  const qs = p.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  window.history.replaceState(null, '', url);
}

export function shareUrlFor(state: RadarState, defaultIndustry: string): string {
  const p = new URLSearchParams();
  if (state.industrySlug !== defaultIndustry) p.set('industry', state.industrySlug);
  if (state.tab !== 'radar') p.set('tab', state.tab);
  if (state.selectedId != null) p.set('tech', String(state.selectedId));
  if (state.compareKey) p.set('compare', state.compareKey);
  const qs = p.toString();
  return `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ''}`;
}
