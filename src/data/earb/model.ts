// The EARB operating model. Published in full so the framework page, the
// readiness tool and the JSON endpoint can never disagree with each other.

/* ------------------------------------------------------------ what it is */

export const EARB_PURPOSE = {
  is: [
    'A stage gate. It decides whether an initiative may proceed, not whether it gets funded.',
    'A conformance test against published standards, principles and technology positions.',
    'A forum for challenge before commitment, when a team asks for it.',
    'A record. The reasoning behind a decision outlives the people who made it.',
  ],
  isNot: [
    'A funding body. If it controls money it will be lobbied rather than consulted.',
    'A design authority. Boards that redesign solutions in the room produce worse designs and slower delivery.',
    'A rubber stamp. If nothing is ever returned, the gate is theatre and everyone knows it.',
    'A place to invent standards. A gate that tests against unpublished opinion is just senior preference.',
  ],
};

/* ------------------------------------------------------------- the triage */

export type RouteId = 'delegated' | 'fast' | 'full';

export const TRIAGE_TESTS: { id: string; name: string; question: string; why: string }[] = [
  {
    id: 'reversibility',
    name: 'Reversibility',
    question: 'If this turns out to be wrong, how expensive is it to undo?',
    why: 'One-way doors deserve a board. Two-way doors deserve a delegate. Most boards waste their credibility on reversible decisions.',
  },
  {
    id: 'blastRadius',
    name: 'Blast radius',
    question: 'Who else is affected — one team, one business unit, or shared platforms?',
    why: 'A decision contained inside one team is that team’s to make. The board exists for the things that cross boundaries.',
  },
  {
    id: 'novelty',
    name: 'Novelty',
    question: 'Is this new to the estate, or an instance of a pattern already approved?',
    why: 'Repeat instances of an approved pattern should be a notification, not a review. Otherwise the board becomes a queue.',
  },
  {
    id: 'materiality',
    name: 'Materiality',
    question: 'What level of commitment is being made — in money, in people, in time?',
    why: 'Governance effort should be proportionate to the size of the bet. Reviewing everything equally means reviewing everything badly.',
  },
];

export const ROUTES: { id: RouteId; label: string; meaning: string; sla: string; color: string }[] = [
  {
    id: 'delegated',
    label: 'Delegated — no board needed',
    meaning:
      'Reversible, contained and conventional. The domain architect or the team decides and records it. Bringing this to the board costs more than the decision is worth.',
    sla: 'Same week, by the accountable architect',
    color: '#34d399',
  },
  {
    id: 'fast',
    label: 'Fast path — chair and one domain architect',
    meaning:
      'Material or novel, but not irreversible and not wide-reaching. Reviewed out of cycle by the chair plus the relevant domain architect, and reported to the next full board.',
    sla: '5 working days',
    color: '#22d3ee',
  },
  {
    id: 'full',
    label: 'Full board',
    meaning:
      'Irreversible, cross-cutting, or a genuine first for the estate. This is what the board is for. Full paper, pre-read, quorum, minuted decision.',
    sla: 'Next scheduled board, paper 48 hours ahead',
    color: '#a78bfa',
  },
];

/* ------------------------------------------------------------- DIA(+C) */

export type AskId = 'decision' | 'information' | 'awareness' | 'consultation';

export const ASK_TYPES: {
  id: AskId;
  code: string;
  label: string;
  meaning: string;
  requires: string[];
  color: string;
}[] = [
  {
    id: 'decision',
    code: 'D',
    label: 'Decision',
    meaning: 'You are asking the board to rule on something you cannot or should not decide alone.',
    requires: [
      'The decision stated as a single answerable question',
      'A named decision owner who will carry it afterwards',
      'The date by which it is needed, and what happens if it slips',
      'Options considered, including doing nothing',
      'Your recommendation, with the reasoning',
    ],
    color: '#a78bfa',
  },
  {
    id: 'consultation',
    code: 'C',
    label: 'Consultation',
    meaning:
      'You are not asking for a ruling. You want challenge on a direction before you commit to it, while changing course is still cheap.',
    requires: [
      'The specific areas where you want challenge',
      'What you have already concluded, and how firmly',
      'What would change your mind',
      'When you intend to commit',
    ],
    color: '#22d3ee',
  },
  {
    id: 'information',
    code: 'I',
    label: 'Information',
    meaning: 'The board needs to know this because it affects decisions it has made or will make. No ruling is sought.',
    requires: [
      'What changed, and when',
      'Which prior decisions or standards this touches',
      'What the board should do differently as a result, if anything',
    ],
    color: '#f59e0b',
  },
  {
    id: 'awareness',
    code: 'A',
    label: 'Awareness',
    meaning: 'Context the board benefits from holding. No action, no decision, no follow-up.',
    requires: ['A short written note — awareness items should not consume meeting time'],
    color: '#64748b',
  },
];

