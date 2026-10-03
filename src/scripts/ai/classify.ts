import { DIMENSIONS, MODULES, OBLIGATIONS, LANES } from '../../data/ai-governance/triage';
import type { Lane, DimensionId, Obligation } from '../../data/ai-governance/triage';

export type Answers = Partial<Record<DimensionId, string>>;

export interface Classification {
  lane: Lane;
  flags: string[];
  firedRules: { order: number; name: string }[];
  overlays: ('genai' | 'agentic')[];
  modules: typeof MODULES;
  obligations: Obligation[];
  ownersRequired: string[];
  reasoning: string;
}

function collectFlags(answers: Answers): string[] {
  const flags: string[] = [];
  for (const d of DIMENSIONS) {
    const chosen = answers[d.id];
    if (!chosen) continue;
    const option = d.options.find((o) => o.value === chosen);
    if (option?.flags) flags.push(...option.flags);
  }
  return [...new Set(flags)];
}

function laneFor(f: string[]): { lane: Lane; fired: { order: number; name: string }[] } {
  const has = (x: string) => f.includes(x);
  const fired: { order: number; name: string }[] = [];

  if (has('prohibited') || has('prohibited-review')) {
    fired.push({ order: 1, name: 'Prohibited pre-screen' });
    return { lane: 'prohibited', fired };
  }

  const specialWithEffect = has('special') && (has('influences') || has('determines') || has('external'));
  const runawayAgent = has('autonomous') && has('hard-to-reverse');
  if (has('determines') || specialWithEffect || has('critical') || runawayAgent) {
    fired.push({ order: 2, name: 'High-risk short-circuit' });
    return { lane: 'high', fired };
  }

  const fastLane =
    !has('personal') &&
    !has('external') &&
    !has('public-affected') &&
    !has('genai') &&
    !has('agentic') &&
    !has('hard-to-reverse') &&
    !has('high-impact') &&
    !has('influences');

  if (fastLane) {
    fired.push({ order: 5, name: 'Fast lane' });
    return { lane: 'fast', fired };
  }

  fired.push({ order: 6, name: 'Default' });
  return { lane: 'standard', fired };
}

/** Composite flags let an obligation depend on the lane as well as the answers. */
function withDerived(flags: string[], lane: Lane): string[] {
  const out = [...flags, 'always'];
  // A prohibited practice is stopped, not monitored, so high-risk duties never attach.
  if (lane === 'high') out.push('high');
  if (out.includes('provider') && out.includes('high')) out.push('provider+high');
  if (out.includes('high') && out.includes('personal')) out.push('high+personal');
  return [...new Set(out)];
}

function reasoningFor(lane: Lane, f: string[], overlays: string[]): string {
  const meta = LANES.find((l) => l.id === lane)!;
  if (lane === 'prohibited') {
    return `The prohibited-practice screen flagged this before anything else was considered. ${meta.meaning}`;
  }
  const drivers: string[] = [];
  if (f.includes('determines')) drivers.push('the output effectively determines an outcome affecting a person');
  if (f.includes('special')) drivers.push('special-category or sector-regulated data is involved');
  if (f.includes('critical')) drivers.push('the worst realistic error reaches health, safety or fundamental rights');
  if (f.includes('autonomous') && f.includes('hard-to-reverse')) drivers.push('it acts without routine human involvement and is hard to reverse');
  if (f.includes('influences')) drivers.push('the output materially influences a human decision');
  if (f.includes('personal')) drivers.push('personal data is in scope');
  if (f.includes('external')) drivers.push('it is exposed outside the organisation');

  const overlayText = overlays.length
    ? ` The ${overlays.map((o) => (o === 'genai' ? 'generative' : 'agentic')).join(' and ')} overlay${overlays.length > 1 ? 's' : ''} also applies, because those risks do not appear in a conventional assessment.`
    : '';

  if (lane === 'fast') {
    return `Nothing here raises the system above the fast lane — no personal data, no external exposure, no generative or agentic behaviour, reversible, and low consequence if wrong. ${meta.meaning}${overlayText}`;
  }

  const because = drivers.length ? ` The deciding factors were that ${drivers.slice(0, 3).join(', ')}.` : '';
  return `${meta.meaning}${because}${overlayText}`;
}

export function classify(answers: Answers): Classification {
  const raw = collectFlags(answers);
  const { lane, fired } = laneFor(raw);
  const flags = withDerived(raw, lane);

  const overlays: ('genai' | 'agentic')[] = [];
  if (flags.includes('genai')) {
    overlays.push('genai');
    fired.push({ order: 3, name: 'Generative overlay' });
  }
  if (flags.includes('agentic')) {
    overlays.push('agentic');
    fired.push({ order: 4, name: 'Agentic overlay' });
  }

  const modules = MODULES.filter((m) => m.whenFlags.some((x) => flags.includes(x)));
  const obligations = OBLIGATIONS.filter((o) => o.whenFlags.some((x) => flags.includes(x)));

  const ownersRequired =
    lane === 'fast'
      ? ['Business Owner', 'Technical Owner']
      : overlays.length
        ? ['Business Owner', 'Technical Owner', 'Model or Agent Owner', 'Data Owner']
        : ['Business Owner', 'Technical Owner', 'Data Owner'];

  return {
    lane,
    flags,
    firedRules: fired.sort((a, b) => a.order - b.order),
    overlays,
    modules,
    obligations,
    ownersRequired,
    reasoning: reasoningFor(lane, flags, overlays),
  };
}

export const answered = (a: Answers) => DIMENSIONS.filter((d) => a[d.id]).length;
export const totalDimensions = DIMENSIONS.length;
