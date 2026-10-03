// The AI governance operating model: three pillars, the control framework, the
// obligation map and the agentic overlay. Published in full so the framework
// page, the classifier and the JSON endpoint can never disagree.
//
// Deliberately undated. The EU AI Act's phase-in schedule has been amended and
// specific dates are the one thing a reader will check first, so obligations are
// described by category and the primary source is cited instead.

export const SOURCE_NOTE =
  'Anchored to public frameworks: the EU AI Act, NIST AI RMF 1.0 and the Generative AI Profile (NIST AI 600-1), ISO/IEC 42001:2023 and the OECD AI Principles. Obligations are described by category rather than by date, because the Act’s phase-in schedule has been amended — verify current effective dates against the Official Journal before relying on them.';

/* ---------------------------------------------------------------- pillars */

export const PILLARS = [
  {
    id: 'intake',
    name: 'AI Intake',
    question: 'How does an AI idea enter the organisation safely and consistently?',
    outcome: 'Every proposed or discovered use case is captured, classified and routed, with traceability from idea to decision.',
    failure: 'Without it you have a backlog nobody owns, and a shadow estate you cannot measure.',
    color: '#a78bfa',
  },
  {
    id: 'accountability',
    name: 'AI Accountability',
    question: 'Who is answerable when an AI system behaves well — or badly?',
    outcome: 'Named individuals own each system across its life, with evidence, approvals and an escalation path.',
    failure: 'Without it you have owners who do not know what they own, and an hour lost to arguing who may press pause.',
    color: '#22d3ee',
  },
  {
    id: 'responsible',
    name: 'Responsible AI',
    question: 'Are these systems lawful, trustworthy and aligned with what we claim to value?',
    outcome: 'Risk is mapped and mitigated across validity, safety, fairness, transparency, privacy, oversight and the generative and agentic surfaces.',
    failure: 'Without it you get speed and no trust, which is the most expensive combination available.',
    color: '#f59e0b',
  },
];

export const DESIGN_PRINCIPLES = [
  { name: 'One front door', detail: 'Every AI idea reaches one intake. Nothing bypasses governance, including things bought rather than built.' },
  { name: 'Risk-proportionate review', detail: 'Low-risk uses pass in days. High-risk uses get depth. Reviewing everything equally means reviewing everything badly.' },
  { name: 'Named accountability', detail: 'Business, technical, model and data owners recorded at all times. Risk accepted by a committee is risk accepted by nobody.' },
  { name: 'Evidence as a first-class object', detail: 'Decisions are records, not email threads. If it is not in the register, it did not happen.' },
  { name: 'Lifecycle, not one-shot', detail: 'Material change reopens assessment. Monitoring loops back into governance rather than into a dashboard nobody reads.' },
  { name: 'Policy as configuration', detail: 'Controls, questions and thresholds are versioned and changeable without a release. Regulation moves faster than software.' },
  { name: 'Human oversight by design', detail: 'Oversight is designed at the start and evidenced in operation, not asserted in a policy document.' },
];

/* -------------------------------------------------------------- lifecycle */

export const LIFECYCLE = [
  { stage: 'Ideation', scope: 'Before anything formal exists', output: 'Optional idea capture, so demand is visible before it becomes commitment' },
  { stage: 'Intake', scope: 'An idea becomes a submitted use case', output: 'Intake record, unique identifier, named sponsor and owners, initial classification' },
  { stage: 'Triage', scope: 'Lightweight filtering and routing', output: 'Tier, lane, applicable modules and overlays, service level started' },
  { stage: 'Assessment', scope: 'Depth proportionate to tier', output: 'Risk assessment, mitigation plan, reviewer sign-offs' },
  { stage: 'Approval', scope: 'A formal decision', output: 'Decision record with rationale, conditions and an expiry date' },
  { stage: 'Build or procure', scope: 'Delivery or acquisition', output: 'Technical documentation, model and system cards, data lineage, test records' },
  { stage: 'Pre-release validation', scope: 'Evaluation, red teaming, bias and security testing', output: 'Validation evidence and sign-offs proportionate to tier' },
  { stage: 'Conformity', scope: 'Where the system is high-risk and you are the provider', output: 'Conformity assessment, technical documentation, declaration of conformity, registration' },
  { stage: 'Go-live', scope: 'Production enablement', output: 'Owner acceptance, inventory activation, monitoring plan live' },
  { stage: 'Operation and monitoring', scope: 'Continuous', output: 'Telemetry, alerts, post-market monitoring, periodic attestations' },
  { stage: 'Change', scope: 'Material change, including silent vendor model updates', output: 'Change records and re-approval' },
  { stage: 'Incident', scope: 'Unexpected or harmful behaviour', output: 'Incident record, containment, root cause, remediation, regulator notification where required' },
  { stage: 'Reassessment', scope: 'Scheduled or event-driven', output: 'Reassessment record and renewed attestations' },
  { stage: 'Retirement', scope: 'Withdrawal from service', output: 'Decommissioning, data handling, documentation retention' },
  { stage: 'Archival', scope: 'Retention after retirement', output: 'Immutable archive of the full record for the required period' },
];

