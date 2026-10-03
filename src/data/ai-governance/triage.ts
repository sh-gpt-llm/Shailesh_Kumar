// Classification dimensions, published triage rules, and the obligation map.
//
// The obligation map is the part most intake processes omit: a risk tier tells
// you how much review to do, but not what you are actually required to produce.

export type Lane = 'prohibited' | 'high' | 'standard' | 'fast';
export type DimensionId =
  | 'prohibited'
  | 'providerRole'
  | 'aiType'
  | 'dataSensitivity'
  | 'affectedPopulation'
  | 'materialConsequences'
  | 'autonomy'
  | 'impactOfError'
  | 'reversibility'
  | 'deploymentContext';

export interface DimensionOption {
  value: string;
  label: string;
  /** Flags consumed by the published rules. */
  flags?: string[];
}

export interface Dimension {
  id: DimensionId;
  name: string;
  question: string;
  hint: string;
  why: string;
  options: DimensionOption[];
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 'prohibited',
    name: 'Prohibited-practice screen',
    question: 'Does the system do any of the following?',
    hint: 'Social scoring, untargeted scraping of facial images, emotion inference in workplaces or education, biometric categorisation by protected characteristic, or exploiting the vulnerability of a specific group.',
    why: 'These are not risk-rated. They are a hard stop, and they are screened first so that nothing downstream can override them.',
    options: [
      { value: 'none', label: 'None of these apply.' },
      { value: 'unsure', label: 'Possibly, or I am not certain.', flags: ['prohibited-review'] },
      { value: 'yes', label: 'Yes, one or more of these describes the system.', flags: ['prohibited'] },
    ],
  },
  {
    id: 'providerRole',
    name: 'Your role',
    question: 'What is your organisation’s role in relation to this system?',
    hint: 'The same system creates very different obligations depending on whether you build it, badge it or merely use it.',
    why: 'Provider and deployer obligations differ substantially, and accountability must terminate inside your organisation either way.',
    options: [
      { value: 'deployer-approved', label: 'Using an approved tool already governed elsewhere in the organisation.' },
      { value: 'deployer', label: 'Deploying a third-party system under our own control.', flags: ['deployer'] },
      { value: 'provider-internal', label: 'Building it ourselves for internal use.', flags: ['provider'] },
      { value: 'provider-market', label: 'Building it and placing it on the market, or putting our name on someone else’s.', flags: ['provider', 'placing-on-market'] },
    ],
  },
  {
    id: 'aiType',
    name: 'Type of system',
    question: 'What kind of AI is this?',
    hint: 'Judge by what the system does in production, not by what the vendor calls it.',
    why: 'Generative and agentic systems carry whole categories of risk that classical machine learning does not.',
    options: [
      { value: 'rules', label: 'Rule-based automation with no learned model.' },
      { value: 'classical', label: 'Classical machine learning — classification, regression, forecasting.' },
      { value: 'genai', label: 'Generative AI, including anything built on a foundation model.', flags: ['genai'] },
      { value: 'agentic', label: 'Agentic — it plans, calls tools, holds memory, or acts without per-step approval.', flags: ['genai', 'agentic'] },
    ],
  },
  {
    id: 'dataSensitivity',
    name: 'Data sensitivity',
    question: 'What is the most sensitive data the system touches?',
    hint: 'Include training data, retrieval sources, prompts and outputs — prompts are frequently the forgotten one.',
    why: 'Special-category data changes both the lawful basis and the assessment depth required.',
    options: [
      { value: 'public', label: 'Public or non-sensitive internal data only.' },
      { value: 'confidential', label: 'Commercially confidential data, no personal data.' },
      { value: 'personal', label: 'Personal data.', flags: ['personal'] },
      { value: 'special', label: 'Special-category personal data, or sector-regulated records.', flags: ['personal', 'special'] },
    ],
  },
  {
    id: 'affectedPopulation',
    name: 'Who is affected',
    question: 'Who is on the receiving end of this system’s output?',
    hint: 'Not who uses it — who is affected by what it produces.',
    why: 'Vulnerability and scale determine whether an error is an inconvenience or a harm.',
    options: [
      { value: 'none', label: 'Nobody directly — internal analysis or drafting only.' },
      { value: 'staff', label: 'Our own staff.' },
      { value: 'customers', label: 'Customers or members of the public.', flags: ['public-affected'] },
      { value: 'vulnerable', label: 'Groups in a position of dependency or vulnerability.', flags: ['public-affected', 'vulnerable'] },
    ],
  },
  {
    id: 'materialConsequences',
    name: 'Material consequences',
    question: 'What does the output actually do to a person?',
    hint: 'Consider eligibility, access, pricing, employment, education, credit, safety and anything legally binding.',
    why: 'This is the dimension that most often moves a system into the high-risk category, and the one teams most often understate.',
    options: [
      { value: 'none', label: 'Informational only. A person makes every decision with other evidence.' },
      { value: 'influences', label: 'It materially influences a decision a human then makes.', flags: ['influences'] },
      { value: 'determines', label: 'It effectively determines an outcome affecting a person’s rights, access, livelihood or safety.', flags: ['determines', 'material-effect'] },
    ],
  },
  {
    id: 'autonomy',
    name: 'Human oversight',
    question: 'How much human involvement is there in practice?',
    hint: 'Answer for how it will actually run at volume, not how the pilot ran.',
    why: 'Oversight claimed in a design document and oversight evidenced in operation are different things.',
    options: [
      { value: 'in', label: 'In the loop — a human approves each output before it has effect.' },
      { value: 'on', label: 'On the loop — it acts, a human monitors and can intervene.', flags: ['semi-autonomous'] },
      { value: 'over', label: 'Over the loop — humans review samples and aggregate behaviour only.', flags: ['semi-autonomous'] },
      { value: 'out', label: 'Out of the loop — no routine human involvement.', flags: ['autonomous'] },
    ],
  },
  {
    id: 'impactOfError',
    name: 'Impact of error',
    question: 'If the system is confidently wrong, what is the worst realistic outcome?',
    hint: 'Realistic, not theoretical. If you cannot describe it concretely, that is itself a finding.',
    why: 'Consequence of failure, not probability of failure, sets the depth of assessment.',
    options: [
      { value: 'low', label: 'Minor inefficiency or rework.' },
      { value: 'moderate', label: 'Financial loss, or a poor experience for an individual.' },
      { value: 'high', label: 'Significant financial, legal or reputational damage, or unfair treatment of a person.', flags: ['high-impact'] },
      { value: 'critical', label: 'Harm to health, safety, fundamental rights, or critical operations.', flags: ['high-impact', 'critical'] },
    ],
  },
  {
    id: 'reversibility',
    name: 'Reversibility',
    question: 'If it acts wrongly, how easily can the effect be undone?',
    hint: 'Consider the action itself and anything downstream that consumed it.',
    why: 'Reversible decisions deserve a fast yes. Irreversible ones deserve a slow one.',
    options: [
      { value: 'reversible', label: 'Trivially reversible before anything depends on it.' },
      { value: 'recoverable', label: 'Recoverable with effort inside a useful window.' },
      { value: 'costly', label: 'Costly and disruptive to unwind.', flags: ['hard-to-reverse'] },
      { value: 'irreversible', label: 'Effectively irreversible once it has acted.', flags: ['hard-to-reverse', 'irreversible'] },
    ],
  },
  {
    id: 'deploymentContext',
    name: 'Deployment context',
    question: 'Where does the system sit?',
    hint: 'Whether people outside the organisation encounter it, directly or through its output.',
    why: 'External exposure brings disclosure obligations and removes your ability to quietly correct mistakes.',
    options: [
      { value: 'internal', label: 'Internal only.' },
      { value: 'customer', label: 'Customer-facing.', flags: ['external'] },
      { value: 'public', label: 'Publicly accessible.', flags: ['external', 'public'] },
    ],
  },
];

