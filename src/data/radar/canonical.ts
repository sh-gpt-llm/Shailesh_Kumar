// Cross-industry comparison needs a shared vocabulary: the same underlying
// technology is named differently per industry (e.g. "Reasoning Models" vs
// "Reasoning Models for Credit & Risk Analysis"). This maps each industry's
// concrete name onto a canonical theme so the Compare view can line them up.

export interface CanonicalTheme {
  key: string;
  label: string;
  blurb: string;
  names: string[];
}

export const CANONICAL_THEMES: CanonicalTheme[] = [
  {
    key: 'agentic-operations',
    label: 'Agentic Operations',
    blurb: 'Multi-step, tool-using agents that plan and act inside real operational workflows.',
    names: [
      'Agentic Workflows',
      'Agentic Care Coordination',
      'Agentic Fraud Investigation',
      'Agentic Shop-Floor Operations',
      'Agentic Customer Service',
    ],
  },
  {
    key: 'multimodal-ai',
    label: 'Multimodal AI',
    blurb: 'Single models reasoning jointly across text, image, audio and structured data.',
    names: [
      'Multimodal Foundation Models',
      'Multimodal Diagnostic AI',
      'Multimodal Document Intelligence',
      'Multimodal Visual Quality Inspection',
      'Multimodal Product Discovery & Search',
    ],
  },
  {
    key: 'small-language-models',
    label: 'Small Language Models',
    blurb: 'Compact, fine-tuned models for narrow, high-volume tasks — the primary inference-cost lever.',
    names: [
      'Small Language Models (SLMs)',
      'Small Language Models at the Point of Care',
      'Small Language Models for Compliance Triage',
      'Small Language Models for Technician Support',
      'Small Language Models for In-Store Assistants',
    ],
  },
  {
    key: 'reasoning-models',
    label: 'Reasoning Models',
    blurb: 'Models spending extra inference-time compute to work through multi-step problems.',
    names: [
      'Reasoning Models',
      'Reasoning Models for Differential Diagnosis Support',
      'Reasoning Models for Credit & Risk Analysis',
      'Reasoning Models for Root-Cause Analysis',
      'Reasoning Models for Merchandising Decisions',
    ],
  },
  {
    key: 'ai-gateway',
    label: 'AI Gateway & Model Routing',
    blurb: 'A governed control plane for auth, cost, caching, fallback and routing across model providers.',
    names: [
      'AI Gateway & Model Routing',
      'AI Gateway & Model Routing for Clinical Systems',
      'AI Gateway & Model Routing for Trading/Risk Systems',
      'AI Gateway & Model Routing for OT/IT Systems',
      'AI Gateway & Model Routing for Commerce Systems',
    ],
  },
  {
    key: 'autonomous-coding-agents',
    label: 'Autonomous Coding Agents',
    blurb: 'Agents that independently write, test and open pull requests against real codebases.',
    names: [
      'Autonomous Coding Agents',
      'Autonomous Coding Agents for Core Modernisation',
      'Autonomous Coding Agents for Industrial Software',
      'Autonomous Coding Agents for Commerce Platforms',
    ],
  },
  {
    key: 'evaluation-driven-ai',
    label: 'Evaluation-Driven AI',
    blurb: 'Treating evals as first-class, continuously-run tests gating every model or prompt change.',
    names: [
      'Evaluation-Driven AI Development',
      'Evaluation-Driven Clinical AI',
      'Evaluation-Driven AI for Credit Decisioning',
      'Evaluation-Driven AI for Predictive Maintenance',
      'Evaluation-Driven AI for Recommendations',
    ],
  },
  {
    key: 'vector-search',
    label: 'Vector & Semantic Search',
    blurb: 'Dense-vector similarity combined with keyword and metadata retrieval.',
    names: [
      'Vector & Hybrid Search',
      'Vector Search over Medical Literature',
      'Vector Search over Regulatory & Policy Documents',
      'Vector Search over Technical Manuals',
      'Vector Search over Catalog & Reviews',
    ],
  },
  {
    key: 'graphrag',
    label: 'Knowledge Graphs & GraphRAG',
    blurb: 'Structured knowledge graphs paired with retrieval to cut hallucination on complex domains.',
    names: [
      'Knowledge Graphs & GraphRAG for Biomedical Literature',
      'Knowledge Graphs & GraphRAG for Financial Crime',
      'Knowledge Graphs & GraphRAG for Engineering Documentation',
      'Knowledge Graphs & GraphRAG for Product Catalogs',
    ],
  },
  {
    key: 'llm-observability',
    label: 'LLM Observability',
    blurb: 'Tracing, cost and quality monitoring purpose-built for model and agent calls.',
    names: [
      'LLM Observability Platforms',
      'LLM Observability for Clinical Systems',
      'LLM Observability for Financial AI',
      'LLM Observability for Industrial AI',
      'LLM Observability for Commerce AI',
    ],
  },
  {
    key: 'agent-protocols',
    label: 'Agent & Tool Protocols',
    blurb: 'Emerging standards for how agents discover tools, call them and talk to each other.',
    names: [
      'Agent & Tool Protocols (MCP, A2A)',
      'Agent & Tool Protocols for Health Data Access',
      'Agent & Tool Protocols for Open Banking',
      'Agent & Tool Protocols for Machine-to-Machine Coordination',
      'Agent & Tool Protocols for Agentic Commerce',
    ],
  },
  {
    key: 'confidential-computing',
    label: 'Confidential Computing',
    blurb: 'Hardware-enforced encryption of data while it is in use, not just at rest or in transit.',
    names: [
      'Confidential Computing',
      'Confidential Computing for PHI',
      'Confidential Computing for Transaction Data',
      'Confidential Computing for Industrial IP',
      'Confidential Computing for Customer Data',
    ],
  },
  {
    key: 'non-human-identity',
    label: 'Non-Human Identity',
    blurb: 'Governing the explosion of service accounts, bots and agent identities inside your systems.',
    names: [
      'Non-Human Identity Management',
      'Non-Human Identity for Clinical Systems',
      'Non-Human Identity for Trading & API Systems',
      'Non-Human Identity for OT Systems',
      'Non-Human Identity for Commerce APIs',
    ],
  },
  {
    key: 'sovereign-cloud',
    label: 'Sovereign & Regional Cloud',
    blurb: 'Infrastructure and residency guarantees tied to national or regional boundaries.',
    names: [
      'Sovereign & Regional Cloud',
      'Sovereign & Regional Health Data Cloud',
      'Sovereign & Regional Cloud for Financial Data',
      'Sovereign & Regional Cloud for Industrial Data',
      'Sovereign & Regional Cloud for Customer Data',
    ],
  },
  {
    key: 'edge-ai',
    label: 'Edge AI Inference',
    blurb: 'Running smaller models directly on-device or at the network edge.',
    names: [
      'Edge AI Inference',
      'Edge AI for Bedside & Wearable Devices',
      'Edge AI for Branch & ATM Devices',
      'Edge AI on the Factory Floor',
      'Edge AI for In-Store & POS Devices',
    ],
  },
  {
    key: 'ml-threat-modeling',
    label: 'Threat Modeling for ML',
    blurb: 'Structured analysis of prompt injection, data poisoning and model-specific attack surfaces.',
    names: [
      'Threat Modeling for ML/LLM Systems',
      'Threat Modeling for Clinical ML Systems',
      'Threat Modeling for ML Trading Systems',
      'Threat Modeling for OT / ICS Systems',
      'Threat Modeling for Commerce & Payment Systems',
    ],
  },
  {
    key: 'synthetic-data',
    label: 'Synthetic Data',
    blurb: 'Generating realistic, privacy-safe data for testing, training and edge-case evaluation.',
    names: [
      'Synthetic Data Generation',
      'Synthetic Patient Data',
      'Synthetic Transaction Data',
      'Synthetic Data for Rare-Defect Training',
      'Synthetic Data for Personalisation Testing',
    ],
  },
  {
    key: 'continuous-compliance',
    label: 'Continuous Compliance-as-Code',
    blurb: 'Automated, always-on control evidence collected straight from the deployment pipeline.',
    names: [
      'Continuous Compliance-as-Code',
      'Continuous Regulatory Compliance-as-Code',
      'Continuous Compliance-as-Code (Industrial)',
      'Continuous Compliance-as-Code (Privacy & Consumer)',
    ],
  },
  {
    key: 'zero-trust-ai',
    label: 'Zero-Trust for AI Workloads',
    blurb: 'Extending least-privilege and continuous verification to model endpoints and agent tool calls.',
    names: [
      'Zero-Trust Architecture for AI Workloads',
      'Zero-Trust Architecture for OT',
      'Zero-Trust Architecture for Retail Systems',
    ],
  },
  {
    key: 'finops-ai',
    label: 'FinOps for AI',
    blurb: 'Cost visibility, budgets and chargeback for model and inference spend.',
    names: ['FinOps for AI'],
  },
  {
    key: 'rust-modern-tooling',
    label: 'Rust & Modern Systems Tooling',
    blurb: 'Memory-safe, high-performance languages replacing legacy performance-critical code.',
    names: [
      'Rust for Systems & Data',
      'Rust for High-Performance Trading Systems',
      'Rust / Modern Tooling for Embedded Systems',
      'Rust / Modern Tooling for High-Throughput Commerce Systems',
      'Bioinformatics Pipeline Modernisation (Rust/Modern Tooling)',
    ],
  },
  {
    key: 'composable-platforms',
    label: 'Composable Core Platforms',
    blurb: 'Modular, API-first platforms displacing monolithic legacy suites.',
    names: ['Composable Core Banking', 'Composable MES / Industrial Platforms', 'Composable Commerce Platforms'],
  },
  {
    key: 'agentic-planning',
    label: 'Agentic Planning',
    blurb: 'Agents coordinating multi-step forecasting and allocation across systems and partners.',
    names: [
      'Agentic Supply & Production Planning',
      'Agentic Demand & Inventory Planning',
      'Agentic Treasury & Cash Management',
    ],
  },
  {
    key: 'generative-creation',
    label: 'Generative Creation',
    blurb: 'Generative models producing novel designs, content or biological sequences at scale.',
    names: ['Generative Biology', 'Generative Design for Engineering', 'Generative Product Content & Creative'],
  },
  {
    key: 'quantum-computing',
    label: 'Quantum Computing',
    blurb: 'Quantum and hybrid algorithms applied to narrow, high-value optimisation and simulation problems.',
    names: [
      'Quantum Computing for Molecular Simulation',
      'Quantum Computing for Portfolio Optimisation',
      'Quantum Computing for Materials & Process Optimisation',
    ],
  },
  {
    key: 'digital-twins',
    label: 'Digital Twins',
    blurb: 'Continuously-updated simulated models of physical processes, assets or people.',
    names: ['Industrial Digital Twins', 'Digital Twins of Patients & Care Pathways'],
  },
  {
    key: 'digital-product-passport',
    label: 'Digital Product Passport',
    blurb: 'Machine-readable provenance and lifecycle records, increasingly a market-access requirement.',
    names: ['Digital Product Passport', 'Digital Product Passport (Circular Retail)'],
  },
  {
    key: 'private-5g',
    label: 'Private 5G & Site Connectivity',
    blurb: 'Dedicated low-latency wireless networks for campuses, plants and large-format sites.',
    names: ['Private 5G for Industrial Sites', 'Private 5G / Connectivity for Store Operations'],
  },
  {
    key: 'ebpf-observability',
    label: 'eBPF Observability',
    blurb: 'Kernel-level, near-zero-overhead tracing and runtime security instrumentation.',
    names: ['eBPF-based Observability', 'eBPF-Style Observability for OT Networks'],
  },
  {
    key: 'green-engineering',
    label: 'Green Engineering',
    blurb: 'Measuring and reducing the carbon and material footprint of compute and production.',
    names: ['Green Software Engineering', 'Green & Sustainable Manufacturing Engineering'],
  },
];

const nameToKey = new Map<string, string>();
for (const theme of CANONICAL_THEMES) {
  for (const name of theme.names) nameToKey.set(name.toLowerCase(), theme.key);
}

export const canonicalKeyFor = (techName: string): string | undefined => nameToKey.get(techName.toLowerCase());

export const themeByKey = (key: string): CanonicalTheme | undefined =>
  CANONICAL_THEMES.find((t) => t.key === key);