/* -------------------------------------------------- accountability model */

export const OWNER_ROLES = [
  { role: 'Business Owner', owns: 'Business value, intended use, acceptable-use boundaries, and the continue, change or retire decision.', firstLine: true },
  { role: 'Technical Owner', owns: 'Engineering integrity in operation, incidents, change control, technical evidence. Holds authority to pause without convening anyone.', firstLine: true },
  { role: 'Model or Agent Owner', owns: 'Model selection, evaluation, fine-tuning, prompts, tool permissions, memory scope and content filters.', firstLine: true },
  { role: 'Data Owner', owns: 'Dataset quality, provenance, licensing, consent, retention and right to use.', firstLine: true },
  { role: 'Risk and Compliance', owns: 'Ongoing conformance to policy and obligation, and the triggers that reopen assessment.', firstLine: false },
  { role: 'Privacy Officer / DPO', owns: 'Lawful basis, impact assessments, data-subject rights, cross-border transfer.', firstLine: false },
  { role: 'Security Officer', owns: 'Threat model, vulnerability management, access control, non-human identity, logging.', firstLine: false },
  { role: 'Legal Counsel', owns: 'Contractual exposure, intellectual property, liability, regulatory interpretation.', firstLine: false },
  { role: 'Independent Review', owns: 'Second-line challenge and assurance. Not the same people who built it.', firstLine: false },
  { role: 'Executive Sponsor', owns: 'Ultimate accountability for high-risk systems and for the portfolio as a whole.', firstLine: false },
];

export const THREE_LINES = [
  { line: 'First line', who: 'Business and technology delivery — the four owner roles', does: 'Owns the system, the risk and the day-to-day decisions.' },
  { line: 'Second line', who: 'Risk, compliance, privacy, security, responsible AI', does: 'Sets policy, challenges the first line, reports independently.' },
  { line: 'Third line', who: 'Internal audit', does: 'Provides independent assurance that the first two lines work as described.' },
];

export const ACCOUNTABILITY_MOMENTS = [
  'At intake, when owners are first named',
  'At approval, when conditions are accepted',
  'At go-live, when the owner formally accepts the system',
  'At material change, including a vendor changing the model underneath you',
  'At incident, when someone must have standing authority to stop it',
  'At periodic review, when owners re-attest',
  'At retirement, when someone confirms the data is handled correctly',
];

/* ------------------------------------------------------- control themes */

export interface ControlTheme {
  id: string;
  name: string;
  intent: string;
  controls: string[];
  anchors: string[];
}

