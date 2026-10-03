// Assessment instruments for the second and third pillars: accountability and
// responsible AI. Intake has a classifier; these two had only prose.

import { CONTROL_THEMES } from './model';

/* --------------------------------------------- pillar 2: accountability */

export type CheckAnswer = 'yes' | 'partial' | 'no';
export const CHECK_VALUE: Record<CheckAnswer, number> = { yes: 1, partial: 0.5, no: 0 };

export interface AccountabilityCheck {
  id: string;
  group: 'Named owners' | 'Authority' | 'Evidence' | 'Third parties';
  question: string;
  hint: string;
  weight: number;
  /** Shown when the answer is not a clean yes. */
  gap: string;
  fix: string;
}

export const ACCOUNTABILITY_CHECKS: AccountabilityCheck[] = [
  {
    id: 'business-owner',
    group: 'Named owners',
    question: 'Can you name the Business Owner — an individual, not a team?',
    hint: 'Accountable for value, intended use, acceptable-use boundaries, and the continue, change or retire decision.',
    weight: 1.25,
    gap: 'No individual is accountable for whether this system should still exist.',
    fix: 'Name a person and record the date. "The product team" is not an answer a regulator accepts.',
  },
  {
    id: 'technical-owner',
    group: 'Named owners',
    question: 'Can you name the Technical Owner?',
    hint: 'Accountable for operational integrity, incidents, change control and technical evidence.',
    weight: 1.25,
    gap: 'When behaviour changes at 2am, nobody is on the hook for the response.',
    fix: 'Name a person, and make sure they know they hold it.',
  },
  {
    id: 'model-owner',
    group: 'Named owners',
    question: 'Can you name the Model or Agent Owner?',
    hint: 'Accountable for model selection, evaluation, prompts, tool permissions, memory scope and content filters.',
    weight: 1.15,
    gap: 'The scaffolding around the model — prompts, retrieval, tools, memory — has no owner. That scaffolding is what usually fails.',
    fix: 'Name a person. For agentic systems this is the most consequential of the four roles.',
  },
  {
    id: 'data-owner',
    group: 'Named owners',
    question: 'Can you name the Data Owner?',
    hint: 'Accountable for dataset quality, provenance, licensing, consent, retention and right to use.',
    weight: 1.15,
    gap: 'Nobody is accountable for whether you are lawfully entitled to the data this runs on.',
    fix: 'Name a person, covering training data, retrieval sources and anything entering prompts.',
  },
  {
    id: 'pause-authority',
    group: 'Authority',
    question: 'Can the Technical Owner pause the system without convening a committee?',
    hint: 'Standing authority, recorded in advance, not negotiated during an incident.',
    weight: 1.2,
    gap: 'The first hour of your next incident will be spent establishing who is allowed to press pause.',
    fix: 'Record standing pause authority now, with named deputies for leave and out of hours.',
  },
  {
    id: 'risk-owner',
    group: 'Authority',
    question: 'Is there a named individual who has accepted the residual risk?',
    hint: 'Senior enough to carry it, and aware that they have.',
    weight: 1.1,
    gap: 'Risk accepted by a committee is risk accepted by nobody.',
    fix: 'Name the individual, record what they accepted, and give the acceptance an expiry date.',
  },
  {
    id: 'records',
    group: 'Evidence',
    question: 'Are decisions held as records rather than in email threads and chat?',
    hint: 'Approvals, conditions, overrides and exceptions, retrievable without asking anyone.',
    weight: 1.1,
    gap: 'The reasoning behind your decisions will leave when the people do.',
    fix: 'Move decisions into a register. If it is not written down, it did not happen.',
  },
  {
    id: 'attestation',
    group: 'Evidence',
    question: 'Is the periodic review in date, with owners re-attested?',
    hint: 'Annually at minimum; more often for higher tiers.',
    weight: 1.0,
    gap: 'Your register describes a past organisation. Owners have moved on and nobody updated it.',
    fix: 'Set a cadence by tier and treat a lapsed attestation as an exception, not an admin task.',
  },
  {
    id: 'oversight-evidence',
    group: 'Evidence',
    question: 'Is there evidence a human has ever disagreed with the system?',
    hint: 'Logged overrides, rejected outputs, escalations.',
    weight: 1.0,
    gap: 'Oversight that leaves no trace of disagreement is decorative. Automation bias has already won.',
    fix: 'Log overrides and review the rate. A zero override rate on a consequential system is a finding, not a success.',
  },
  {
    id: 'provider-split',
    group: 'Third parties',
    question: 'For third-party AI, is the provider and deployer split documented?',
    hint: 'Where their obligations end and yours begin — in the contract, not in an assumption.',
    weight: 1.1,
    gap: 'You may be carrying provider obligations you believe sit with the vendor.',
    fix: 'Document the split. Putting your own name on someone else’s system can make you the provider.',
  },
  {
    id: 'model-change',
    group: 'Third parties',
    question: 'Would you find out if the vendor silently changed the model underneath you?',
    hint: 'Contractual notification, monitoring that would detect it, or both.',
    weight: 1.1,
    gap: 'The system you approved is not necessarily the system now running.',
    fix: 'Negotiate change notification, and monitor behaviour so you detect it even when they forget to tell you.',
  },
];