/* --------------------------------------------------- readiness criteria */

export interface Criterion {
  id: string;
  name: string;
  test: string;
  why: string;
  weight: number;
  /** Asked at the board when this criterion is weak. */
  challenge: string;
  /** Only assessed for these ask types. */
  appliesTo: AskId[];
}

export const CRITERIA: Criterion[] = [
  {
    id: 'problem',
    name: 'The problem, in business terms',
    test: 'Can someone outside your team state what problem this solves, without using a product name?',
    why: 'A submission that can only be described through its solution has not identified its problem.',
    weight: 1.3,
    challenge: 'What is the business outcome, and how will you know whether you got it?',
    appliesTo: ['decision', 'consultation', 'information'],
  },
  {
    id: 'ask',
    name: 'The ask is explicit',
    test: 'Is the decision, or the challenge sought, written as a single answerable question?',
    why: 'Most board time is lost working out what is actually being asked. That work belongs in the paper.',
    weight: 1.3,
    challenge: 'What exactly do you want from this board today, and by when?',
    appliesTo: ['decision', 'consultation'],
  },
  {
    id: 'options',
    name: 'Options, including do-nothing',
    test: 'Have you set out the alternatives you rejected, and why — including doing nothing?',
    why: 'A single-option paper is a request for endorsement, not a decision. Do-nothing is always an option and is often the right one.',
    weight: 1.2,
    challenge: 'What else did you consider, and what happens if we simply do not do this?',
    appliesTo: ['decision', 'consultation'],
  },
  {
    id: 'estate',
    name: 'Estate impact',
    test: 'Have you stated what this duplicates, replaces or retires in the existing estate?',
    why: 'Every unexamined addition becomes tomorrow’s technical debt. Rationalisation happens at the gate or it does not happen.',
    weight: 1.25,
    challenge: 'What are we switching off as a result of this, and when?',
    appliesTo: ['decision', 'consultation', 'information'],
  },
  {
    id: 'standards',
    name: 'Standards conformance',
    test: 'Have you tested this against published principles and technology positions, and declared every deviation?',
    why: 'Undeclared deviations found at the board destroy trust. Declared ones are usually accepted.',
    weight: 1.2,
    challenge: 'Which standards does this not meet, and did you tell us before we found out?',
    appliesTo: ['decision', 'consultation'],
  },
  {
    id: 'nfr',
    name: 'Security, data and resilience',
    test: 'Have identity, data classification, residency, and failure behaviour been addressed — not just mentioned?',
    why: 'These are the areas that turn an approved initiative into an incident. They are cheapest to fix before build.',
    weight: 1.15,
    challenge: 'Where does the data live, who can reach it, and what happens when this is unavailable?',
    appliesTo: ['decision', 'consultation'],
  },
  {
    id: 'cost',
    name: 'Cost over life, not cost to build',
    test: 'Do you have run, licence, support and exit costs — not only the delivery estimate?',
    why: 'Build cost is the smallest number in the lifetime. Boards that only see build cost approve liabilities.',
    weight: 1.1,
    challenge: 'What does this cost in year three, and what does it cost to leave?',
    appliesTo: ['decision'],
  },
  {
    id: 'reversibility',
    name: 'Reversibility and exit',
    test: 'If this is wrong in eighteen months, do you know what it takes to unwind it?',
    why: 'Reversible decisions deserve a fast yes. Irreversible ones deserve a slow one. The paper should say which this is.',
    weight: 1.15,
    challenge: 'If this fails, what is the exit, who executes it, and what does it cost?',
    appliesTo: ['decision', 'consultation'],
  },
  {
    id: 'owner',
    name: 'A named risk owner',
    test: 'Is there a named individual accountable for the risks being accepted — not a team or a function?',
    why: 'Risk accepted by a committee is risk accepted by nobody.',
    weight: 1.0,
    challenge: 'Who personally owns this risk once we approve it?',
    appliesTo: ['decision', 'consultation'],
  },
  {
    id: 'preread',
    name: 'Pre-read circulated',
    test: 'Was the paper circulated at least 48 hours before the board?',
    why: 'Without a pre-read, the meeting becomes a reading session and the decision becomes a reaction.',
    weight: 0.9,
    challenge: 'We are reading this for the first time. Should this be deferred?',
    appliesTo: ['decision', 'consultation', 'information'],
  },
];

