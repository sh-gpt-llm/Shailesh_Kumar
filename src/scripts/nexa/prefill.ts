import type { Ring, Momentum } from '../../data/radar/types';
import type { Scores } from './engine';
import type { DimensionId } from '../../data/nexa/framework';

export interface RadarMatch {
  name: string;
  summary: string;
  tags: string[];
  ring: Ring;
  momentum: Momentum;
  timeHorizon: string;
  evidence: string[];
  url: string;
  industry: string;
}

/**
 * Only two of the six dimensions are properties of the technology itself. The
 * other four are properties of the organisation asking, so they are never
 * guessed — leaving them blank is the honest answer.
 */
export const PREFILLABLE: DimensionId[] = ['differentiation', 'timeToValue'];

export const RING_TO_DIFFERENTIATION: Record<Ring, number> = {
  adopt: 1, // proven and widely available, so an incumbent already ships it
  trial: 2,
  assess: 3, // early enough that few can deliver it well
  hold: 1, // either commoditised or problematic; rarely a moat
};

export const HORIZON_TO_TIME_TO_VALUE: { match: string; score: number }[] = [
  { match: 'Now', score: 4 },
  { match: '6-12 mo', score: 3 },
  { match: '12-18 mo', score: 2 },
  { match: '2-3 yr', score: 1 },
];

export interface Suggestion {
  scores: Partial<Scores>;
  notes: { dimension: DimensionId; score: number; reason: string }[];
}

export function suggestFrom(match: RadarMatch): Suggestion {
  let differentiation = RING_TO_DIFFERENTIATION[match.ring];
  let diffReason = `${match.name} sits in ${match.ring.toUpperCase()} on the radar`;

  if (match.momentum === 'new') {
    differentiation = Math.min(4, differentiation + 1);
    diffReason += ', and is new this edition, so fewer vendors deliver it credibly';
  } else if (match.momentum === 'cooling') {
    differentiation = Math.max(0, differentiation - 1);
    diffReason += ', and its momentum is cooling, which usually means the field has caught up';
  } else {
    diffReason += '.';
  }

  const horizon = HORIZON_TO_TIME_TO_VALUE.find((h) => match.timeHorizon.includes(h.match));
  const timeToValue = horizon?.score ?? 2;
  const ttvReason = horizon
    ? `The radar puts its time horizon at “${match.timeHorizon}”.`
    : 'No time horizon is recorded, so this is left mid-scale.';

  return {
    scores: { differentiation, timeToValue },
    notes: [
      { dimension: 'differentiation', score: differentiation, reason: diffReason },
      { dimension: 'timeToValue', score: timeToValue, reason: ttvReason },
    ],
  };
}