export const ACCOUNTABILITY_BANDS = [
  { min: 90, label: 'Defensible', meaning: 'You could answer a regulator, an auditor or a board in minutes. Keep the attestations current.', color: '#34d399' },
  { min: 70, label: 'Mostly held', meaning: 'The structure is real but has soft spots. Close them before you need them rather than during an incident.', color: '#22d3ee' },
  { min: 45, label: 'Thin', meaning: 'Accountability exists on paper and in a few people’s heads. It will not survive a departure or an incident.', color: '#f59e0b' },
  { min: 0, label: 'Absent', meaning: 'There is no answer to "who is accountable for this". Everything downstream — controls, evidence, approvals — rests on nothing.', color: '#f43f5e' },
];

export const SIXTY_SECOND_TEST =
  'The test is simple and unforgiving. Pick any AI system you run. Can you name its Business, Technical, Model and Data Owner in sixty seconds, without asking anyone? If not, you do not have an accountability model — you have a diagram of one.';

/* ------------------------------------------ pillar 3: responsible AI */

export const RAI_LEVELS: { value: number; label: string; meaning: string }[] = [
  { value: 0, label: 'Not started', meaning: 'No deliberate activity against this theme.' },
  { value: 1, label: 'Ad hoc', meaning: 'Done by some teams, inconsistently, depending on who is involved.' },
  { value: 2, label: 'Defined', meaning: 'A documented expectation exists and most teams follow it.' },
  { value: 3, label: 'Operating', meaning: 'Applied consistently, with evidence produced as a by-product.' },
  { value: 4, label: 'Measured', meaning: 'Evidenced, measured against targets, and fed back into design.' },
];

export const RAI_BANDS = [
  { min: 85, level: 5, label: 'Adaptive', meaning: 'Controls are evidenced and measured, and regulatory change is absorbed through configuration rather than programmes.', color: '#34d399' },
  { min: 65, level: 4, label: 'Measured', meaning: 'Controls operate consistently and are measured. The remaining gaps are usually agentic systems and third-party model change.', color: '#22d3ee' },
  { min: 45, level: 3, label: 'Operating', meaning: 'Expectations are defined and mostly followed. Still reactive to regulatory change, and weak on discovering what never came through intake.', color: '#a78bfa' },
  { min: 25, level: 2, label: 'Documented', meaning: 'Policy exists; practice depends on individuals remembering. It degrades the moment they are busy.', color: '#f59e0b' },
  { min: 0, level: 1, label: 'Ad hoc', meaning: 'Decisions are made case by case by whoever is in the room. There is no reliable answer to how many AI systems you run.', color: '#f43f5e' },
];

export const RAI_THEME_IDS = CONTROL_THEMES.map((t) => t.id);