/* ----------------------------------------------------- decision outcomes */

export type OutcomeId = 'approved' | 'conditions' | 'rework' | 'deferred' | 'rejected' | 'noted';

export const OUTCOMES: {
  id: OutcomeId;
  label: string;
  meaning: string;
  next: string;
  expiry: string;
  color: string;
}[] = [
  {
    id: 'approved',
    label: 'Approved',
    meaning: 'Proceed as presented. The board has no outstanding concerns.',
    next: 'Record the decision and its reasoning. Rarer than most boards pretend.',
    expiry: '12 months, then re-confirm if not yet started',
    color: '#34d399',
  },
  {
    id: 'conditions',
    label: 'Approved with conditions',
    meaning: 'Proceed, but specific things must be true by specific dates. The most common healthy outcome.',
    next: 'Every condition gets an owner, a date and a closure evidence requirement. Untracked conditions make this identical to plain approval.',
    expiry: '12 months; conditions tracked to closure independently',
    color: '#22d3ee',
  },
  {
    id: 'rework',
    label: 'Returned for rework',
    meaning: 'The direction may be sound but the submission is not reviewable, or a material concern is unresolved.',
    next: 'State precisely what must change. A return without specifics is a waste of two meetings.',
    expiry: 'Return to a named future board',
    color: '#f59e0b',
  },
  {
    id: 'deferred',
    label: 'Deferred — information missing',
    meaning: 'The board cannot responsibly decide with what it has been given.',
    next: 'Name the missing information and who will supply it. Deferral without that is avoidance.',
    expiry: 'Next board, or the fast path if the gap is small',
    color: '#f59e0b',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    meaning: 'This should not proceed in this form. Rare, and should be unambiguous when it happens.',
    next: 'Record the reasoning in full. The next team to propose something similar deserves to know why.',
    expiry: 'Permanent until materially different',
    color: '#64748b',
  },
  {
    id: 'noted',
    label: 'Noted',
    meaning: 'For information and awareness items. The board has received it; no decision was sought.',
    next: 'Minute it. No follow-up.',
    expiry: 'n/a',
    color: '#64748b',
  },
];

/* ------------------------------------------------------------ integrity */

export const INTEGRITY_RULES: { name: string; rule: string; why: string }[] = [
  {
    name: 'Quorum',
    rule: 'The chair plus domain architects covering the areas in scope, plus at least two federated architects from business units not submitting.',
    why: 'A board made up mostly of the submitting side is not a review.',
  },
  {
    name: 'Conflict of interest',
    rule: 'An architect does not vote on their own business unit’s submission. They present, answer, and withdraw from the decision.',
    why: 'This is the most common integrity failure and the easiest to prevent.',
  },
  {
    name: 'Recorded dissent',
    rule: 'Any member may have their disagreement minuted, named, with the reason.',
    why: 'Federated architects who cannot register dissent stop attending, and the board loses the people it most needs.',
  },
  {
    name: 'Who decides',
    rule: 'State it in the terms of reference: the chair decides, having heard the board. Not a vote, not consensus.',
    why: 'Unstated decision rights turn every contentious item into an argument about process.',
  },
  {
    name: 'No paper, no slot',
    rule: 'Items without a circulated pre-read are removed from the agenda, not discussed informally.',
    why: 'One exception sets the precedent that the deadline is optional.',
  },
];

export const WAIVER = {
  name: 'Exceptions and waivers',
  summary:
    'Every governance process needs a sanctioned way to say “we are proceeding anyway”. Without one, teams route around the board and you lose sight of exactly the risks you most need to see.',
  requirements: [
    'A named individual accepting the risk, senior enough to carry it',
    'An expiry date — waivers are temporary or they are just an exemption',
    'The remediation, or an explicit statement that there will be none',
    'Entry on a waiver register reviewed at every board',
  ],
  warning:
    'A waiver register that only grows is the clearest possible evidence that the standards are wrong, not that the teams are.',
};

/* ------------------------------------------------------------- metrics */