export const CONTROL_THEMES: ControlTheme[] = [
  {
    id: 'validity',
    name: 'Validity, reliability and robustness',
    intent: 'The system does what it claims, at the quality it claims, under conditions it will actually meet.',
    controls: [
      'Pre-release validation against a defined acceptance threshold',
      'Benchmark and task-level evaluation with a versioned golden dataset',
      'Regression suite covering prompts, retrieval configuration and model version',
      'Drift detection on inputs and outputs with a defined response action',
      'Safe failure behaviour — degrade or refuse rather than guess',
      'Adversarial and stress testing proportionate to consequence',
    ],
    anchors: ['NIST AI RMF — Measure 2', 'ISO/IEC 42001 — A.6 AI system life cycle', 'ISO/IEC 23894 — AI risk management', 'ISO/IEC 5338 — AI lifecycle processes', 'EU AI Act — accuracy and robustness obligations for high-risk systems', 'OECD — Robustness, security and safety'],
  },
  {
    id: 'safety',
    name: 'Safety and security',
    intent: 'The system cannot be made to cause harm, and cannot become a route into everything behind it.',
    controls: [
      'Threat model covering model theft, inversion, membership inference, data poisoning, prompt injection, supply chain and API abuse',
      'Prompt-injection defence: input segregation, least-privilege tool access from the generative layer, output filtering, detection telemetry',
      'Content filters and refusal behaviour tested, including jailbreak resistance',
      'Kill-switch with named operators, tested on a schedule rather than assumed',
      'Red teaming where the consequence of failure justifies it',
      'Supply-chain assurance for models, weights, datasets and components',
    ],
    anchors: ['NIST AI 600-1 — Information Security', 'OWASP Top 10 for LLM Applications', 'MITRE ATLAS', 'EU AI Act — cybersecurity obligations for high-risk systems', 'ISO/IEC 27001', 'OECD — Robustness, security and safety'],
  },
  {
    id: 'fairness',
    name: 'Fairness and non-discrimination',
    intent: 'The system does not distribute harm unevenly across the people it affects.',
    controls: [
      'Bias assessment before release, with the protected characteristics identified in advance',
      'Sub-group performance measurement, not just aggregate accuracy',
      'Mitigation applied and its effect measured rather than assumed',
      'Residual bias documented and explicitly accepted by a named owner',
      'Monitoring for divergence between sub-groups after release',
    ],
    anchors: ['NIST AI RMF — Measure 2.11', 'EU AI Act — data and data governance obligations', 'ISO/IEC 42001 — A.5 Assessing impacts', 'OECD — Human-centred values and fairness'],
  },
  {
    id: 'transparency',
    name: 'Transparency and disclosure',
    intent: 'People know when they are interacting with AI, and what it can and cannot do.',
    controls: [
      'User-facing disclosure where a person interacts with the system',
      'Marking of synthetic content and provenance signals where feasible',
      'Model and system cards covering intended use, limitations and out-of-scope use',
      'Published statement of what the system does not do',
    ],
    anchors: ['EU AI Act — transparency obligations for certain AI systems', 'ISO/IEC 42001 — A.8 Information for interested parties', 'NIST AI RMF — Govern 4', 'OECD — Transparency and explainability'],
  },
  {
    id: 'explainability',
    name: 'Explainability and contestability',
    intent: 'A decision that affects someone can be explained to them, and challenged.',
    controls: [
      'Decision-level explanation proportionate to consequence',
      'Model logic and feature documentation retained',
      'A route for an affected person to contest an outcome where law or decency requires it',
      'Explanations tested on the people who will actually receive them',
    ],
    anchors: ['NIST AI RMF — Measure 2.9', 'EU AI Act — right to explanation of individual decision-making', 'OECD — Transparency and explainability'],
  },
  {
    id: 'privacy',
    name: 'Privacy and data protection',
    intent: 'Personal data is used lawfully, minimally, and does not leak back out of the model.',
    controls: [
      'Lawful basis recorded before processing begins',
      'Data protection impact assessment where required, and a fundamental rights impact assessment where the deployer is in scope',
      'Minimisation at collection and at prompt construction',
      'Memorisation and extraction testing for models trained or fine-tuned on personal data',
      'Data-subject rights handling that works when the data is inside a model, not only inside a database',
      'Cross-border transfer assessed, including where inference happens',
    ],
    anchors: ['GDPR / UK GDPR', 'EU AI Act — data and data governance; fundamental rights impact assessment', 'NIST AI 600-1 — Data Privacy', 'ISO/IEC 42001 — A.7 Data for AI systems'],
  },
  {
    id: 'oversight',
    name: 'Human oversight',
    intent: 'A human can understand, intervene in and stop the system — in practice, not on paper.',
    controls: [
      'Oversight mode chosen by rule rather than preference (see the oversight decision rule)',
      'Named roles able to override, with overrides logged and reviewed',
      'Automation-bias prevention: the interface must make disagreement easy',
      'Oversight evidence captured as a record, so the control can be audited',
      'Appeal path where the law requires one',
    ],
    anchors: ['EU AI Act — human oversight obligations for high-risk systems', 'NIST AI RMF — Govern 3.2', 'ISO/IEC 42001 — A.9 Use of AI systems'],
  },
  {
    id: 'accountability',
    name: 'Accountability and audit trail',
    intent: 'Every consequential decision has a name against it and survives the people who made it.',
    controls: [
      'Named owners maintained and re-attested on a schedule',
      'Decisions, approvals, overrides and exceptions held as immutable records',
      'Retention aligned to the longest applicable obligation',
      'A point-in-time audit pack producible for any system on demand',
      'Exceptions time-boxed, owned and reviewed — never open-ended',
    ],
    anchors: ['ISO/IEC 42001 — Clause 5 Leadership; A.3 Internal organization', 'EU AI Act — record-keeping and documentation retention', 'NIST AI RMF — Govern 1'],
  },
  {
    id: 'genai',
    name: 'Generative and agentic surfaces',
    intent: 'The risks that only appear once a system can generate, plan, remember and act.',
    controls: [
      'System prompts and templates versioned, reviewed and change-controlled',
      'Retrieval sources explicitly scoped; grounding verified as part of evaluation',
      'Confabulation measured against a threshold, with high-stakes output verified before use',
      'Vendor model updates treated as material change and revalidated',
      'Agent autonomy classified, tool permissions whitelisted, memory scope bounded',
      'Blast-radius containment on consequential actions',
    ],
    anchors: ['NIST AI 600-1 — all twelve risk categories', 'EU AI Act — general-purpose AI obligations', 'ISO/IEC 42001 — A.10 Third-party relationships'],
  },
];

