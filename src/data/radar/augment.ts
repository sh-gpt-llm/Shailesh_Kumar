import type { Ring } from './types';

// Sequencing and supporting evidence, kept separate from the industry datasets
// so the large curated files stay readable. Merged in industries/index.ts.
// `dependsOn` ids refer to technologies within the same industry.
export interface Augment {
  dependsOn?: number[];
  evidence?: string[];
}

export type IndustryAugments = Record<number, Augment>;

export const AUGMENTS: Record<string, IndustryAugments> = {
  'tech-saas': {
    1: {
      dependsOn: [9],
      evidence: [
        'Retrieval is now a default component in most production LLM feature architectures, not an add-on.',
        'Vendor roadmaps have shifted from "does it support RAG" to retrieval quality and evaluation tooling.',
      ],
    },
    3: {
      dependsOn: [1, 17, 27],
      evidence: [
        'Agent frameworks have converged on a small number of patterns (planner-executor, supervisor-worker).',
        'Every major cloud and model vendor now ships an agent framework and an agent marketplace.',
        'The hard problems reported by adopters are governance and evaluation, not raw capability.',
      ],
    },
    4: { dependsOn: [17], evidence: ['Routing high-volume routine tasks to fine-tuned small models is the most commonly cited inference-cost lever.'] },
    5: { dependsOn: [17] },
    6: { dependsOn: [28], evidence: ['Multi-provider model strategies are creating the same centralisation need that API gateways solved a decade ago.'] },
    7: {
      dependsOn: [3, 17],
      evidence: [
        'Results are strongest on well-tested codebases with clear specifications, weakest on ambiguous ones.',
        'Highest near-term value reported in test generation, refactors and dependency upgrades.',
      ],
    },
    11: { evidence: ['Serverless GPU offerings remove capacity planning in exchange for cold-start latency.'] },
    13: {
      dependsOn: [12],
      evidence: [
        'Data-residency regulation is expanding across multiple major markets simultaneously.',
        'Sovereign deployment options increasingly appear as enterprise procurement requirements rather than differentiators.',
      ],
    },
    16: { dependsOn: [4] },
    17: { evidence: ['Shipping an LLM feature without a living evaluation suite is a recurring root cause in post-incident reviews.'] },
    19: { dependsOn: [6, 28], evidence: ['Inference spend is outpacing training spend for most organisations running AI in production.'] },
    21: {
      dependsOn: [3],
      evidence: [
        'Conventional application threat models do not cover prompt injection or tool-call abuse.',
        'Agentic systems expand the attack surface faster than security review cadences adapt.',
      ],
    },
    22: { dependsOn: [17] },
    23: { dependsOn: [14, 21] },
    25: {
      evidence: [
        'Rust has become a common default for new performance-critical infrastructure components.',
        'Hiring pool and crate ecosystem have both matured past the early-adopter stage.',
      ],
    },
    27: { evidence: ['Multiple competing open protocols are contending to standardise agent-to-tool and agent-to-agent interaction.'] },
  },

  'healthcare-life-sciences': {
    1: {
      evidence: [
        'Ambient documentation attacks clinician administrative burden without touching diagnostic judgement.',
        'It is consistently the fastest-adopted clinical AI category because the risk profile is low and the ROI is measurable.',
      ],
    },
    3: { dependsOn: [16, 17] },
    4: { dependsOn: [17] },
    5: { dependsOn: [17, 26] },
    6: { dependsOn: [27] },
    7: { dependsOn: [25, 26] },
    8: {
      dependsOn: [22],
      evidence: [
        'Generative models are compressing early discovery timelines from years toward months.',
        'Wet-lab validation remains the gating step, so the gain is acceleration rather than replacement.',
      ],
    },
    11: {
      dependsOn: [10],
      evidence: [
        'Federated approaches avoid the data-sharing agreements that have historically stalled multi-institution research.',
        'They are the most credible route to training on genuinely diverse patient populations.',
      ],
    },
    12: { dependsOn: [10] },
    16: { dependsOn: [9] },
    17: {
      evidence: [
        'Patient-safety stakes make continuous, clinician-reviewed evaluation a baseline expectation.',
        'Several regulators now expect evidence of ongoing model performance monitoring, not just pre-deployment validation.',
      ],
    },
    19: { dependsOn: [17] },
    21: { dependsOn: [17] },
    22: {
      evidence: [
        'Closed-loop labs are compressing design-make-test-analyse cycles from weeks to days in leading organisations.',
        'Capital intensity remains the main barrier, though the cost curve is falling.',
      ],
    },
    25: { dependsOn: [26] },
    27: { dependsOn: [17] },
  },

  'financial-services': {
    1: {
      dependsOn: [25, 17],
      evidence: [
        'Alert volumes exceed investigator capacity at most institutions, making triage the clearest agentic win.',
        'Agents gather evidence and draft case summaries while humans retain the final disposition decision.',
      ],
    },
    3: { dependsOn: [17] },
    4: { dependsOn: [17, 18] },
    5: { dependsOn: [27] },
    6: { dependsOn: [14] },
    11: {
      dependsOn: [10],
      evidence: [
        'Operational-resilience and data-sovereignty rules are converging on jurisdiction-locked deployment.',
        'Systemically important institutions increasingly treat this as a hard requirement.',
      ],
    },
    14: {
      evidence: [
        'Composable cores make incremental, risk-managed replacement realistic rather than big-bang.',
        'Paired with coding agents, the business case for core replacement is the strongest it has been in a decade.',
      ],
    },
    17: {
      evidence: [
        'Explainability is a hard requirement in credit, underwriting and AML decisioning in most major jurisdictions.',
        'Institutions are standardising on explainable-by-design approaches over retrofitted interpretability tooling.',
      ],
    },
    18: { dependsOn: [17] },
    19: {
      dependsOn: [25, 17],
      evidence: [
        'ML-augmented monitoring materially reduces false positives versus rules-only engines.',
        'False-positive fatigue has itself become a recognised operational risk.',
      ],
    },
    21: { dependsOn: [17] },
    22: { dependsOn: [17] },
    24: { dependsOn: [12, 22] },
    28: { dependsOn: [27] },
  },

  'manufacturing-industrial': {
    1: { dependsOn: [10, 17] },
    2: {
      dependsOn: [9, 17],
      evidence: [
        'Downtime cost makes the ROI case unusually clear compared with other agentic use cases.',
        'Adoption is fastest in facilities with high changeover frequency, where manual rescheduling is most expensive.',
      ],
    },
    3: { dependsOn: [26] },
    4: { dependsOn: [25, 17] },
    5: { dependsOn: [28] },
    7: {
      dependsOn: [9],
      evidence: [
        'Generative tools are producing manufacturable geometries that outperform human-first designs on weight and material use.',
        'Adoption is gated by validation and certification processes rather than by the technology.',
      ],
    },
    8: { dependsOn: [9] },
    9: {
      evidence: [
        'Digital twins have become the default environment for validating process changes before touching equipment.',
        'They have moved from engineering showcase into routine operational tooling.',
      ],
    },
    10: { dependsOn: [11] },
    18: {
      evidence: [
        'Extended-producer-responsibility rules are converting passports into market-access requirements.',
        'Several regions have published phased timelines affecting specific product categories.',
      ],
    },
    19: { dependsOn: [1] },
    21: {
      dependsOn: [13],
      evidence: [
        'Converged IT/OT environments fall between traditional IT security review and legacy OT safety analysis.',
        'Cyber-insurance underwriting increasingly asks for evidence of ICS-specific threat modelling.',
      ],
    },
    23: { dependsOn: [13, 21] },
    25: { dependsOn: [26] },
  },

  'retail-consumer': {
    1: { dependsOn: [26] },
    2: {
      dependsOn: [25, 17],
      evidence: [
        'Agentic service now resolves a substantial share of tier-one support volume end to end.',
        'Human agents are being redeployed to complex and sensitive cases rather than reduced proportionally.',
      ],
    },
    3: { dependsOn: [17] },
    4: { dependsOn: [17] },
    5: { dependsOn: [28] },
    7: {
      evidence: [
        'Generative content has made catalogue-scale localisation financially viable for the first time.',
        'The binding constraint has shifted from production capacity to brand governance.',
      ],
    },
    8: { dependsOn: [10] },
    11: {
      dependsOn: [13],
      evidence: [
        'Retail media is among the fastest-growing and highest-margin revenue lines for large retailers.',
        'First-party data advantages are compounding as third-party cookie coverage erodes.',
      ],
    },
    12: { dependsOn: [10] },
    17: { evidence: ['Recommendation models drift as catalogue and customer behaviour change, making continuous evaluation routine at mature retailers.'] },
    18: {
      evidence: [
        'Shoppers increasingly ask AI assistants what to buy instead of running a search query.',
        'Most commerce teams have not yet budgeted for optimisation against AI answer surfaces.',
      ],
    },
    19: { dependsOn: [17] },
    21: { dependsOn: [14] },
    28: {
      dependsOn: [14, 9],
      evidence: [
        'Competing proposals are emerging for how third-party agents browse, compare and check out on a retailer\'s site.',
        'Storefronts that agents cannot parse risk losing visibility in agent-mediated discovery.',
      ],
    },
  },
};

export const RING_SEQUENCE: Ring[] = ['adopt', 'trial', 'assess', 'hold'];