export const HEALTH_METRICS: { name: string; measure: string; target: string; signal: string }[] = [
  { name: 'Decision cycle time', measure: 'Submission to minuted decision', target: 'Under 10 working days', signal: 'The single best predictor of whether teams use the board or route around it' },
  { name: 'First-time approval rate', measure: 'Approved or approved-with-conditions on first presentation', target: '60–80%', signal: 'Below 50% the entry criteria are unclear. Above 90% the gate is not testing anything' },
  { name: 'Condition closure rate', measure: 'Conditions closed by their due date', target: 'Above 85%', signal: 'Low closure means approvals are unconditional in practice' },
  { name: 'Waiver ageing', measure: 'Open waivers past expiry', target: 'Near zero', signal: 'A growing register means the standards do not match reality' },
  { name: 'Bypass rate', measure: 'Initiatives found in delivery that never came to the board', target: 'Near zero', signal: 'The honest measure of whether the board has authority' },
  { name: 'Agenda mix', measure: 'Share of items by D / C / I / A', target: 'Decision items under half', signal: 'An agenda that is all decisions means delegation has failed' },
  { name: 'Rework rate', measure: 'Items returned more than once', target: 'Under 10%', signal: 'Repeat returns usually mean the board is not saying what it actually wants' },
];

/* --------------------------------------------------------- anti-patterns */

export const ANTI_PATTERNS: { name: string; looks: string; costs: string }[] = [
  {
    name: 'The funding gate in disguise',
    looks: 'Approval is spoken about as though it releases money, and the agenda follows the investment cycle.',
    costs: 'The board gets lobbied rather than consulted, and architecture quality stops being the subject.',
  },
  {
    name: 'The rubber stamp',
    looks: 'Everything is approved. Returns are seen as a failure of the board rather than a normal outcome.',
    costs: 'Teams stop preparing properly because the outcome is known in advance.',
  },
  {
    name: 'Design by committee',
    looks: 'The board redesigns the solution in the room, live, with twelve people.',
    costs: 'Worse designs, slower delivery, and architects who stop bringing anything unfinished.',
  },
  {
    name: 'The bottleneck',
    looks: 'Monthly cadence, long queue, everything requires the full board.',
    costs: 'Teams route around it. You lose visibility of the riskiest work first.',
  },
  {
    name: 'Architecture police',
    looks: 'The board exists to catch people, and is described that way by delivery teams.',
    costs: 'Submissions become defensive and incomplete. You are told what people think you want to hear.',
  },
  {
    name: 'Standards-free judgement',
    looks: 'Decisions rest on the seniority of whoever is in the room rather than published positions.',
    costs: 'Inconsistent rulings, no precedent, and no way for a team to predict the answer before they arrive.',
  },
  {
    name: 'No teeth',
    looks: 'Decisions are advisory, conditions go untracked, and nothing follows a rejection.',
    costs: 'The board becomes a meeting people attend instead of a gate anything passes through.',
  },
];

/* ------------------------------------------------------------------ FAQ */

export const EARB_FAQ: { q: string; a: string }[] = [
  {
    q: 'What is an Enterprise Architecture Review Board?',
    a: 'An EARB is a stage gate for business and technology initiatives. A chief architect, domain architects and federated architects from the business units review proposals against published standards and decide whether they may proceed. It is not a funding body and not a design authority — it tests conformance, challenges direction, and records the reasoning behind decisions.',
  },
  {
    q: 'What does DIA mean in an architecture review board?',
    a: 'DIA classifies what a team is asking the board for: Decision (a ruling is required), Information (the board needs to know, no ruling sought) or Awareness (context only). A fourth mode, Consultation, is worth adding — the team wants challenge on a direction before committing, while changing course is still cheap. Stating the ask at submission is the single cheapest way to stop a board treating every item as a decision.',
  },
  {
    q: 'What should come to the board, and what should not?',
    a: 'Triage on four tests: reversibility, blast radius, novelty and materiality. Reversible, contained, conventional and small decisions should be delegated and recorded. Irreversible, cross-cutting or genuinely novel ones belong at the full board. Everything in between takes a fast path — the chair plus one domain architect, reported back to the next board.',
  },
  {
    q: 'What outcomes can a review board give?',
    a: 'Six: approved; approved with conditions; returned for rework; deferred because information is missing; rejected; or noted for information and awareness items. Approved with conditions is the most common healthy outcome — but only if every condition has an owner, a date and closure evidence. Untracked conditions make it identical to unconditional approval.',
  },
  {
    q: 'How do you stop a review board becoming a bottleneck?',
    a: 'Delegate aggressively using entry criteria, publish a service level for decisions, run a fast path for anything that is not irreversible or cross-cutting, and measure decision cycle time. Boards that take weeks get routed around, which means you lose visibility of the riskiest work first.',
  },
  {
    q: 'How do you measure whether a review board is working?',
    a: 'Decision cycle time, first-time approval rate, condition closure rate, waiver ageing, bypass rate, agenda mix and rework rate. A board that does not measure itself cannot defend its existence when budgets tighten — and governance functions are cut early.',
  },
];