/* ---------------------------------------------- oversight decision rule */

export const OVERSIGHT_RULE = {
  intent:
    'Most frameworks say oversight should be "proportionate to risk" and stop there, which leaves the hardest question unanswered. This is a rule rather than a principle.',
  modes: [
    {
      mode: 'In the loop',
      meaning: 'A human approves each output before it has effect.',
      when: 'The output is binding on a person, materially affects their rights, access, pricing or employment, or is effectively irreversible.',
    },
    {
      mode: 'On the loop',
      meaning: 'The system acts; a human monitors and can intervene.',
      when: 'The output influences a consequential decision but a person still makes it, or actions are reversible within a useful window.',
    },
    {
      mode: 'Over the loop',
      meaning: 'The system acts; humans review samples and aggregate behaviour.',
      when: 'Output is internal, low-consequence and reversible, and volume makes per-item review meaningless.',
    },
    {
      mode: 'Out of the loop',
      meaning: 'No routine human involvement.',
      when: 'Only where the worst realistic outcome is trivial and recoverable. If you cannot describe that outcome, you are not in this category.',
    },
  ],
  note: 'Oversight that exists only in a policy document is not a control. If there is no evidence a human ever disagreed with the system, assume the oversight is decorative.',
};

/* ------------------------------------------------------- GenAI risks */

export const GENAI_RISKS = [
  { n: 1, name: 'CBRN information or capabilities', concern: 'Lowered barriers to chemical, biological, radiological or nuclear weapons information.' },
  { n: 2, name: 'Confabulation', concern: 'Confidently stated false content, delivered in the same tone as correct content.' },
  { n: 3, name: 'Dangerous, violent or hateful content', concern: 'Easier production of radicalising, violent or threatening material.' },
  { n: 4, name: 'Data privacy', concern: 'Leakage of personal data memorised in training; inference of sensitive attributes.' },
  { n: 5, name: 'Environmental impacts', concern: 'Energy and resource intensity of training and inference.' },
  { n: 6, name: 'Harmful bias and homogenisation', concern: 'Amplification of bias and convergence of outputs toward a narrow range.' },
  { n: 7, name: 'Human-AI configuration', concern: 'Over-reliance, misplaced trust and poorly designed oversight.' },
  { n: 8, name: 'Information integrity', concern: 'Misleading content and synthetic media at scale.' },
  { n: 9, name: 'Information security', concern: 'Prompt injection, data poisoning, model theft, AI-assisted attacks.' },
  { n: 10, name: 'Intellectual property', concern: 'Use or reproduction of protected material without permission.' },
  { n: 11, name: 'Obscene, degrading or abusive content', concern: 'Including non-consensual intimate imagery.' },
  { n: 12, name: 'Value chain and component integration', concern: 'Risk inherited from third-party models, data and components you cannot see into.' },
];