/* ---------------------------------------------------------------- tiers */

export const LANES: { id: Lane; label: string; meaning: string; sla: string; color: string }[] = [
  {
    id: 'prohibited',
    label: 'Stop — prohibited-practice review',
    meaning:
      'The screen flagged a practice that may be prohibited outright. This is not a risk rating to be mitigated; it goes to legal review before any further work, and may not proceed at all.',
    sla: 'Immediate — legal review before any build, procurement or pilot',
    color: '#f43f5e',
  },
  {
    id: 'high',
    label: 'High-risk lane',
    meaning:
      'Full assessment across every applicable module, plus independent second-line review. If you are the provider, a conformity route applies before this may be placed on the market.',
    sla: 'Scheduled assessment — expect weeks, and plan for it',
    color: '#f59e0b',
  },
  {
    id: 'standard',
    label: 'Standard lane',
    meaning: 'Full assessment at proportionate depth, with the modules and overlays listed below.',
    sla: 'Typically 10–20 working days',
    color: '#22d3ee',
  },
  {
    id: 'fast',
    label: 'Fast lane',
    meaning:
      'Attestation-only. Register it, name the owners, confirm the boundaries, proceed. The point of a fast lane is that most AI is genuinely low-risk and should not queue behind the things that are not.',
    sla: 'Under 10 working days',
    color: '#34d399',
  },
];

