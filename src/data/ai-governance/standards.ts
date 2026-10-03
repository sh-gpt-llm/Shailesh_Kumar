// The standards and regulatory landscape. Deliberately describes each instrument
// by what it is and what kind of thing it is, not by date or current legislative
// status — both change, and both are the first thing a reader will check.

export type Region = 'Global' | 'European Union' | 'United Kingdom' | 'United States' | 'Asia-Pacific' | 'Canada';
export type Nature =
  | 'Binding law'
  | 'International treaty'
  | 'Intergovernmental instrument'
  | 'Technical standard'
  | 'Voluntary framework'
  | 'Regulator guidance'
  | 'Industry resource';

export interface Standard {
  id: string;
  name: string;
  body: string;
  region: Region;
  nature: Nature;
  covers: string;
  /** Why a governance programme should care, in one sentence. */
  soWhat: string;
  /** Themes in the control framework this most supports. */
  themes: string[];
}

export const STANDARDS: Standard[] = [
  /* ---------------------------------------------------------------- global */
  {
    id: 'oecd',
    name: 'AI Principles',
    body: 'OECD',
    region: 'Global',
    nature: 'Intergovernmental instrument',
    covers: 'Five values-based principles and five policy recommendations, endorsed by a large group of jurisdictions and revised to address safety, information integrity and intellectual property.',
    soWhat: 'The common vocabulary underneath most national AI policy. If your principles do not map to these, you will struggle to explain yourself internationally.',
    themes: ['fairness', 'transparency', 'accountability', 'validity'],
  },
  {
    id: 'unesco',
    name: 'Recommendation on the Ethics of Artificial Intelligence',
    body: 'UNESCO',
    region: 'Global',
    nature: 'Intergovernmental instrument',
    covers: 'The broadest multilateral ethics instrument on AI, adopted by member states, covering human rights, environment, gender equality and readiness assessment.',
    soWhat: 'The reference point when operating in jurisdictions with no AI law of their own, and the one that takes environmental and societal impact most seriously.',
    themes: ['fairness', 'transparency', 'accountability'],
  },
  {
    id: 'coe',
    name: 'Framework Convention on AI and Human Rights, Democracy and the Rule of Law',
    body: 'Council of Europe',
    region: 'Global',
    nature: 'International treaty',
    covers: 'The first international treaty on AI, open to signature beyond Europe, obliging parties to adopt measures protecting human rights, democracy and the rule of law in the AI lifecycle.',
    soWhat: 'Treaty-level rather than guidance, so it shapes national law in signatory states over time rather than applying to you directly today.',
    themes: ['fairness', 'accountability', 'oversight'],
  },
  {
    id: 'g7',
    name: 'Hiroshima Process International Code of Conduct for Advanced AI',
    body: 'G7',
    region: 'Global',
    nature: 'Voluntary framework',
    covers: 'Voluntary commitments for organisations developing advanced AI systems: risk identification, red teaming, incident reporting, transparency reporting and content authentication.',
    soWhat: 'A useful external benchmark for frontier and foundation-model work, and the clearest statement of what "responsible developer" is taken to mean at state level.',
    themes: ['safety', 'transparency', 'genai'],
  },
  {
    id: 'iso42001',
    name: 'ISO/IEC 42001 — AI management system',
    body: 'ISO/IEC',
    region: 'Global',
    nature: 'Technical standard',
    covers: 'A certifiable management system standard for AI, with management-system clauses and an Annex A control set organised under control objectives spanning policy, organisation, resources, impact assessment, lifecycle, data, information for interested parties, use, and third-party relationships.',
    soWhat: 'The natural vehicle for a quality management system obligation, and the only AI standard you can currently certify against.',
    themes: ['accountability', 'validity', 'privacy', 'transparency'],
  },
  {
    id: 'iso23894',
    name: 'ISO/IEC 23894 — AI risk management',
    body: 'ISO/IEC',
    region: 'Global',
    nature: 'Technical standard',
    covers: 'Guidance on managing risk specific to AI, aligned to the ISO 31000 risk management structure.',
    soWhat: 'The companion to 42001. Where 42001 tells you to manage risk, this tells you how — and it is the bridge to enterprise risk management your risk function already uses.',
    themes: ['validity', 'safety', 'accountability'],
  },
  {
    id: 'iso22989',
    name: 'ISO/IEC 22989 — AI concepts and terminology',
    body: 'ISO/IEC',
    region: 'Global',
    nature: 'Technical standard',
    covers: 'Standardised vocabulary and concepts for AI systems.',
    soWhat: 'Unglamorous and genuinely useful. Most governance arguments are definitional, and a shared vocabulary ends a surprising number of them.',
    themes: ['accountability'],
  },
  {
    id: 'iso5338',
    name: 'ISO/IEC 5338 — AI system lifecycle processes',
    body: 'ISO/IEC',
    region: 'Global',
    nature: 'Technical standard',
    covers: 'Lifecycle processes for AI systems, extending established software and systems lifecycle standards to AI-specific stages.',
    soWhat: 'Maps AI governance onto the engineering lifecycle your delivery teams already follow, rather than running alongside it.',
    themes: ['validity', 'accountability'],
  },
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001 — information security management',
    body: 'ISO/IEC',
    region: 'Global',
    nature: 'Technical standard',
    covers: 'Management system for information security, with an annexed control set.',
    soWhat: 'AI security obligations do not replace information security ones. Most organisations should extend an existing 27001 scope rather than build a parallel regime.',
    themes: ['safety', 'privacy'],
  },

  /* ------------------------------------------------------- european union */
  {
    id: 'eu-ai-act',
    name: 'EU AI Act',
    body: 'European Union',
    region: 'European Union',
    nature: 'Binding law',
    covers: 'Risk-tiered regulation of AI systems — prohibited practices, high-risk obligations including conformity assessment, registration, quality management, logging, human oversight and post-market monitoring, transparency duties, general-purpose model obligations and an AI literacy duty.',
    soWhat: 'The only comprehensive binding AI law of its kind, and it applies extraterritorially where output is used in the Union. Phase-in has been amended; verify current dates against the Official Journal.',
    themes: ['accountability', 'oversight', 'transparency', 'validity', 'privacy', 'genai'],
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    body: 'European Union',
    region: 'European Union',
    nature: 'Binding law',
    covers: 'Lawful basis, data minimisation, purpose limitation, impact assessment, data-subject rights, automated decision-making safeguards and cross-border transfer.',
    soWhat: 'Predates AI and governs most of it anyway. The automated decision-making provisions and the right to explanation bite long before the AI Act does.',
    themes: ['privacy', 'explainability', 'oversight'],
  },
  {
    id: 'eu-sector',
    name: 'Sectoral product and safety regimes',
    body: 'European Union',
    region: 'European Union',
    nature: 'Binding law',
    covers: 'Medical devices, machinery, vehicles, financial services and similar regimes, into which AI obligations are embedded rather than standing alone.',
    soWhat: 'Where AI is a component of a regulated product, the product regime usually governs first and the AI obligations ride on top of its conformity route.',
    themes: ['validity', 'safety'],
  },

  /* ------------------------------------------------------- united kingdom */
  {
    id: 'uk-principles',
    name: 'Pro-innovation cross-sectoral AI principles',
    body: 'UK Government',
    region: 'United Kingdom',
    nature: 'Regulator guidance',
    covers: 'Five principles applied through existing regulators rather than a single statute: safety, security and robustness; appropriate transparency and explainability; fairness; accountability and governance; and contestability and redress.',
    soWhat: 'The UK deliberately chose regulator-led application over a horizontal law. That means your obligations come from your sector regulator, not from one AI act — which is easy to miss if you are reading EU material.',
    themes: ['safety', 'transparency', 'fairness', 'accountability', 'explainability'],
  },
  {
    id: 'ico',
    name: 'Guidance on AI and data protection',
    body: 'Information Commissioner’s Office',
    region: 'United Kingdom',
    nature: 'Regulator guidance',
    covers: 'How UK data protection law applies to AI, including lawful basis, fairness in AI, explaining decisions, and an AI and data protection risk toolkit.',
    soWhat: 'The most practically useful UK material, and the one a UK regulator will actually measure you against.',
    themes: ['privacy', 'fairness', 'explainability'],
  },
  {
    id: 'uk-finance',
    name: 'Model risk management expectations',
    body: 'Prudential Regulation Authority / Financial Conduct Authority',
    region: 'United Kingdom',
    nature: 'Regulator guidance',
    covers: 'Model identification, model risk governance, development and validation standards, independent review and ongoing monitoring for regulated firms.',
    soWhat: 'If you are a regulated firm, your AI governance must reconcile with model risk management rather than sit beside it. Two registers is a finding.',
    themes: ['validity', 'accountability', 'oversight'],
  },
  {
    id: 'uk-aisi',
    name: 'AI Safety Institute evaluations',
    body: 'UK AI Safety Institute',
    region: 'United Kingdom',
    nature: 'Industry resource',
    covers: 'Public evaluation research and open-source evaluation tooling for advanced models.',
    soWhat: 'A credible external reference for what model evaluation looks like when done seriously, and useful input to your own pre-release evaluation design.',
    themes: ['validity', 'safety', 'genai'],
  },

  /* -------------------------------------------------------- united states */
  {
    id: 'nist-rmf',
    name: 'AI Risk Management Framework',
    body: 'NIST',
    region: 'United States',
    nature: 'Voluntary framework',
    covers: 'A voluntary framework structured as Govern, Map, Measure and Manage, with categories and subcategories and an accompanying playbook.',
    soWhat: 'Voluntary, but it has become the de facto structure for AI risk programmes worldwide, including in organisations with no US presence.',
    themes: ['validity', 'safety', 'fairness', 'accountability', 'oversight'],
  },
  {
    id: 'nist-600-1',
    name: 'Generative AI Profile (AI 600-1)',
    body: 'NIST',
    region: 'United States',
    nature: 'Voluntary framework',
    covers: 'Twelve generative-AI-specific risk categories with suggested actions mapped to the AI RMF core functions.',
    soWhat: 'The best available completeness check for generative risk. If your assessment template cannot answer against all twelve, it has a gap.',
    themes: ['genai', 'safety', 'privacy', 'transparency'],
  },
  {
    id: 'nist-800-53',
    name: 'SP 800-53 security and privacy controls',
    body: 'NIST',
    region: 'United States',
    nature: 'Technical standard',
    covers: 'A comprehensive catalogue of security and privacy controls for information systems.',
    soWhat: 'Where AI security controls need to land inside an existing control catalogue rather than a new one, this is usually the catalogue.',
    themes: ['safety', 'privacy', 'accountability'],
  },
  {
    id: 'us-state',
    name: 'State-level AI and automated decision laws',
    body: 'US states and cities',
    region: 'United States',
    nature: 'Binding law',
    covers: 'Obligations attaching to consequential automated decisions — notably in employment screening, insurance, lending and biometric processing — including bias auditing and candidate notification duties in some jurisdictions.',
    soWhat: 'The most commonly missed US exposure. There is no single federal AI law, so the binding obligations arrive state by state and sector by sector.',
    themes: ['fairness', 'transparency', 'explainability'],
  },
  {
    id: 'us-sector',
    name: 'Sectoral supervision and enforcement',
    body: 'Federal regulators',
    region: 'United States',
    nature: 'Regulator guidance',
    covers: 'Model risk management expectations in banking, medical device pathways for AI-enabled software, and consumer protection enforcement against unfair or deceptive AI claims.',
    soWhat: 'Existing regulators have been explicit that current law already applies to AI. Waiting for an AI-specific statute is not a strategy.',
    themes: ['validity', 'fairness', 'transparency'],
  },

  /* --------------------------------------------------------- asia-pacific */
  {
    id: 'sg-framework',
    name: 'Model AI Governance Framework, and the generative AI edition',
    body: 'Singapore — IMDA / PDPC',
    region: 'Asia-Pacific',
    nature: 'Voluntary framework',
    covers: 'Practical governance guidance covering internal structures, risk-based decision-making, operations management and stakeholder communication, extended for generative AI.',
    soWhat: 'The most implementable of the national frameworks, and the one most often borrowed by organisations that find NIST too abstract.',
    themes: ['accountability', 'oversight', 'transparency', 'genai'],
  },
  {
    id: 'sg-verify',
    name: 'AI Verify',
    body: 'Singapore — IMDA',
    region: 'Asia-Pacific',
    nature: 'Industry resource',
    covers: 'An open-source testing framework and toolkit for validating AI system behaviour against governance principles.',
    soWhat: 'A rare example of governance expressed as runnable tests rather than a questionnaire. Worth studying even if you never adopt it.',
    themes: ['validity', 'fairness', 'transparency'],
  },
  {
    id: 'jp-guidelines',
    name: 'AI Guidelines for Business',
    body: 'Japan',
    region: 'Asia-Pacific',
    nature: 'Voluntary framework',
    covers: 'Consolidated guidance for developers, providers and users of AI, oriented to voluntary adoption and agile governance.',
    soWhat: 'Represents the light-touch, multi-stakeholder end of the spectrum, and distinguishes obligations by role in a way many frameworks do not.',
    themes: ['accountability', 'transparency'],
  },
  {
    id: 'cn-measures',
    name: 'Generative AI measures and algorithm filing',
    body: 'China',
    region: 'Asia-Pacific',
    nature: 'Binding law',
    covers: 'Registration and filing requirements for algorithms and generative services, content labelling, security assessment and training-data requirements.',
    soWhat: 'Among the most prescriptive regimes in force. If you serve users there, filing and labelling obligations attach regardless of where you are based.',
    themes: ['transparency', 'genai', 'accountability'],
  },

  /* ---------------------------------------------------------------- canada */
  {
    id: 'ca-dadm',
    name: 'Directive on Automated Decision-Making',
    body: 'Government of Canada',
    region: 'Canada',
    nature: 'Regulator guidance',
    covers: 'An algorithmic impact assessment requirement with tiered obligations for federal automated decision systems, covering notice, explanation, human intervention and recourse.',
    soWhat: 'One of the earliest working examples of tiered impact assessment, and still one of the clearest models for how to scale obligations to consequence.',
    themes: ['explainability', 'oversight', 'fairness'],
  },

  /* ------------------------------------------------------ industry / security */
  {
    id: 'owasp-llm',
    name: 'Top 10 for Large Language Model Applications',
    body: 'OWASP',
    region: 'Global',
    nature: 'Industry resource',
    covers: 'The most common security weaknesses in LLM applications, including prompt injection, insecure output handling, training-data poisoning, model denial of service, supply-chain vulnerability and excessive agency.',
    soWhat: 'The single most practical security reference for generative systems, and "excessive agency" is the closest the security community has come to naming the agentic problem.',
    themes: ['safety', 'genai'],
  },
  {
    id: 'mitre-atlas',
    name: 'ATLAS adversarial threat landscape',
    body: 'MITRE',
    region: 'Global',
    nature: 'Industry resource',
    covers: 'A knowledge base of adversary tactics and techniques against AI systems, structured like ATT&CK.',
    soWhat: 'Turns "we did a threat model" into something testable, using a vocabulary your security team already works in.',
    themes: ['safety'],
  },
];

