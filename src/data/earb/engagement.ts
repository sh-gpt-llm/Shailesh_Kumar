// A triage questionnaire that routes an initiative to the right level of
// architecture engagement. Industry-agnostic by design: no vendor lists, no
// currency thresholds and no organisation-specific taxonomy, because those are
// the parts every organisation has to set for itself.

export type Level = 'none' | 'single' | 'board' | 'unsure';

export const LEVELS: { id: Exclude<Level, 'unsure'>; label: string; summary: string; sla: string; color: string }[] = [
  {
    id: 'none',
    label: 'No architecture engagement needed',
    summary:
      'Local, reversible work on approved technology with no sensitive data and no new integration. Decide it, record it, get on with it.',
    sla: 'Proceed now — record the decision locally',
    color: '#34d399',
  },
  {
    id: 'single',
    label: 'One architect, lightweight review',
    summary:
      'Moderate scope, or something you are genuinely unsure about. A single architect can resolve this without a board, usually inside a week.',
    sla: 'Around 5 working days',
    color: '#f59e0b',
  },
  {
    id: 'board',
    label: 'Formal review board',
    summary:
      'Enterprise impact, a standards exception, a significant commitment, or something genuinely new to the estate. This needs the board, a paper and a pre-read.',
    sla: 'Next scheduled board — paper 48 hours ahead',
    color: '#f43f5e',
  },
];

export const levelMeta = (id: Exclude<Level, 'unsure'>) => LEVELS.find((l) => l.id === id)!;

export interface EngageOption {
  level: Level;
  text: string;
}

export interface EngageQuestion {
  id: string;
  topic: string;
  question: string;
  hint: string;
  /** Why this question earns a place in a ten-question triage. */
  why: string;
  options: EngageOption[];
}

const UNSURE: EngageOption = {
  level: 'unsure',
  text: 'Not sure, or not applicable — flag it so an architect can confirm.',
};

