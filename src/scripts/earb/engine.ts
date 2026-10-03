import { CRITERIA, ROUTES, OUTCOMES, ASK_TYPES } from '../../data/earb/model';
import type { AskId, RouteId, OutcomeId, Criterion } from '../../data/earb/model';

export type Answer = 'yes' | 'partial' | 'no';
export const ANSWER_VALUE: Record<Answer, number> = { yes: 1, partial: 0.5, no: 0 };

export const TRIAGE_SCALES: { id: TriageKey; name: string; options: string[] }[] = [
  {
    id: 'reversibility',
    name: 'Reversibility',
    options: [
      'Trivially reversible — switch it off and stop',
      'Unwindable with effort',
      'Costly and disruptive to unwind',
      'Effectively irreversible once started',
    ],
  },
  {
    id: 'blastRadius',
    name: 'Blast radius',
    options: ['One team', 'One business unit', 'Several business units', 'Shared platform or the whole enterprise'],
  },
  {
    id: 'novelty',
    name: 'Novelty',
    options: [
      'Another instance of an already approved pattern',
      'A variation on something we run',
      'New to this business unit',
      'A first for the estate',
    ],
  },
  {
    id: 'materiality',
    name: 'Materiality',
    options: ['Within team discretion', 'A funded piece of work', 'A significant line in the plan', 'Platform-level commitment'],
  },
];

export type TriageKey = 'reversibility' | 'blastRadius' | 'novelty' | 'materiality';
export type Triage = Record<TriageKey, number>;

export interface Submission {
  title: string;
  summary: string;
  ask: AskId;
  question: string;
  technologies: string[];
  triage: Triage;
  answers: Record<string, Answer>;
}

export const BLANK_TRIAGE: Triage = { reversibility: 1, blastRadius: 1, novelty: 1, materiality: 1 };

export function newSubmission(): Submission {
  return {
    title: '',
    summary: '',
    ask: 'decision',
    question: '',
    technologies: [],
    triage: { ...BLANK_TRIAGE },
    answers: {},
  };
}

/** Criteria only apply to the kind of ask being made. */
export function criteriaFor(ask: AskId): Criterion[] {
  return CRITERIA.filter((c) => c.appliesTo.includes(ask));
}

export function routeFor(t: Triage): RouteId {
  if (t.reversibility >= 3 || t.blastRadius >= 3 || t.novelty >= 3) return 'full';
  if (t.reversibility >= 2 || t.blastRadius >= 2 || t.novelty >= 2 || t.materiality >= 3) return 'fast';
  return 'delegated';
}

export function readiness(s: Submission): number {
  const list = criteriaFor(s.ask);
  if (!list.length) return 100;
  const max = list.reduce((n, c) => n + c.weight, 0);
  const got = list.reduce((n, c) => n + c.weight * ANSWER_VALUE[s.answers[c.id] ?? 'no'], 0);
  return Math.round((got / max) * 100);
}

export function likelyOutcome(s: Submission): OutcomeId {
  if (s.ask === 'awareness' || s.ask === 'information') return 'noted';
  const score = readiness(s);
  if (score >= 85) return 'approved';
  if (score >= 70) return 'conditions';
  if (score >= 50) return 'rework';
  return 'deferred';
}

/** The board asks about what you were weakest on. Heaviest criteria first. */
export function boardQuestions(s: Submission): { criterion: Criterion; answer: Answer }[] {
  return criteriaFor(s.ask)
    .map((c) => ({ criterion: c, answer: s.answers[c.id] ?? ('no' as Answer) }))
    .filter((x) => x.answer !== 'yes')
    .sort((a, b) => b.criterion.weight - a.criterion.weight);
}

export interface RadarFlag {
  name: string;
  ring: string;
  severity: 'challenge' | 'caution' | 'clear';
  note: string;
  url: string;
}

export function paperOutline(s: Submission, route: RouteId, outcome: OutcomeId): string {
  const ask = ASK_TYPES.find((a) => a.id === s.ask)!;
  const routeMeta = ROUTES.find((r) => r.id === route)!;
  const outcomeMeta = OUTCOMES.find((o) => o.id === outcome)!;
  const gaps = boardQuestions(s);
  const showQuestion = (s.ask === 'decision' || s.ask === 'consultation') && s.question.trim();

  const lines = [
    `# ${s.title || 'Untitled submission'}`,
    '',
    `**Ask:** ${ask.code} — ${ask.label}`,
    `**Route:** ${routeMeta.label}`,
    `**Service level:** ${routeMeta.sla}`,
    showQuestion ? `**The question for the board:** ${s.question}` : '',    '',
    '## The problem',
    s.summary || '_State the problem in business terms, without naming a product._',
    '',
    ...ask.requires.flatMap((r) => [`## ${r}`, '_To complete._', '']),
    '## Estate impact',
    '_What this duplicates, replaces or retires. Name what gets switched off, and when._',
    '',
    s.technologies.length ? `## Technologies in scope\n${s.technologies.map((t) => `- ${t}`).join('\n')}\n` : '',
    '## Standards conformance and declared deviations',
    '_List every deviation. Undeclared deviations found at the board cost more than declared ones._',
    '',
    '## Risks and the named risk owner',
    '_A person, not a team._',
    '',
    gaps.length
      ? `## Expect these questions\n${gaps.map((g) => `- **${g.criterion.name}** — ${g.criterion.challenge}`).join('\n')}\n`
      : '',
    `---`,
    `_Readiness ${readiness(s)}%. On this evidence the likely outcome is: **${outcomeMeta.label}**._`,
    `_Prepared against the EARB operating model — https://vantessence.com/earb/framework/_`,
  ];

  return lines.filter((l) => l !== '').join('\n');
}