export const STANDARDS_NOTE =
  'Described by what each instrument is and what kind of thing it is — binding law, treaty, technical standard, voluntary framework, regulator guidance or industry resource. Deliberately without dates, version numbers or status claims: legislative status, scope and phase-in change, and are the first thing a careful reader will check against the primary source.';

export const LANDSCAPE_INSIGHT = [
  {
    heading: 'There is no single global regime, and there will not be one',
    body: 'The EU regulates horizontally by statute. The UK applies principles through existing sector regulators. The US has no comprehensive federal law and obligations arrive state by state and regulator by regulator. Asia-Pacific ranges from prescriptive filing regimes to voluntary guidance. Designing for one of these and assuming the rest will follow is the most common strategic error.',
  },
  {
    heading: 'Map controls to frameworks, not frameworks to programmes',
    body: 'Running a NIST programme, then an ISO programme, then an AI Act programme produces three registers and one exhausted team. Maintain one control set and map each control to every framework it satisfies. When an obligation moves, you re-point a mapping instead of launching a workstream.',
  },
  {
    heading: 'Binding obligations usually arrive through old law first',
    body: 'Data protection, consumer protection, employment law, product safety and model risk management already apply to AI and are already enforced. Organisations waiting for AI-specific legislation routinely discover they were non-compliant under law that predates the technology by decades.',
  },
  {
    heading: 'Certification is becoming the shorthand',
    body: 'ISO/IEC 42001 is the only AI management system you can currently certify against, which is why it is becoming the thing procurement functions ask for. Expect it to be requested in tenders before it is required by law.',
  },
];