export const ENGAGE_QUESTIONS: EngageQuestion[] = [
  {
    id: 'newTech',
    topic: 'New technology or supplier',
    question: 'Does this introduce a product, platform or supplier you do not already run?',
    hint: 'Includes SaaS, cloud services, new runtimes, and suppliers not already under contract.',
    why: 'Anything new to the estate carries integration, support and exit obligations that outlast the project that bought it.',
    options: [
      { level: 'none', text: 'Uses an existing approved tool, with no material architecture change.' },
      { level: 'single', text: 'Adds a new module or capability to a platform or supplier already approved.' },
      { level: 'board', text: 'Introduces a product, platform, service or supplier not already in use.' },
      UNSURE,
    ],
  },
  {
    id: 'duplication',
    topic: 'Capability duplication',
    question: 'Could this duplicate a capability that already exists somewhere in the organisation?',
    hint: 'Think of the capability, not the product name — content management, case handling, analytics, scheduling, identity.',
    why: 'Duplication is the single largest and most avoidable contributor to technical debt, and it is almost always invisible from inside one team.',
    options: [
      { level: 'none', text: 'No overlap with anything we already run.' },
      { level: 'single', text: 'Possible overlap with a local or team tool — needs confirming.' },
      { level: 'board', text: 'Introduces a capability that demonstrably exists elsewhere in the organisation.' },
      UNSURE,
    ],
  },
  {
    id: 'ai',
    topic: 'AI and automated decisioning',
    question: 'Does the solution include AI, machine learning or automated decision-making?',
    hint: 'Includes embedded vendor AI, copilots, predictive models, language models and agentic workflows.',
    why: 'Automated decisions create explainability, bias and accountability obligations that conventional software does not.',
    options: [
      { level: 'none', text: 'No AI, machine learning or automated decisioning.' },
      { level: 'single', text: 'Vendor-embedded AI in an approved platform, used internally for productivity only.' },
      { level: 'board', text: 'AI that shapes decisions, produces external-facing output, or operates in a regulated process.' },
      UNSURE,
    ],
  },
  {
    id: 'data',
    topic: 'Data sensitivity and regulatory exposure',
    question: 'What kind of data does this hold, and where does it sit?',
    hint: 'Consider personal data, commercially sensitive data, regulated records, and where the data physically resides.',
    why: 'Data classification and residency are cheap to design in and extremely expensive to retrofit after go-live.',
    options: [
      { level: 'none', text: 'Non-sensitive internal data only, held where we already hold it.' },
      { level: 'single', text: 'Personal or commercially sensitive data, within existing approved boundaries.' },
      { level: 'board', text: 'Regulated records, special-category data, or a new jurisdiction or residency requirement.' },
      UNSURE,
    ],
  },
  {
    id: 'reach',
    topic: 'Organisational reach',
    question: 'How much of the organisation does this touch?',
    hint: 'Count the business units, functions or divisions that would use it or be affected by it.',
    why: 'A decision contained inside one team belongs to that team. The board exists for the things that cross boundaries.',
    options: [
      { level: 'none', text: 'One team, or one business unit.' },
      { level: 'single', text: 'Two business units.' },
      { level: 'board', text: 'Three or more business units, or it creates an organisation-wide capability.' },
      UNSURE,
    ],
  },
  {
    id: 'scale',
    topic: 'Scale and geography',
    question: 'What is the scale and geographic reach?',
    hint: 'Consider user numbers, sites, countries and whether it touches operationally critical groups.',
    why: 'Scale changes the architecture. A design that works for one site and two hundred users frequently does not survive ten times either.',
    options: [
      { level: 'none', text: 'Single site or country, a small user base, no operationally critical groups.' },
      { level: 'single', text: 'Multiple sites or countries within one region, or a mid-sized user base.' },
      { level: 'board', text: 'Multi-region or global, a large user base, or it touches operationally critical functions.' },
      UNSURE,
    ],
  },
  {
    id: 'integration',
    topic: 'Integration surface',
    question: 'How many systems or integrations does this touch?',
    hint: 'Count applications, interfaces and data flows — and note whether any pattern is new to you.',
    why: 'Integration is where most delivery overruns and most operational fragility originate, and it is rarely visible in a business case.',
    options: [
      { level: 'none', text: 'One application, no integration, or a single existing pattern reused.' },
      { level: 'single', text: 'A handful of applications or integrations, all using approved patterns.' },
      { level: 'board', text: 'Many systems, a critical platform, a new integration pattern, or integration beyond the organisation.' },
      UNSURE,
    ],
  },
  {
    id: 'exception',
    topic: 'Standards deviation',
    question: 'Are you asking for an exception to any published standard?',
    hint: 'Includes unapproved technology, bypassing a mandated pattern, or extending a tactical workaround past its agreed end date.',
    why: 'Declared deviations are usually accepted. Deviations discovered at the board rarely are, and they cost the team its credibility.',
    options: [
      { level: 'none', text: 'Fully aligned with published standards and approved technology. No exceptions.' },
      { level: 'single', text: 'A minor deviation with a clear remediation path, or genuine uncertainty about alignment.' },
      { level: 'board', text: 'A formal exception — unapproved technology, a bypassed pattern, or an extended workaround.' },
      UNSURE,
    ],
  },
  {
    id: 'displacement',
    topic: 'Estate displacement',
    question: 'Does this retire, replace or consolidate anything already running?',
    hint: 'Any change that removes a system of record, displaces a platform, or merges several tools into one.',
    why: 'Displacement is where rationalisation actually happens — and where migration, data retention and cutover risk concentrate.',
    options: [
      { level: 'none', text: 'An enhancement to something existing. Nothing is displaced.' },
      { level: 'single', text: 'Retires or replaces a local or team application, or extends the life of one already marked for retirement.' },
      { level: 'board', text: 'Replaces, consolidates or retires a major business capability or system of record.' },
      UNSURE,
    ],
  },
  {
    id: 'commitment',
    topic: 'Commitment and reversibility',
    question: 'How large is the commitment, and how easily could you walk away?',
    hint: 'Consider contract term, total committed value over the full term, and what it would take to unwind in eighteen months.',
    why: 'Renewals are the most commonly skipped trigger. A multi-year renewal of a long-standing platform locks in yesterday’s architecture by default — review it before signing, not after.',
    options: [
      { level: 'none', text: 'No contractual commitment, or a short term that is cheap to reverse.' },
      { level: 'single', text: 'A multi-year term or renewal of moderate value, unwindable with effort.' },
      { level: 'board', text: 'A major or multi-year commitment, a significant renewal, or something effectively irreversible once started.' },
      UNSURE,
    ],
  },
];