/* ----------------------------------------------------- agentic overlay */

export const AUTONOMY_LEVELS = [
  { level: 'Assistive', meaning: 'Proposes; a human does everything.', governance: 'Treat as a generative system. Oversight in the loop by construction.' },
  { level: 'Supervised', meaning: 'Acts within a narrow scope, each action confirmed.', governance: 'Tool permissions whitelisted. Confirmation cannot be bulk-approved.' },
  { level: 'Delegated', meaning: 'Completes multi-step tasks; a human reviews outcomes.', governance: 'Blast-radius limits, transaction caps, full action logging, tested kill-switch.' },
  { level: 'Autonomous', meaning: 'Plans and acts continuously without routine human involvement.', governance: 'Independent review before release. Sandbox by default. Named operator on call.' },
];

export const AGENTIC_CONTROLS = [
  { name: 'Autonomy classification', detail: 'The single most important governance input for an agent. Classify before anything else, because it determines every other control.' },
  { name: 'Agent identity', detail: 'A dedicated non-human identity with scoped credentials, rotation and revocation. An agent sharing a human’s credentials is unauditable.' },
  { name: 'Tool permissions', detail: 'Explicitly whitelisted and least-privilege. A new tool is a change requiring approval, not a configuration tweak.' },
  { name: 'Memory governance', detail: 'Ephemeral, session and long-term memory categorised, with policy bounding what may be retained and for how long.' },
  { name: 'Transaction limits', detail: 'High-impact actions bounded by amount, count or category, and reducible immediately on anomaly.' },
  { name: 'Blast-radius containment', detail: 'Data-modifying actions reversible by default. Anything irreversible requires explicit approval at design time, not at runtime.' },
  { name: 'Multi-agent orchestration', detail: 'Which agent may call which, the message policy between them, how trust propagates, and how a compromised sub-agent is contained.' },
  { name: 'Human checkpoints', detail: 'Mandatory confirmation for consequential actions, placed where a human can still realistically intervene.' },
  { name: 'Behaviour monitoring', detail: 'Agent behaviour as a time series. Anomalies investigated rather than averaged away.' },
  { name: 'Kill-switch', detail: 'Disables cleanly without corrupting state. Tested periodically. Operators named in advance.' },
  { name: 'Sandboxing by default', detail: 'New agents run contained. Promotion to production scope requires sign-off.' },
];

export const AGENTIC_THESIS =
  'Agentic governance assumes agents will occasionally be creative in unproductive ways. Controls therefore constrain blast radius, not just intent — because intent is the thing you cannot inspect.';

/* --------------------------------------------------- shadow AI discovery */

export const SHADOW_AI = {
  problem:
    'Shadow AI (unsanctioned use) and ambient AI (quietly embedded by vendors into tools you already bought) are the largest real exposure in most organisations, and neither arrives through the front door. A governance programme that only governs what is submitted to it is measuring its own inbox.',
  methods: [
    { method: 'Procurement and expense analysis', finds: 'Paid AI tools bought on cards or through departmental budgets, below approval thresholds.' },
    { method: 'SaaS and network telemetry', finds: 'Traffic to model APIs and AI services from managed devices, including from applications you did not know called them.' },
    { method: 'Identity and OAuth grant review', finds: 'AI tools granted access to corporate data through single sign-on or third-party app consent.' },
    { method: 'Vendor disclosure requests', finds: 'Ambient AI already shipped into existing platforms — often the largest category and the least visible.' },
    { method: 'Code and repository scanning', finds: 'Model SDKs, API keys and inference calls embedded in internal applications.' },
    { method: 'Periodic amnesty', finds: 'Everything the above misses. Run without blame, or it returns nothing.' },
  ],
  note: 'Discovery is a capability with an owner and a cadence, not a one-off audit. The number that matters is the ratio of discovered to submitted — if it is not falling, the front door is not working.',
};

