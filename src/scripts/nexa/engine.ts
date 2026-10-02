import {
  DIMENSIONS,
  MAX_WEIGHTED,
  ASKS,
  VERDICTS,
  ROUTES,
  DILIGENCE,
  verdictById,
} from '../../data/nexa/framework';
import type { DimensionId, AskId, VerdictId, RouteId, DiligenceDomain } from '../../data/nexa/framework';

export type Scores = Record<DimensionId, number>;

export const BLANK_SCORES: Scores = {
  gap: 2,
  differentiation: 2,
  overlap: 2,
  strategy: 2,
  timeToValue: 2,
  reversibility: 2,
};

export interface Assessment {
  id: string;
  path: 'vendor' | 'gap';
  subject: string;
  capability: string;
  estate: string[];
  ask: AskId;
  scores: Scores;
  created: string;
}

export interface Result {
  composite: number;
  bar: number;
  verdict: VerdictId;
  route: RouteId;
  /** The single change that would most improve the case, and whether it flips the verdict. */
  swing: { dimension: DimensionId; from: number; to: number; newComposite: number; flipsTo: VerdictId | null } | null;
  strongest: DimensionId[];
  weakest: DimensionId[];
  diligence: DiligenceDomain[];
  reasoning: string;
}

const clamp04 = (n: number) => Math.max(0, Math.min(4, Math.round(n)));

export function composite(scores: Scores): number {
  const total = DIMENSIONS.reduce((n, d) => n + d.weight * clamp04(scores[d.id]), 0);
  return Math.round((total / MAX_WEIGHTED) * 100);
}

export function barFor(ask: AskId): number {
  return ASKS.find((a) => a.id === ask)?.bar ?? 55;
}

function verdictFor(scores: Scores, ask: AskId): VerdictId {
  const score = composite(scores);
  const bar = barFor(ask);

  // A direct equivalent already in place ends the conversation, whatever else scores well.
  if (scores.overlap === 0 && scores.gap <= 1) return 'park';

  if (score >= bar) {
    const cheapAndFast = scores.timeToValue >= 3 && scores.reversibility >= 2 && (ask === 'low' || ask === 'moderate');
    return cheapAndFast ? 'poc' : 'pilot';
  }
  if (score >= bar - 15) return 'explore';
  return 'park';
}

function routeFor(scores: Scores): RouteId {
  if (scores.gap <= 1 || scores.overlap === 0) return 'own';
  if (scores.gap <= 2 || scores.overlap <= 2) return 'extend';
  return 'scout';
}

function swingFor(scores: Scores, ask: AskId) {
  const current = verdictFor(scores, ask);
  let best: Result['swing'] = null;

  for (const d of DIMENSIONS) {
    const from = clamp04(scores[d.id]);
    if (from >= 4) continue;
    const next = { ...scores, [d.id]: from + 1 };
    const newComposite = composite(next);
    const flipped = verdictFor(next, ask);
    const candidate = {
      dimension: d.id,
      from,
      to: from + 1,
      newComposite,
      flipsTo: flipped !== current ? flipped : null,
    };
    // A dimension that changes the verdict always beats one that only moves the number.
    const better =
      !best ||
      (!!candidate.flipsTo && !best.flipsTo) ||
      (!!candidate.flipsTo === !!best.flipsTo && candidate.newComposite > best.newComposite);
    if (better) best = candidate;
  }
  return best;
}

function orderedByScore(scores: Scores) {
  return [...DIMENSIONS].sort((a, b) => clamp04(scores[b.id]) - clamp04(scores[a.id]));
}

function diligenceFor(scores: Scores): DiligenceDomain[] {
  // Domains whose triggering dimension scored badly are surfaced first.
  const urgency = (d: DiligenceDomain) =>
    d.triggers.length === 0 ? 0 : Math.max(...d.triggers.map((t) => 4 - clamp04(scores[t])));
  return [...DILIGENCE].sort((a, b) => urgency(b) - urgency(a));
}

const anchorLabel = (id: DimensionId, score: number) =>
  DIMENSIONS.find((d) => d.id === id)!.anchors.find((a) => a.score === clamp04(score))!.label.toLowerCase();

const dimName = (id: DimensionId) => DIMENSIONS.find((d) => d.id === id)!.name.toLowerCase();

function reasoningFor(a: Assessment, score: number, bar: number, verdict: VerdictId, ordered: Dimension0[]): string {
  const subject = a.subject.trim() || 'This';
  const askLabel = ASKS.find((x) => x.id === a.ask)!.label.toLowerCase();
  const top = ordered[0];
  const bottom = ordered[ordered.length - 1];
  const v = verdictById(verdict);

  const margin = score - bar;
  const clears =
    margin >= 10
      ? `comfortably clears the ${bar} needed for a ${askLabel} commitment`
      : margin >= 0
        ? `just clears the ${bar} needed for a ${askLabel} commitment`
        : margin >= -15
          ? `falls ${Math.abs(margin)} short of the ${bar} needed for a ${askLabel} commitment`
          : `falls well short of the ${bar} needed for a ${askLabel} commitment`;

  const estateNote =
    a.estate.length > 0
      ? ` Measured against ${a.estate.length === 1 ? 'the one capability' : `the ${a.estate.length} capabilities`} you already run, ${
          a.scores.overlap <= 1 ? 'the duplication is material' : 'the duplication is limited'
        }.`
      : ' No existing estate was declared, so the overlap score rests entirely on your own judgement.';

  return (
    `${subject} scores ${score} out of 100 and ${clears}.` +
    ` Its strongest dimension is ${dimName(top.id)} — ${anchorLabel(top.id, a.scores[top.id])}.` +
    ` Its weakest is ${dimName(bottom.id)} — ${anchorLabel(bottom.id, a.scores[bottom.id])}.` +
    estateNote +
    ` ${v.meaning}`
  );
}

type Dimension0 = (typeof DIMENSIONS)[number];

export function assess(a: Assessment): Result {
  const scores = a.scores;
  const score = composite(scores);
  const bar = barFor(a.ask);
  const verdict = verdictFor(scores, a.ask);
  const ordered = orderedByScore(scores);

  return {
    composite: score,
    bar,
    verdict,
    route: routeFor(scores),
    swing: swingFor(scores, a.ask),
    strongest: ordered.slice(0, 2).map((d) => d.id),
    weakest: ordered.slice(-2).map((d) => d.id),
    diligence: diligenceFor(scores),
    reasoning: reasoningFor(a, score, bar, verdict, ordered),
  };
}

export const VERDICT_LIST = VERDICTS;
export const ROUTE_LIST = ROUTES;