/* --------------------------------------------------------------- outcomes */

export const ENGAGE_RULES = [
  { order: 1, condition: 'any answer is a board trigger', result: 'board' },
  { order: 2, condition: 'any answer is a single-architect trigger, or any answer is “not sure”', result: 'single' },
  { order: 3, condition: 'otherwise', result: 'none' },
];

export const NEXT_STEPS: Record<Exclude<Level, 'unsure'>, string[]> = {
  none: [
    'Record the decision where your team will find it in a year — who decided, when, and on what basis.',
    'Re-run this if the scope grows. Most initiatives that should have come to architecture started out not needing to.',
    'If a supplier conversation starts, come back before anything is signed.',
  ],
  single: [
    'Approach an architect now rather than at the end — the point of a lightweight review is that it is cheap while things are still changeable.',
    'Bring a short written description. The summary from this page is a reasonable starting point.',
    'Resolve any “not sure” answers first. They are the quickest thing to clear and they often change the route.',
    'Keep the summary. If scope grows, it evidences why the level changed.',
  ],
  board: [
    'Find the next board date and work backwards. The paper is usually due 48 hours ahead.',
    'Check your submission is actually reviewable before you write it — the readiness check will tell you what is missing.',
    'Declare every standards deviation in the paper. Undeclared ones found in the room cost far more.',
    'Name the individual accountable for the risks being accepted. Not a team, a person.',
    'Agree what you want from the board: a decision, or challenge on a direction you have not committed to yet.',
  ],
};

export const ENGAGE_FAQ: { q: string; a: string }[] = [
  {
    q: 'How do I know whether my project needs enterprise architecture involvement?',
    a: 'Ten triage questions answer it reliably: does it introduce new technology or a new supplier, could it duplicate an existing capability, does it involve AI or automated decisioning, what data does it hold, how many business units does it touch, what is its scale and geography, how large is its integration surface, does it need an exception to a standard, does it displace anything already running, and how large and reversible is the commitment. The highest trigger across those ten sets the level of engagement required.',
  },
  {
    q: 'What are the levels of architecture engagement?',
    a: 'Three. No engagement, for local reversible work on approved technology. A lightweight review by a single architect, for moderate scope or genuine uncertainty — typically resolved within a week. And a formal review board, for enterprise impact, standards exceptions, significant or irreversible commitments, or anything genuinely new to the estate.',
  },
  {
    q: 'What if I am not sure how to answer a question?',
    a: 'Answering “not sure” raises the engagement level to a lightweight architect review rather than lowering it. Uncertainty is itself a reason to talk to someone, and it is usually the cheapest conversation in the whole process. An unsure answer never reduces the recommended level.',
  },
  {
    q: 'Does a contract renewal need architecture review?',
    a: 'Multi-year renewals are the most commonly skipped trigger and one of the most expensive. Renewing a long-standing platform without review locks in the architecture you had when you first bought it, including any capability you have since duplicated elsewhere. Review before signing, not after — once signed, the decision is made for the length of the term.',
  },
];