export const laneMeta = (id: Lane) => LANES.find((l) => l.id === id)!;

/* -------------------------------------------------------- published rules */

export const TRIAGE_RULES = [
  { order: 1, name: 'Prohibited pre-screen', condition: 'any prohibited-practice flag', result: 'Stop — legal review. Nothing downstream can override this.' },
  { order: 2, name: 'High-risk short-circuit', condition: 'the output determines an outcome affecting a person, OR special-category data is involved with real-world effect, OR impact of error is critical, OR the system is autonomous and hard to reverse', result: 'High-risk lane with independent review' },
  { order: 3, name: 'Generative overlay', condition: 'the system is generative, or built on a third-party foundation model', result: 'Adds the generative overlay — grounding, confabulation, prompt injection, provenance, IP, vendor model change' },
  { order: 4, name: 'Agentic overlay', condition: 'the system plans, calls tools, holds memory or acts without per-step approval', result: 'Adds the agentic overlay — autonomy classification, agent identity, tool permissions, memory, blast radius, kill-switch' },
  { order: 5, name: 'Fast lane', condition: 'no personal data AND internal only AND nobody externally affected AND not generative or agentic AND reversible AND low impact of error', result: 'Fast lane — attestation only' },
  { order: 6, name: 'Default', condition: 'anything else', result: 'Standard lane' },
];

/* ------------------------------------------------- assessment modules */

export const MODULES: { id: string; name: string; scope: string; reviewer: string; whenFlags: string[] }[] = [
  { id: 'data', name: 'Data governance', scope: 'Quality, provenance, consent, licensing, retention, cross-border transfer.', reviewer: 'Data governance', whenFlags: ['personal', 'special', 'genai'] },
  { id: 'privacy', name: 'Privacy', scope: 'Lawful basis, impact assessment, data-subject rights, memorisation risk.', reviewer: 'Privacy officer / DPO', whenFlags: ['personal', 'special'] },
  { id: 'fria', name: 'Fundamental rights impact assessment', scope: 'Effects on rights of affected people, mitigations, and the oversight arrangements that support them.', reviewer: 'Privacy, legal and responsible AI jointly', whenFlags: ['determines', 'vulnerable'] },
  { id: 'security', name: 'Security', scope: 'Threat model, secure configuration, authentication, secrets, logging, supply chain.', reviewer: 'Security', whenFlags: ['genai', 'agentic', 'external', 'personal'] },
  { id: 'legal', name: 'Legal and regulatory', scope: 'Applicable law, sectoral obligations, intellectual property, contractual exposure.', reviewer: 'Legal counsel', whenFlags: ['determines', 'external', 'placing-on-market', 'genai'] },
  { id: 'rai', name: 'Responsible AI', scope: 'Fairness, transparency, explainability, oversight design, affected parties.', reviewer: 'Responsible AI function', whenFlags: ['influences', 'determines', 'public-affected', 'vulnerable'] },
  { id: 'validation', name: 'Model risk and validation', scope: 'Development, testing, evaluation design, conservatism, monitoring plan.', reviewer: 'Model risk / validation', whenFlags: ['influences', 'determines', 'high-impact', 'genai'] },
  { id: 'architecture', name: 'Architecture', scope: 'Fit with reference architecture, reuse, integration, feasibility.', reviewer: 'Enterprise architecture', whenFlags: ['provider', 'agentic'] },
  { id: 'tprm', name: 'Third-party risk', scope: 'Vendor viability, governance maturity, contract terms, concentration, model change notification.', reviewer: 'Procurement / third-party risk', whenFlags: ['deployer'] },
  { id: 'oversight', name: 'Human oversight design', scope: 'Oversight mode, override authority, automation-bias prevention, appeal route.', reviewer: 'Responsible AI with the business owner', whenFlags: ['influences', 'determines', 'semi-autonomous', 'autonomous'] },
  { id: 'ops', name: 'Operational readiness', scope: 'Operating model, support, monitoring, cost, capacity.', reviewer: 'Operations', whenFlags: ['provider', 'external'] },
];

/* ------------------------------------------------------- obligation map */

export interface Obligation {
  id: string;
  name: string;
  applies: string;
  produce: string;
  anchor: string;
  /** Flag combinations that attach this obligation. 'always' attaches unconditionally. */
  whenFlags: string[];
}