export const STANDARDS_FAQ = [
  {
    q: 'Which AI governance standards and regulations should we follow?',
    a: 'Start with the binding ones in the jurisdictions where your output is used, then adopt a framework to structure the work and a standard to certify against. In practice that usually means the EU AI Act and data protection law where you have European exposure, your sector regulator’s expectations in the UK, state-level and sectoral obligations in the United States, the NIST AI Risk Management Framework as the structure, and ISO/IEC 42001 as the certifiable management system. Map controls to all of them at once rather than running separate programmes.',
  },
  {
    q: 'What is the difference between the EU, UK and US approaches to AI regulation?',
    a: 'The EU regulates horizontally through a single risk-tiered statute with conformity assessment, registration and post-market obligations. The UK has deliberately not legislated horizontally, instead applying five cross-sectoral principles through existing regulators, so obligations arrive from your sector regulator and from data protection law. The United States has no comprehensive federal AI statute; binding obligations come from state and city laws on consequential automated decisions, from sectoral supervision, and from existing consumer protection enforcement, with NIST providing a voluntary framework that has become the de facto structure.',
  },
  {
    q: 'Can you be certified against an AI standard?',
    a: 'ISO/IEC 42001 is the AI management system standard that organisations can be certified against. Other instruments in this space are frameworks, guidance or risk-management standards rather than certifiable management systems — ISO/IEC 23894 gives risk management guidance, ISO/IEC 22989 gives vocabulary, and the NIST framework is explicitly voluntary and not a certification scheme.',
  },
  {
    q: 'Do AI rules apply to organisations outside the jurisdiction that wrote them?',
    a: 'Frequently, yes. The EU AI Act reaches providers and deployers established outside the Union where the system’s output is used within it. Data protection law has long had extraterritorial reach. Prescriptive regimes elsewhere attach to services offered to local users regardless of where the provider sits. Assuming you are out of scope because of where you are headquartered is the wrong test.',
  },
];
