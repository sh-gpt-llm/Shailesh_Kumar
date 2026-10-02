// The NEXA framework. This file is the published methodology: every score,
// band and question a visitor sees is derived from here, so the rubric and the
// tool can never disagree.

export type DimensionId = 'gap' | 'differentiation' | 'overlap' | 'strategy' | 'timeToValue' | 'reversibility';

export interface Anchor {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export interface Dimension {
  id: DimensionId;
  name: string;
  question: string;
  why: string;
  weight: number;
  anchors: Anchor[];
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 'gap',
    name: 'Capability gap',
    question: 'How much of this need is unmet by what you already run?',
    why: 'The cheapest capability is the one you have already bought. Nothing else matters until this is answered honestly.',
    weight: 1.25,
    anchors: [
      { score: 0, label: 'Fully met today — we already do this' },
      { score: 1, label: 'Largely met; only the edges are missing' },
      { score: 2, label: 'Partly covered, with real friction remaining' },
      { score: 3, label: 'Thinly covered — people are working around it' },
      { score: 4, label: 'Genuinely unmet; nothing we own addresses it' },
    ],
  },
  {
    id: 'differentiation',
    name: 'Differentiation',
    question: 'How hard would an established vendor find it to replicate this within twelve months?',
    why: 'Most "innovation" is a feature your incumbent will ship next year. Paying for it twice is the most common avoidable mistake.',
    weight: 1.15,
    anchors: [
      { score: 0, label: 'Commodity — several vendors already ship it' },
      { score: 1, label: 'Incumbents are shipping this within the year' },
      { score: 2, label: 'A real head start, but not a moat' },
      { score: 3, label: 'Hard to copy — proprietary data, network or know-how' },
      { score: 4, label: 'Structurally hard to replicate at all' },
    ],
  },
  {
    id: 'overlap',
    name: 'Estate overlap',
    question: 'How much would this duplicate something you already own?',
    why: 'Duplication is paid for twice — in licence and in the integration tax of running two things that do one job.',
    weight: 1.1,
    anchors: [
      { score: 0, label: 'We already run a direct equivalent' },
      { score: 1, label: 'Close to tools already in the estate' },
      { score: 2, label: 'Some overlap with what we use' },
      { score: 3, label: 'Adjacent, with little real duplication' },
      { score: 4, label: 'No overlap — this is clear ground' },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategic alignment',
    question: 'How closely does this serve a priority you have actually stated?',
    why: 'A technology with no sponsor and no stated priority behind it will stall after the pilot, however good it is.',
    weight: 1.0,
    anchors: [
      { score: 0, label: 'Outside our current focus areas' },
      { score: 1, label: 'Tangential to anything we have committed to' },
      { score: 2, label: 'Adjacent to current priorities' },
      { score: 3, label: 'Supports a stated priority' },
      { score: 4, label: 'Directly advances a top-three priority' },
    ],
  },
  {
    id: 'timeToValue',
    name: 'Time to value',
    question: 'How quickly can this prove or disprove itself?',
    why: 'Speed to evidence is a risk control. Anything that takes a year to fail teaches you nothing you can afford.',
    weight: 0.85,
    anchors: [
      { score: 0, label: 'Multi-year before any real proof' },
      { score: 1, label: 'Twelve months or more' },
      { score: 2, label: 'Six to twelve months' },
      { score: 3, label: 'Provable within a quarter' },
      { score: 4, label: 'Provable in weeks, inside one sprint' },
    ],
  },
  {
    id: 'reversibility',
    name: 'Reversibility',
    question: 'If this turns out to be wrong, how cleanly can you walk away?',
    why: 'Reversible decisions deserve a fast yes. Irreversible ones deserve a slow one. This dimension decides which conversation you are having.',
    weight: 0.65,
    anchors: [
      { score: 0, label: 'Deep lock-in; our data would be hostage' },
      { score: 1, label: 'Costly and disruptive to unwind' },
      { score: 2, label: 'Unwindable with meaningful effort' },
      { score: 3, label: 'Standard formats; genuinely portable' },
      { score: 4, label: 'Trivially reversible — switch it off and stop' },
    ],
  },
];

export const MAX_WEIGHTED = DIMENSIONS.reduce((n, d) => n + d.weight * 4, 0);

/* ------------------------------------------------------------- size of ask */

export type AskId = 'low' | 'moderate' | 'significant' | 'major';

export interface Ask {
  id: AskId;
  label: string;
  detail: string;
  /** The composite score this commitment has to clear. Bigger asks need better cases. */
  bar: number;
}

export const ASKS: Ask[] = [
  { id: 'low', label: 'Low', detail: 'A few weeks of someone’s time. No procurement.', bar: 45 },
  { id: 'moderate', label: 'Moderate', detail: 'A funded pilot. One team, one budget line.', bar: 55 },
  { id: 'significant', label: 'Significant', detail: 'Multi-team, contract negotiation, a real line in the plan.', bar: 65 },
  { id: 'major', label: 'Major', detail: 'Platform-level. Hard to reverse once started.', bar: 75 },
];

/* ----------------------------------------------------------------- verdicts */

export type VerdictId = 'poc' | 'pilot' | 'explore' | 'park';

export interface Verdict {
  id: VerdictId;
  label: string;
  short: string;
  meaning: string;
  color: string;
  nextStep: string;
}

export const VERDICTS: Verdict[] = [
  {
    id: 'poc',
    label: 'Run a proof of concept',
    short: 'Proof of concept',
    meaning:
      'The case clears the bar for what is being asked, and the decision is cheap to reverse. Prove it quickly rather than debate it slowly.',
    color: '#34d399',
    nextStep: 'Agree the single question the proof has to answer, and the date it answers it by.',
  },
  {
    id: 'pilot',
    label: 'Scope a pilot',
    short: 'Pilot',
    meaning:
      'The case is strong, but the commitment is large enough or slow enough that it needs structure — a named sponsor, a scope and an exit.',
    color: '#22d3ee',
    nextStep: 'Write the exit criteria before the start date. Define what failure looks like, in advance.',
  },
  {
    id: 'explore',
    label: 'Explore later',
    short: 'Explore',
    meaning:
      'Real potential, but something is not yet true — the gap is thin, the differentiation is unproven, or the timing is wrong. Keep it in view.',
    color: '#f59e0b',
    nextStep: 'Record the one condition that would change this, and set a date to look again.',
  },
  {
    id: 'park',
    label: 'Park it',
    short: 'Park',
    meaning:
      'Either you already own this capability, or it is not differentiated enough to justify the disruption. Saying no here buys attention for something better.',
    color: '#64748b',
    nextStep: 'Log the reasoning so the same vendor does not get re-assessed from scratch in six months.',
  },
];

export const verdictById = (id: VerdictId) => VERDICTS.find((v) => v.id === id)!;

/* -------------------------------------------------------- gap-path outcomes */

export type RouteId = 'own' | 'extend' | 'scout';

export const ROUTES: { id: RouteId; label: string; meaning: string; color: string }[] = [
  {
    id: 'own',
    label: 'Adopt what you already own',
    meaning: 'Something in your estate already covers this. The work is adoption and enablement, not procurement.',
    color: '#34d399',
  },
  {
    id: 'extend',
    label: 'Extend or build on what you have',
    meaning: 'You are part of the way there. Extending an existing platform will almost always beat introducing a new one.',
    color: '#22d3ee',
  },
  {
    id: 'scout',
    label: 'Worth scouting the market',
    meaning: 'Nothing you run genuinely delivers this. This is the case where looking outside is the right answer.',
    color: '#a78bfa',
  },
];

/* ------------------------------------------------------- diligence question set */

export interface DiligenceDomain {
  id: string;
  name: string;
  prompt: string;
  /** Raised to the top when these dimensions score poorly. */
  triggers: DimensionId[];
}

export const DILIGENCE: DiligenceDomain[] = [
  { id: 'integration', name: 'Integration surface', prompt: 'Which of your core systems must it connect to, and are those connectors real today or on a roadmap?', triggers: ['overlap'] },
  { id: 'identity', name: 'Identity & access', prompt: 'Does it support your identity provider, single sign-on and joiner-mover-leaver process without custom work?', triggers: [] },
  { id: 'security', name: 'Security posture', prompt: 'What independent assurance exists, and what is the blast radius if this vendor is breached?', triggers: ['reversibility'] },
  { id: 'data', name: 'Data residency & privacy', prompt: 'Where does your data physically sit, who can access it, and is it used to train anything?', triggers: [] },
  { id: 'scale', name: 'Scale & resilience', prompt: 'Has it run at your volume, for someone comparable, with an SLA that means something?', triggers: ['timeToValue'] },
  { id: 'exit', name: 'Data governance & exit', prompt: 'On the day you leave, what exactly do you get back, in what format, and how long does it take?', triggers: ['reversibility'] },
  { id: 'viability', name: 'Supportability & viability', prompt: 'How long is the runway, who answers at 2am, and what happens to you if they are acquired?', triggers: ['differentiation'] },
  { id: 'commercial', name: 'Commercial shape', prompt: 'How does the price move as you succeed with it? Model the cost at ten times today’s usage.', triggers: [] },
];

/* --------------------------------------------------------- vendor questions */

export const VENDOR_QUESTIONS: { q: string; why: string }[] = [
  {
    q: 'What makes your approach genuinely hard for an incumbent to copy within twelve months?',
    why: 'Separates a durable advantage from a feature that your existing vendor will ship for free next year.',
  },
  {
    q: 'What would a ninety-day proof have to demonstrate for us to commit real budget?',
    why: 'A vendor who cannot answer this has not thought about your decision, only about their pipeline.',
  },
  {
    q: 'Who is your most similar customer, at our scale, and may we speak to them unaccompanied?',
    why: 'The word "unaccompanied" is the whole question. Reference calls with a seller present are theatre.',
  },
  {
    q: 'What does your product deliberately not do, and who should not buy it?',
    why: 'A vendor with no honest answer here will not tell you the truth about anything harder.',
  },
  {
    q: 'On the day we leave, what do we get back, in what format, and how long does it take?',
    why: 'Exit terms are cheapest to negotiate before you sign and impossible to negotiate after.',
  },
  {
    q: 'How does our cost change if usage grows tenfold?',
    why: 'Turns a per-seat price into the number that will actually appear in a future budget.',
  },
];

/* --------------------------------------------------------------------- FAQ */

export const NEXA_FAQ: { q: string; a: string }[] = [
  {
    q: 'What is NEXA?',
    a: 'NEXA is a free decision framework for emerging technology. It scores a vendor, product or capability gap across six dimensions — capability gap, differentiation, estate overlap, strategic alignment, time to value and reversibility — and returns one of four verdicts: run a proof of concept, scope a pilot, explore later, or park it.',
  },
  {
    q: 'How does NEXA decide the verdict?',
    a: 'Each dimension is scored zero to four against published anchors. The scores are weighted into a composite out of one hundred, which is then compared against a bar set by the size of the commitment being asked for. A small, reversible ask clears at forty-five; a platform-level commitment has to clear seventy-five. The arithmetic is published and reproducible — there is no hidden model.',
  },
  {
    q: 'Does NEXA use AI to make the assessment?',
    a: 'No. Every judgement is yours; NEXA supplies the structure, the scoring and the consistency. That is deliberate. A framework you can audit, defend in a steering committee and reproduce six months later is worth more than an opinion from a model you cannot inspect.',
  },
  {
    q: 'Why does it ask what I already own?',
    a: 'Because the most common and most expensive mistake in technology selection is buying something you already have. Estate overlap is weighted heavily, and an assessment that finds a direct equivalent already in place is parked regardless of how good the new option looks.',
  },
  {
    q: 'Is my data sent anywhere?',
    a: 'No. Every assessment stays in your own browser. There is no account, no server and no telemetry on the content of what you assess. You can export your assessments as CSV or JSON, or share one as a link that encodes the scores in the URL itself.',
  },
  {
    q: 'Can I use this framework in my own organisation?',
    a: 'Yes, with attribution. The dimensions, anchors, weights and verdict bands are published in full so they can be adopted, adapted or argued with. The entire framework — including the composite formula and the ordered verdict rules — is also available as machine-readable JSON at /nexa/data.json.',
  },
];