export const OBLIGATIONS: Obligation[] = [
  {
    id: 'literacy',
    name: 'AI literacy',
    applies: 'Everyone. Providers and deployers alike, at every risk level, including fast-lane systems.',
    produce: 'Evidence that the people operating and overseeing the system have sufficient understanding to do so — role-appropriate training records, not a completion certificate.',
    anchor: 'EU AI Act — AI literacy duty on providers and deployers',
    whenFlags: ['always'],
  },
  {
    id: 'transparency',
    name: 'Transparency to people',
    applies: 'Where a person interacts with the system, or where it generates or manipulates content they may take to be genuine.',
    produce: 'User-facing disclosure, and marking of synthetic content where feasible.',
    anchor: 'EU AI Act — transparency obligations for certain AI systems',
    whenFlags: ['external', 'genai', 'public-affected'],
  },
  {
    id: 'fria',
    name: 'Fundamental rights impact assessment',
    applies: 'Deployers of certain high-risk systems, notably public bodies and those providing essential services.',
    produce: 'A documented assessment of the effect on affected people’s rights, the mitigations, the oversight arrangements, and who is accountable.',
    anchor: 'EU AI Act — fundamental rights impact assessment for deployers',
    whenFlags: ['determines'],
  },
  {
    id: 'conformity',
    name: 'Conformity assessment and declaration',
    applies: 'Providers of high-risk systems, before the system may be placed on the market or put into service.',
    produce: 'Technical documentation, the conformity assessment route, an EU declaration of conformity, and CE marking where applicable.',
    anchor: 'EU AI Act — conformity assessment for high-risk systems',
    whenFlags: ['provider+high'],
  },
  {
    id: 'registration',
    name: 'Registration',
    applies: 'High-risk systems, registered in the EU database before being placed on the market or put into service.',
    produce: 'A registration entry, kept current as the system changes.',
    anchor: 'EU AI Act — registration of high-risk systems',
    whenFlags: ['provider+high'],
  },
  {
    id: 'qms',
    name: 'Quality management system',
    applies: 'Providers of high-risk systems.',
    produce: 'A documented quality management system covering design control, data management, testing, post-market monitoring and incident handling. ISO/IEC 42001 is the natural certifiable vehicle.',
    anchor: 'EU AI Act — quality management system; ISO/IEC 42001',
    whenFlags: ['provider+high'],
  },
  {
    id: 'postmarket',
    name: 'Post-market monitoring',
    applies: 'High-risk systems, for the whole time they remain in service.',
    produce: 'A monitoring plan and the evidence it ran — metrics, thresholds, actions taken, and feedback into reassessment.',
    anchor: 'EU AI Act — post-market monitoring',
    whenFlags: ['high'],
  },
  {
    id: 'incident',
    name: 'Serious incident reporting',
    applies: 'Providers of high-risk systems, on becoming aware of a serious incident or malfunction.',
    produce: 'A reporting route to the relevant authority with a defined internal clock, plus the record of what was reported and when. Build the route before you need it.',
    anchor: 'EU AI Act — reporting of serious incidents',
    whenFlags: ['provider+high'],
  },
  {
    id: 'records',
    name: 'Record-keeping and logging',
    applies: 'High-risk systems, with automatic logging over the system’s lifetime.',
    produce: 'Automatically generated logs retained for the period required, and documentation retained after the system is withdrawn.',
    anchor: 'EU AI Act — record-keeping and documentation retention',
    whenFlags: ['high'],
  },
  {
    id: 'oversight',
    name: 'Human oversight',
    applies: 'High-risk systems, designed so oversight is effective rather than nominal.',
    produce: 'Oversight design, named roles able to override, and evidence the override has been exercised.',
    anchor: 'EU AI Act — human oversight for high-risk systems',
    whenFlags: ['high', 'autonomous'],
  },
  {
    id: 'gpai',
    name: 'General-purpose model obligations, inherited',
    applies: 'Anyone building on a third-party foundation model. The provider’s obligations do not become yours, but their documentation is how you discharge your own.',
    produce: 'The model provider’s technical documentation, acceptable-use terms, training-data summary where published, and a contractual route to notification of model change.',
    anchor: 'EU AI Act — general-purpose AI model obligations',
    whenFlags: ['genai', 'deployer'],
  },
  {
    id: 'retention',
    name: 'Retention versus minimisation',
    applies: 'Any high-risk system processing personal data.',
    produce: 'A documented position reconciling long record-retention obligations with data-protection minimisation — typically by separating the decision record from the personal data that informed it.',
    anchor: 'EU AI Act record-keeping, read with GDPR minimisation',
    whenFlags: ['high+personal'],
  },
];

