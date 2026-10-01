import type { IndustryRadar } from '../types';

export const tech: IndustryRadar = {
  slug: 'tech-saas',
  name: 'Technology & SaaS',
  tagline: 'Where software, cloud and AI-native platforms are placing their next bets.',
  scope:
    'Scope of analysis: cloud-native platforms, developer tooling, AI/ML infrastructure, and the commercial SaaS stack — read through the lens of a product, platform or engineering leader deciding where to invest the next two budget cycles.',
  edition: { label: 'Edition 2026.1', published: '2026-10-01', baseline: true },
  heroStat: [
    { label: 'technologies tracked', value: '30' },
    { label: 'new this edition', value: '11' },
    { label: 'accelerating', value: '13' },
    { label: 'quadrants', value: '4' },
  ],
  themes: [
    {
      title: 'Agents leave the sandbox',
      description:
        'Agentic workflows and autonomous coding agents move from demo to default — the question for 2026 is governance and cost control, not capability.',
    },
    {
      title: 'The inference bill becomes a board topic',
      description:
        'Serverless GPU inference, SLMs and aggressive model routing are the direct response to runaway LLM spend — FinOps for AI is no longer optional.',
    },
    {
      title: 'Trust infrastructure catches up',
      description:
        'Non-human identity, confidential computing and evaluation-driven development are the unglamorous plumbing that makes agentic AI safe to ship.',
    },
  ],
  technologies: [
    { id: 1, name: 'Retrieval-Augmented Generation (RAG)', quadrant: 1, ring: 'adopt', momentum: 'steady', timeHorizon: 'Now', tags: ['Product', 'Data'], summary: 'Grounding model outputs in your own retrieved content.', brief: 'RAG has graduated from pattern to platform primitive — most production LLM features now ship with a retrieval layer by default. The remaining work is less about the technique and more about retrieval quality, chunking and evaluation.' },
    { id: 2, name: 'Multimodal Foundation Models', quadrant: 1, ring: 'adopt', momentum: 'steady', timeHorizon: 'Now', tags: ['Product'], summary: 'Single models reasoning across text, image, audio and video.', brief: 'Multimodal is now the default frontier-model shape, not a specialised variant. Product teams should assume any new foundation model release is multimodal and design interfaces accordingly.' },
    { id: 3, name: 'Agentic Workflows', quadrant: 1, ring: 'trial', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Product', 'Platform'], summary: 'Multi-step, tool-using AI that plans and acts, not just answers.', brief: 'Agent frameworks have consolidated around a handful of patterns (planner-executor, supervisor-worker). The hard part is no longer orchestration — it is evaluation, guardrails and giving agents safe, scoped tool access.' },
    { id: 4, name: 'Small Language Models (SLMs)', quadrant: 1, ring: 'trial', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Platform', 'Cost'], summary: 'Purpose-built, cheaper models for narrow, high-volume tasks.', brief: 'As inference cost becomes a board-level concern, routing routine tasks to fine-tuned SLMs instead of frontier models is one of the highest-leverage cost levers available to any SaaS product team.' },
    { id: 5, name: 'Reasoning Models', quadrant: 1, ring: 'trial', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Product'], summary: 'Models that spend extra inference-time compute to "think" before answering.', brief: 'Reasoning models meaningfully improve multi-step, logic-heavy tasks (code, planning, math) at the cost of latency and spend. Use them selectively, behind a router, rather than as a blanket replacement.' },
    { id: 6, name: 'AI Gateway & Model Routing', quadrant: 1, ring: 'trial', momentum: 'new', timeHorizon: '6-12 mo', tags: ['Platform'], summary: 'A single control plane for auth, cost, caching and routing across model providers.', brief: 'As teams adopt multiple model providers, an AI gateway becomes the equivalent of an API gateway a decade ago — centralising rate limiting, semantic caching, fallback and spend attribution.' },
    { id: 7, name: 'Autonomous Coding Agents', quadrant: 1, ring: 'assess', momentum: 'new', timeHorizon: '6-12 mo', tags: ['Engineering'], summary: 'Agents that independently write, test and open pull requests.', brief: 'Early results are strong on well-scoped, well-tested codebases and weak on ambiguous, under-specified ones. The highest near-term value is in test generation, refactors and dependency upgrades rather than net-new features.' },
    { id: 8, name: 'No-Code LLM App Builders', quadrant: 1, ring: 'hold', momentum: 'steady', timeHorizon: 'Now', tags: ['Product'], summary: 'Drag-and-drop tools for assembling simple LLM apps.', brief: 'Useful for prototyping and internal tools, but most teams outgrow them quickly once they need real evaluation, versioning and cost control — treat as a prototyping aid, not a production platform.' },

    { id: 9, name: 'Vector & Hybrid Search', quadrant: 2, ring: 'adopt', momentum: 'steady', timeHorizon: 'Now', tags: ['Data'], summary: 'Combining dense vector similarity with keyword/metadata search.', brief: 'Pure vector search alone under-performs hybrid approaches for most real-world retrieval. Hybrid search is now a default requirement in any serious RAG architecture, not an optimisation.' },
    { id: 10, name: 'Platform Engineering (IDPs)', quadrant: 2, ring: 'adopt', momentum: 'steady', timeHorizon: 'Now', tags: ['Platform'], summary: 'Internal developer platforms that give product teams paved, self-service paths.', brief: 'The platform engineering model has become the standard way mature SaaS organisations scale engineering without scaling headcount linearly — golden paths, not gatekeeping.' },
    { id: 11, name: 'Serverless GPU Inference', quadrant: 2, ring: 'trial', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Platform', 'Cost'], summary: 'Pay-per-token GPU inference with no cluster to manage.', brief: 'Serverless GPU platforms remove the capacity-planning burden of running your own inference fleet, trading some latency and cold-start cost for dramatically simpler operations — a strong default for all but the highest-volume workloads.' },
    { id: 12, name: 'Confidential Computing', quadrant: 2, ring: 'trial', momentum: 'accelerating', timeHorizon: '12-18 mo', tags: ['Security'], summary: 'Hardware-enforced encryption of data in use, not just at rest or in transit.', brief: 'As enterprise customers push AI workloads into shared cloud infrastructure, confidential computing is becoming a procurement requirement for regulated and security-conscious buyers.' },
    { id: 13, name: 'Sovereign & Regional Cloud', quadrant: 2, ring: 'trial', momentum: 'new', timeHorizon: '12-18 mo', tags: ['Platform', 'Compliance'], summary: 'Infrastructure and data residency guarantees tied to national or regional boundaries.', brief: 'Data-residency regulation and geopolitical risk are pushing even born-in-the-cloud SaaS vendors to offer sovereign deployment options as a genuine commercial differentiator, not just a compliance checkbox.' },
    { id: 14, name: 'Non-Human Identity Management', quadrant: 2, ring: 'trial', momentum: 'new', timeHorizon: '6-12 mo', tags: ['Security'], summary: 'Governing the explosion of service accounts, API keys and agent identities.', brief: 'Agentic AI multiplies the number of non-human identities acting inside your systems by an order of magnitude — treating them with the same rigour as human IAM is now a hard security requirement.' },
    { id: 15, name: 'eBPF-based Observability', quadrant: 2, ring: 'assess', momentum: 'new', timeHorizon: '12-18 mo', tags: ['Platform'], summary: 'Kernel-level, near-zero-overhead tracing and security monitoring.', brief: 'eBPF unlocks observability and runtime security instrumentation without sidecars or code changes — the ecosystem is maturing fast but tooling and talent are still scarce.' },
    { id: 16, name: 'Edge AI Inference', quadrant: 2, ring: 'assess', momentum: 'new', timeHorizon: '2-3 yr', tags: ['Product'], summary: 'Running smaller models directly on-device or at the network edge.', brief: 'Falling model sizes and better on-device accelerators make edge inference viable for latency-sensitive or offline-first product experiences — worth prototyping, not yet worth betting the architecture on.' },

    { id: 17, name: 'Evaluation-Driven AI Development', quadrant: 3, ring: 'adopt', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Engineering'], summary: 'Treating evals as first-class, continuous tests for AI features.', brief: 'Shipping an LLM feature without a living evaluation suite is the single most common root cause of AI product failures we see. Evals-as-code, run in CI, should be non-negotiable before any model or prompt change ships.' },
    { id: 18, name: 'Data Contracts', quadrant: 3, ring: 'adopt', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Data'], summary: 'Explicit, versioned agreements between data producers and consumers.', brief: 'As AI features depend on increasingly complex upstream data pipelines, data contracts prevent silent breakage — the same discipline APIs brought to service integration, now applied to data.' },
    { id: 19, name: 'FinOps for AI', quadrant: 3, ring: 'trial', momentum: 'new', timeHorizon: '6-12 mo', tags: ['Cost', 'Platform'], summary: 'Cost visibility, budgets and chargeback for model and inference spend.', brief: 'Inference spend is growing faster than most finance functions can track — extending FinOps practice to token-level cost attribution is becoming a prerequisite for sustainable AI investment.' },
    { id: 20, name: 'Continuous Compliance-as-Code', quadrant: 3, ring: 'trial', momentum: 'steady', timeHorizon: 'Now', tags: ['Compliance'], summary: 'Automated, always-on evidence collection for SOC 2, ISO and AI-specific frameworks.', brief: 'Manual compliance evidence gathering does not scale to the pace of AI feature shipping — automating control checks into the deployment pipeline is now table stakes for enterprise SaaS sales.' },
    { id: 21, name: 'Threat Modeling for ML/LLM Systems', quadrant: 3, ring: 'trial', momentum: 'accelerating', timeHorizon: '6-12 mo', tags: ['Security'], summary: 'Structured analysis of prompt injection, data poisoning and model-specific attack surfaces.', brief: 'Traditional application threat models miss entire classes of LLM-specific risk. Every team shipping agentic or tool-using AI should run a dedicated ML/LLM threat model before launch.' },
    { id: 22, name: 'Synthetic Data Generation', quadrant: 3, ring: 'assess', momentum: 'accelerating', timeHorizon: '12-18 mo', tags: ['Data'], summary: 'Generating realistic, privacy-safe data for testing, training and evals.', brief: 'Synthetic data is maturing from a privacy workaround into a genuine quality lever — particularly for stress-testing evals against edge cases real production data rarely contains.' },
    { id: 23, name: 'Zero-Trust Architecture for AI Workloads', quadrant: 3, ring: 'assess', momentum: 'accelerating', timeHorizon: '12-18 mo', tags: ['Security'], summary: 'Extending zero-trust principles to model endpoints, agent tool calls and data access.', brief: 'Agentic AI breaks the perimeter assumptions most zero-trust programmes were built around — extending least-privilege and continuous verification to agent tool access is the next frontier.' },
    { id: 24, name: 'Green Software Engineering', quadrant: 3, ring: 'hold', momentum: 'steady', timeHorizon: 'Now', tags: ['Platform'], summary: 'Measuring and reducing the carbon footprint of compute, including AI training/inference.', brief: 'Important in principle and increasingly demanded by enterprise procurement, but tooling for accurate, workload-level carbon accounting is still immature — track the space, do not over-invest yet.' },

    { id: 25, name: 'Rust for Systems & Data', quadrant: 4, ring: 'adopt', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Engineering'], summary: 'Memory-safe systems language increasingly used for performance-critical data and infra tooling.', brief: 'Rust has crossed from niche to default choice for new performance-critical infrastructure components — the ecosystem and hiring pool are both mature enough for mainstream adoption.' },
    { id: 26, name: 'uv & Modern Python Tooling', quadrant: 4, ring: 'adopt', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Engineering'], summary: 'Order-of-magnitude faster Python packaging and environment management.', brief: 'The modern Python tooling stack has fixed years of packaging pain in a single release cycle — migrating existing projects is low-risk, high-reward and should be treated as routine hygiene.' },
    { id: 27, name: 'Agent & Tool Protocols (MCP, A2A)', quadrant: 4, ring: 'trial', momentum: 'accelerating', timeHorizon: '6-12 mo', tags: ['Platform'], summary: 'Emerging standards for how agents discover and call tools, and talk to each other.', brief: 'A genuine standards war is underway for how AI agents interoperate — betting on open protocols now avoids costly re-platforming later, even though the winning standard is not yet settled.' },
    { id: 28, name: 'LLM Observability Platforms', quadrant: 4, ring: 'trial', momentum: 'accelerating', timeHorizon: 'Now', tags: ['Engineering'], summary: 'Tracing, cost and quality monitoring purpose-built for LLM and agent calls.', brief: 'Generic APM tools do not capture prompt/response pairs, token cost or evaluation scores — a dedicated LLM observability layer is now a baseline requirement for any production AI feature.' },
    { id: 29, name: 'Polars & Columnar Dataframes', quadrant: 4, ring: 'trial', momentum: 'steady', timeHorizon: 'Now', tags: ['Data'], summary: 'Rust-based dataframe libraries delivering multi-fold speedups over pandas.', brief: 'For medium-to-large in-memory data work, the performance and memory gains are compelling enough to make migration worthwhile for any new data engineering code.' },
    { id: 30, name: 'WebAssembly at the Edge', quadrant: 4, ring: 'assess', momentum: 'steady', timeHorizon: '2-3 yr', tags: ['Platform'], summary: 'Portable, sandboxed compute running close to users, independent of OS.', brief: 'Wasm is a strong fit for plugin systems and edge compute where portability and sandboxing matter — tooling has improved significantly but the ecosystem is still thinner than mainstream runtimes.' },
  ],
  editorsPicks: [3, 7, 13, 21, 25],
  editorsNote:
    'If I had to defend five bets to a CFO tomorrow, these are them: Agentic Workflows and Autonomous Coding Agents because they compound engineering leverage faster than any hire; Sovereign & Regional Cloud because it is becoming a deal-breaker in enterprise procurement; Threat Modeling for ML/LLM Systems because the first serious agent-related breach is a matter of when, not if; and Rust for Systems & Data because the talent and tooling have finally caught up to the hype.',
  watchlist: [
    { name: 'World Models', blurb: 'Models that learn predictive simulations of physical/virtual environments — early, but a plausible successor to today\'s LLM paradigm.' },
    { name: 'AI Coworkers', blurb: 'Persistent, named AI identities with their own accounts and memory, working alongside humans rather than as a tool.' },
    { name: 'Browser-Use Agents', blurb: 'Agents that operate a real browser UI to complete tasks — promising, but reliability and safety guardrails are immature.' },
    { name: 'Quantum-Safe Cryptography', blurb: 'Post-quantum algorithms for long-lived data that must stay confidential past the arrival of cryptographically relevant quantum computers.' },
    { name: 'Context Engineering', blurb: 'The emerging discipline of deliberately designing what goes into a model\'s context window, as distinct from prompt engineering.' },
    { name: 'Answer Engine Optimisation (AEO)', blurb: 'Optimising content to be surfaced and cited by AI answer engines, the successor discipline to SEO.' },
    { name: 'GPU Neoclouds', blurb: 'Specialised, GPU-only cloud providers undercutting hyperscalers on raw training/inference price.' },
    { name: 'AI SRE / Agentic AIOps', blurb: 'Agents that triage, diagnose and in some cases remediate production incidents with minimal human involvement.' },
    { name: 'Digital Product Passport-style Metadata', blurb: 'Structured, machine-readable provenance metadata attached to software artefacts and models, not just physical goods.' },
    { name: 'Private 5G / Edge Connectivity', blurb: 'Dedicated low-latency wireless networks for campuses and facilities, increasingly paired with edge inference.' },
    { name: 'Spatial Computing for Ops', blurb: 'AR/VR interfaces for remote collaboration and operations, well beyond the consumer headset hype cycle.' },
    { name: 'Agentic Supply/Ops Planning', blurb: 'Agents coordinating multi-step operational planning across internal systems — an early but fast-moving category.' },
  ],
  ecosystem: [
    { rank: 1, name: 'Microsoft / Azure', posture: 'Deepen', note: 'Breadth across copilots, model hosting and enterprise identity.', mix: { adopt: 4, trial: 7, assess: 9 }, onRadar: 20, overHorizon: 6 },
    { rank: 2, name: 'AWS', posture: 'Deepen', note: 'Infrastructure depth and the widest model marketplace via Bedrock.', mix: { adopt: 3, trial: 6, assess: 8 }, onRadar: 17, overHorizon: 5 },
    { rank: 3, name: 'Google Cloud', posture: 'Deepen', note: 'Strong in multimodal models and data/analytics platform integration.', mix: { adopt: 3, trial: 5, assess: 6 }, onRadar: 14, overHorizon: 5 },
    { rank: 4, name: 'Databricks', posture: 'Deepen', note: 'Lakehouse plus increasingly opinionated AI/ML tooling on one platform.', mix: { adopt: 2, trial: 5, assess: 4 }, onRadar: 11, overHorizon: 3 },
    { rank: 5, name: 'Anthropic', posture: 'Deepen', note: 'Reasoning-model and agentic-tooling leadership via Claude and MCP.', mix: { trial: 5, assess: 3 }, onRadar: 8, overHorizon: 4 },
    { rank: 6, name: 'OpenAI', posture: 'Deepen', note: 'Fastest-moving frontier model cadence and the broadest developer mindshare.', mix: { trial: 5, assess: 4 }, onRadar: 9, overHorizon: 3 },
    { rank: 7, name: 'HashiCorp', posture: 'Maintain', note: 'Infrastructure-as-code and non-human identity tooling.', mix: { adopt: 2, trial: 2 }, onRadar: 4, overHorizon: 1 },
    { rank: 8, name: 'Datadog', posture: 'Maintain', note: 'Extending APM into LLM and agent observability.', mix: { trial: 2, assess: 1 }, onRadar: 3, overHorizon: 2 },
    { rank: 9, name: 'Okta', posture: 'Watch', note: 'Pushing into non-human and agent identity governance.', mix: { trial: 1, assess: 1 }, onRadar: 2, overHorizon: 2 },
    { rank: 10, name: 'Snowflake', posture: 'Watch', note: 'Data platform expanding into AI/ML workloads adjacent to Databricks.', mix: { adopt: 1, trial: 1 }, onRadar: 2, overHorizon: 1 },
  ],
  movements: [
    { title: 'Agentic everything', horizon: 'Now', description: 'Every major platform is shipping agent frameworks and marketplaces — the differentiator is shifting to governance and evals, not raw capability.' },
    { title: 'The model-sourcing shift', horizon: 'Now', description: 'Multi-model strategies via gateways and routers are replacing single-vendor lock-in as the default architecture.' },
    { title: 'Inference cost discipline', horizon: 'Now → 12 mo', description: 'SLMs, caching and routing are becoming board-level cost levers as inference spend outpaces training spend for most companies.' },
    { title: 'Sovereignty & trust infrastructure', horizon: '12-18 mo', description: 'Regional cloud, confidential computing and non-human identity are converging into a new "trust stack" demanded by enterprise buyers.' },
    { title: 'Standards race for agent interoperability', horizon: '12-18 mo', description: 'MCP, A2A and competing protocols are fighting to become the HTTP of the agent era.' },
  ],
  functions: [
    { name: 'Platform Engineering', description: 'Internal platforms, infrastructure and developer experience.', posture: 'Adoption-led', newCount: 6, mix: { adopt: 6, trial: 8, assess: 5 } },
    { name: 'Product & R&D', description: 'Core product engineering and feature development.', posture: 'Frontier-leaning', newCount: 8, mix: { adopt: 3, trial: 6, assess: 7 } },
    { name: 'Data & Analytics', description: 'Data platform, pipelines and ML/AI infrastructure.', posture: 'Adoption-led', newCount: 4, mix: { adopt: 4, trial: 5, assess: 3 } },
    { name: 'Security & Trust', description: 'AppSec, identity, compliance and trust engineering.', posture: 'Frontier-leaning', newCount: 7, mix: { trial: 5, assess: 6 } },
    { name: 'Go-to-Market', description: 'Sales, marketing and customer success tooling.', posture: 'Balanced', newCount: 3, mix: { adopt: 1, trial: 2, assess: 3 } },
    { name: 'Corporate & G&A', description: 'Finance, legal, HR and internal operations.', posture: 'Balanced', newCount: 2, mix: { trial: 1, assess: 2, hold: 1 } },
  ],
  geography: {
    categories: ['Overall', 'AI & Foundation Models', 'Cloud Infrastructure', 'Developer Tools'],
    leaders: {
      'Overall': [
        { rank: 1, place: 'United States', score: 91 }, { rank: 2, place: 'China', score: 83 }, { rank: 3, place: 'United Kingdom', score: 74 },
        { rank: 4, place: 'Israel', score: 72 }, { rank: 5, place: 'Germany', score: 68 }, { rank: 6, place: 'Canada', score: 66 },
        { rank: 7, place: 'South Korea', score: 64 }, { rank: 8, place: 'India', score: 62 }, { rank: 9, place: 'Singapore', score: 61 }, { rank: 10, place: 'France', score: 59 },
      ],
      'AI & Foundation Models': [
        { rank: 1, place: 'United States', score: 94 }, { rank: 2, place: 'China', score: 88 }, { rank: 3, place: 'United Kingdom', score: 70 },
        { rank: 4, place: 'France', score: 67 }, { rank: 5, place: 'Canada', score: 63 }, { rank: 6, place: 'Israel', score: 62 },
        { rank: 7, place: 'Germany', score: 58 }, { rank: 8, place: 'South Korea', score: 57 }, { rank: 9, place: 'Singapore', score: 55 }, { rank: 10, place: 'India', score: 54 },
      ],
      'Cloud Infrastructure': [
        { rank: 1, place: 'United States', score: 90 }, { rank: 2, place: 'Ireland', score: 69 }, { rank: 3, place: 'Germany', score: 67 },
        { rank: 4, place: 'Singapore', score: 65 }, { rank: 5, place: 'China', score: 64 }, { rank: 6, place: 'United Kingdom', score: 63 },
        { rank: 7, place: 'Japan', score: 60 }, { rank: 8, place: 'Netherlands', score: 58 }, { rank: 9, place: 'India', score: 55 }, { rank: 10, place: 'Australia', score: 53 },
      ],
      'Developer Tools': [
        { rank: 1, place: 'United States', score: 89 }, { rank: 2, place: 'India', score: 71 }, { rank: 3, place: 'United Kingdom', score: 68 },
        { rank: 4, place: 'Germany', score: 64 }, { rank: 5, place: 'Canada', score: 62 }, { rank: 6, place: 'Poland', score: 58 },
        { rank: 7, place: 'China', score: 57 }, { rank: 8, place: 'Brazil', score: 54 }, { rank: 9, place: 'South Korea', score: 53 }, { rank: 10, place: 'Netherlands', score: 51 },
      ],
    },
  },
};
