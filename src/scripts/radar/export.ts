import type { IndustryRadar, Technology } from '../../data/radar/types';
import { RINGS, QUADRANTS, MOMENTUM } from '../../data/radar/types';

const label = (list: { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? id;

const csvCell = (value: string | number) => {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(ind: IndustryRadar): string {
  const header = ['id', 'name', 'quadrant', 'ring', 'momentum', 'timeHorizon', 'tags', 'summary', 'brief'];
  const rows = ind.technologies.map((t) => [
    t.id,
    t.name,
    QUADRANTS.find((q) => q.id === t.quadrant)?.name ?? '',
    label(RINGS, t.ring),
    label(MOMENTUM, t.momentum),
    t.timeHorizon,
    t.tags.join('; '),
    t.summary,
    t.brief,
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export function toJson(ind: IndustryRadar): string {
  return JSON.stringify(
    {
      radar: 'Emerging Technology & Innovation Radar',
      industry: ind.name,
      edition: ind.edition,
      source: 'https://vantessence.com/radar/',
      technologies: ind.technologies,
      watchlist: ind.watchlist,
      themes: ind.themes,
    },
    null,
    2
  );
}

export function download(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const technologyCount = (ind: IndustryRadar): number => ind.technologies.length;
export type { Technology };
