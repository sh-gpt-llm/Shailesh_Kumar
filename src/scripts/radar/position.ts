import type { IndustryRadar, Ring, Technology } from '../../data/radar/types';

export type Stance = 'using' | 'piloting' | 'evaluating';

export const STANCES: { id: Stance; label: string; code: string; color: string }[] = [
  { id: 'using', label: 'Using in production', code: 'u', color: '#34d399' },
  { id: 'piloting', label: 'Piloting', code: 'p', color: '#22d3ee' },
  { id: 'evaluating', label: 'Evaluating', code: 'e', color: '#fbbf24' },
];

export type PositionMap = Record<number, Stance>;

const storageKey = (slug: string) => `vantessence.radar.position.${slug}`;

export function loadPosition(slug: string): PositionMap {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? (JSON.parse(raw) as PositionMap) : {};
  } catch {
    return {};
  }
}

export function savePosition(slug: string, map: PositionMap) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(map));
  } catch {
    /* storage unavailable (private mode) — position is simply not persisted */
  }
}

export function clearPosition(slug: string) {
  try {
    localStorage.removeItem(storageKey(slug));
  } catch {
    /* no-op */
  }
}

/** Compact wire format for sharing: "3u.12p.28e" */
export function encodePosition(map: PositionMap): string {
  return Object.entries(map)
    .map(([id, stance]) => `${id}${STANCES.find((s) => s.id === stance)?.code ?? 'e'}`)
    .join('.');
}

export function decodePosition(encoded: string): PositionMap {
  const map: PositionMap = {};
  for (const part of encoded.split('.')) {
    const m = /^(\d+)([upe])$/.exec(part.trim());
    if (!m) continue;
    const stance = STANCES.find((s) => s.code === m[2]);
    if (stance) map[Number(m[1])] = stance.id;
  }
  return map;
}

export interface GapAnalysis {
  assessed: number;
  total: number;
  adoptCovered: number;
  adoptTotal: number;
  readinessScore: number;
  adoptGaps: Technology[];
  holdRisks: Technology[];
  aheadOfCurve: Technology[];
  nextMoves: Technology[];
  verdict: string;
}

export function analysePosition(ind: IndustryRadar, map: PositionMap): GapAnalysis {
  const byRing = (ring: Ring) => ind.technologies.filter((t) => t.ring === ring);
  const adopt = byRing('adopt');
  const trial = byRing('trial');
  const assess = byRing('assess');
  const hold = byRing('hold');

  const adoptGaps = adopt.filter((t) => map[t.id] !== 'using');
  const adoptCovered = adopt.length - adoptGaps.length;
  const holdRisks = hold.filter((t) => map[t.id] === 'using' || map[t.id] === 'piloting');
  const aheadOfCurve = assess.filter((t) => map[t.id] === 'using');
  const nextMoves = trial.filter((t) => !map[t.id]).slice(0, 6);

  const assessed = Object.keys(map).length;
  // Adopt coverage is the dominant signal; trial engagement adds a smaller
  // bonus; running something in Hold subtracts.
  const trialEngaged = trial.filter((t) => map[t.id]).length;
  const raw =
    (adopt.length ? (adoptCovered / adopt.length) * 70 : 70) +
    (trial.length ? (trialEngaged / trial.length) * 30 : 30) -
    holdRisks.length * 8;
  const readinessScore = Math.max(0, Math.min(100, Math.round(raw)));

  let verdict: string;
  if (assessed === 0) verdict = 'Mark where you stand on each technology to see how your position compares.';
  else if (readinessScore >= 80) verdict = 'Front-running. You are ahead of the curve on the fundamentals — your risk is now over-extension, not under-investment.';
  else if (readinessScore >= 55) verdict = 'Solidly in the pack. The proven foundations are mostly in place; the opportunity is in the Trial ring.';
  else if (readinessScore >= 30) verdict = 'Catching up. Several proven, low-risk technologies are not yet in production — that is where the fastest returns are.';
  else verdict = 'Early. Start with the Adopt ring: these are the lowest-risk, highest-certainty moves available to you.';

  return {
    assessed,
    total: ind.technologies.length,
    adoptCovered,
    adoptTotal: adopt.length,
    readinessScore,
    adoptGaps,
    holdRisks,
    aheadOfCurve,
    nextMoves,
    verdict,
  };
}