/* ------------------------------------------------------------- scope note */

export const SCOPE_NOTE = {
  heading: 'Does this reach you at all?',
  points: [
    'The EU AI Act applies extraterritorially. A provider or deployer established outside the EU is in scope where the system’s output is used in the EU — which catches a great many organisations that assume they are out of scope.',
    'The provider and deployer split is the first question, not a detail. Badging someone else’s system as your own can make you the provider.',
    'Free and open-source models carry partial exemptions, which do not extend to systems placed on the market as high-risk, nor to prohibited practices.',
    'Sectoral regimes — model risk management in financial services, medical device regulation, employment law — sit on top and frequently bite sooner.',
  ],
};

/* --------------------------------------------------------------- the FAQ */

export const AI_FAQ: { q: string; a: string }[] = [
  {
    q: 'What is an AI intake process?',
    a: 'An AI intake process is the single structured front door through which every proposed or discovered AI use case enters formal governance. It captures the context needed to understand the proposal, classifies its risk, routes it to the right depth of review, and ends in a documented decision. It handles both submitted intake, where a person proposes something, and discovered intake, where scanning, procurement data or vendor disclosure surfaces AI that never came through the door.',
  },
  {
    q: 'How do I know if my AI system is high-risk?',
    a: 'Work through the classification dimensions in order. The decisive questions are whether the output determines an outcome affecting a person’s rights, access, livelihood or safety; whether special-category personal data is involved with real-world effect; whether the worst realistic error causes harm to health, safety or fundamental rights; and whether the system acts autonomously in ways that are hard to reverse. Any one of those routes the system to the high-risk lane. A prohibited-practice screen runs first and overrides everything.',
  },
  {
    q: 'What is the difference between an AI provider and an AI deployer?',
    a: 'A provider develops an AI system, or has one developed, and places it on the market or puts it into service under its own name. A deployer uses an AI system under its own authority. The obligations differ substantially — conformity assessment, registration and serious-incident reporting largely fall on providers, while fundamental rights impact assessment and operational oversight fall on deployers. Putting your own name on a third party’s system can make you the provider.',
  },
  {
    q: 'Who should be accountable for an AI system?',
    a: 'Four named individuals, not teams: a business owner accountable for value and intended use, a technical owner accountable for operational integrity and holding standing authority to pause, a model or agent owner accountable for model selection, prompts, tool permissions and memory, and a data owner accountable for provenance, licensing and right to use. Second-line functions challenge and report; internal audit assures. Risk accepted by a committee is risk accepted by nobody.',
  },
  {
    q: 'What is shadow AI and how do you find it?',
    a: 'Shadow AI is unsanctioned use; ambient AI is capability quietly embedded by vendors into tools you already bought. Neither arrives through the front door, and together they are the largest real exposure in most organisations. Discovery combines procurement and expense analysis, network and SaaS telemetry, identity and OAuth grant review, vendor disclosure requests, repository scanning, and periodic blameless amnesties. The number that matters is the ratio of discovered to submitted — if it is not falling, the front door is not working.',
  },
  {
    q: 'How should agentic AI be governed differently?',
    a: 'Classify autonomy first, because it determines every other control. Then give the agent its own non-human identity with scoped credentials, whitelist its tools under least privilege, bound what it may remember, cap consequential transactions, and contain blast radius so data-modifying actions are reversible by default. Agentic governance assumes agents will occasionally be creative in unproductive ways, so controls constrain blast radius rather than relying on intent — because intent is the thing you cannot inspect.',
  },
  {
    q: 'When should a human be in the loop rather than on the loop?',
    a: 'In the loop, meaning a human approves each output before it has effect, where the output is binding on a person, materially affects rights, access, pricing or employment, or is effectively irreversible. On the loop, where the output influences a decision a person still makes, or where actions are reversible within a useful window. Over the loop, with sample and aggregate review, where output is internal, low-consequence and high-volume. Oversight that leaves no evidence of a human ever disagreeing with the system is decorative.',
  },
  {
    q: 'Does the EU AI Act apply to organisations outside the EU?',
    a: 'Yes, in defined circumstances. The Act reaches providers and deployers established outside the EU where the output produced by the system is used within the EU. Organisations frequently assume they are out of scope on the basis of where they are headquartered, which is the wrong test.',
  },
];