/* ----------------------------------------------------- maturity model */

export const MATURITY = [
  { level: 1, name: 'Ad hoc', looks: 'AI decisions are made case by case by whoever is in the room. No inventory. No consistent intake.', risk: 'You cannot answer "how many AI systems do we run" or "who owns this one".' },
  { level: 2, name: 'Documented', looks: 'A policy exists and an intake form exists. Routing is manual and inconsistent. Inventory is a spreadsheet.', risk: 'Governance depends on individuals remembering. It degrades the moment they are busy.' },
  { level: 3, name: 'Operating', looks: 'Risk-proportionate triage with published rules. Named owners. Decisions held as records. Periodic review by tier.', risk: 'Still reactive to regulatory change; still weak on discovery of what never came through intake.' },
  { level: 4, name: 'Measured', looks: 'Controls mapped to frameworks. Monitoring feeds back into governance. Metrics with targets. Discovery running continuously.', risk: 'The remaining gap is usually agentic systems and third-party model change.' },
  { level: 5, name: 'Adaptive', looks: 'Policy-as-configuration absorbs regulatory change. Evaluation is automated and versioned. Agent behaviour monitored as a time series. Assurance is independent.', risk: 'The failure mode becomes complacency — treating the framework as finished.' },
];

/* -------------------------------------------------------------- metrics */

export const METRICS = [
  { name: 'Intake cycle time', measure: 'Submission to decision, by tier', target: 'Fast lane under 10 working days', signal: 'The best predictor of whether teams use the front door or route around it' },
  { name: 'Discovered-to-submitted ratio', measure: 'Systems found by discovery versus systems submitted', target: 'Falling quarter on quarter', signal: 'The honest measure of whether intake has authority' },
  { name: 'Inventory completeness', measure: 'Systems with all four owner roles named and current', target: 'Above 95%', signal: 'If you cannot name owners, nothing downstream is reliable' },
  { name: 'Attestation currency', measure: 'Systems whose periodic review is in date', target: 'Above 90%', signal: 'Stale attestations mean the register describes a past organisation' },
  { name: 'Exception ageing', measure: 'Open exceptions past their expiry', target: 'Near zero', signal: 'A growing exception register means the policy is wrong, not that teams are' },
  { name: 'Evaluation coverage', measure: 'Production systems with a current pre-release evaluation and regression suite', target: 'Above 90% for medium and high tiers', signal: 'Distinguishes governance that tests from governance that asks' },
  { name: 'Incident detection time', measure: 'Behaviour change to detection', target: 'Hours, not weeks', signal: 'Especially for silent vendor model updates' },
  { name: 'Oversight evidence rate', measure: 'Share of in-the-loop systems with recorded human disagreement', target: 'Non-zero', signal: 'If humans never disagree with the model, the oversight is decorative' },
];

/* -------------------------------------------------------- anti-patterns */

export const ANTI_PATTERNS = [
  { name: 'The policy without a register', looks: 'A well-written AI policy, no inventory of AI systems.', costs: 'Nothing is enforceable, because nothing is enumerated.' },
  { name: 'Governance by committee calendar', looks: 'Every use case waits for a monthly forum regardless of risk.', costs: 'Teams route around it, and you lose sight of the riskiest work first.' },
  { name: 'The ethics board with no teeth', looks: 'A senior panel that advises but cannot stop anything.', costs: 'Deliberation without consequence, which trains everyone to treat it as theatre.' },
  { name: 'Model-centric thinking', looks: 'Governing the model and ignoring the prompt, retrieval sources, tools and memory around it.', costs: 'The model is rarely what fails. The scaffolding is.' },
  { name: 'One-shot assessment', looks: 'Approved at go-live, never revisited. Vendor changes the model silently.', costs: 'Your approved system is not the system now running.' },
  { name: 'Shadow-blind governance', looks: 'Governing only what is submitted.', costs: 'You are measuring your own inbox while the exposure sits outside it.' },
  { name: 'Compliance as the ceiling', looks: 'Controls stop exactly where the regulation stops.', costs: 'Regulation is a floor written for the last generation of systems. It will not cover your agents.' },
];
