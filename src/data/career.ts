export interface TimelineEntry {
  year: string;
  range: string;
  title: string;
  org: string;
  location: string;
  summary: string;
  highlights: string[];
  tags: string[];
}

export const timeline: TimelineEntry[] = [
  {
    year: '2026',
    range: 'Aug 2024 — Present',
    title: 'Senior Principal Enterprise Architect',
    org: 'GSK — APM, Emerging Technology & Digital Innovation',
    location: 'Bengaluru, India',
    summary:
      'Directing enterprise-wide architecture governance and AI acceleration across R&D, Commercial, Supply Chain, and Global Functions of a global life sciences enterprise.',
    highlights: [
      'Introduced the TIE (Triage–Invest–Expand) framework to govern emerging tech, GenAI and Agentic AI investment under structured capital allocation controls.',
      'Architected and scaled a global AI Accelerator & Innovation Lab, moving GenAI/Agentic AI use cases from experimentation to governed enterprise deployment.',
      'Own the Global Technology Radar and Horizon-2 / Horizon-3 investment funnel as Emerging Technology & Innovation Product Owner.',
      'Embedded Responsible AI governance, security alignment and production-grade deployment pathways across scientific, regulatory and commercial domains.',
    ],
    tags: ['Enterprise Architecture', 'AI Strategy', 'Governance', 'GenAI', 'Agentic AI'],
  },
  {
    year: '2021',
    range: 'Oct 2021 — Aug 2024',
    title: 'Senior Manager — Innovation & Emerging Technology',
    org: 'GSK — R&D, Digital Health & Innovation',
    location: 'Bengaluru, India',
    summary:
      'Led global R&D digital innovation strategy across clinical development, translational research and therapeutic portfolios.',
    highlights: [
      'Drove Horizon-2/Horizon-3 innovation using IFTF-inspired foresight methods, scenario modelling and VUCA-informed prioritization.',
      'Architected digital biomarker and decentralized clinical trial (DCT) strategies across oncology, respiratory, infectious disease and immunology.',
      'Built a global open-innovation ecosystem spanning digital therapeutics, computer vision/ML and IIoT health-device startups.',
      'Institutionalized technology radar governance balancing exploratory (H3) and near-term (H2) value realization.',
    ],
    tags: ['Digital Health', 'DCT', 'SaMD', 'Innovation Strategy'],
  },
  {
    year: '2018',
    range: 'Dec 2018 — Sep 2021',
    title: 'Staff Technical Product Manager — Finance Analytics',
    org: 'GE Healthcare Global',
    location: 'Bengaluru, India',
    summary:
      'Enabled regulatory-grade standalone public-market readiness during a multi-billion-dollar corporate carve-out through One-ERP consolidation and SAP HANA digital core transformation.',
    highlights: [
      'Led One-ERP consolidation of PeopleSoft, SAP ECC, Oracle Financials and Hyperion into a unified SAP HANA digital core.',
      'Accelerated financial consolidation cycles by 35% and reduced system redundancy by 40%.',
      'Improved executive decision-cycle speed by 30% by shifting reporting from batch to near real-time visibility.',
      'Architected enterprise data governance and chart-of-accounts rationalization frameworks.',
    ],
    tags: ['ERP Transformation', 'SAP HANA', 'Finance Analytics', 'M&A Carve-out'],
  },
  {
    year: '2016',
    range: 'Jul 2016 — Dec 2018',
    title: 'Senior Manager — App Dev & Maintenance, BI & Big Data Analytics',
    org: 'Vodafone Idea Limited, Corporate IT',
    location: 'Pune, India',
    summary:
      'Modernized enterprise data platforms across PAN-India telecom operations serving 300M+ subscribers.',
    highlights: [
      'Directed migration from Teradata/IBM BigInsights/Oracle to AWS & Azure (Hadoop/Cloudera) multi-cloud big data platforms.',
      'Led digital transformation of the My Vodafone app, integrating real-time network intelligence telemetry.',
      'Governed a multi-vendor ecosystem (IBM, TCS, Accenture, Tech Mahindra) delivering CRM and analytics platforms nationwide.',
      'Improved analytics processing performance by 40% and strengthened revenue intelligence.',
    ],
    tags: ['Big Data', 'Cloud Migration', 'Telecom', 'Vendor Governance'],
  },
  {
    year: '2011',
    range: 'Sep 2011 — Jul 2016',
    title: 'Senior Product Engineering Implementation Specialist',
    org: 'AIRCOM International (a TEOCO Company)',
    location: 'Gurgaon, India',
    summary: 'Delivered network analytics and optimisation implementations for global telecom operators.',
    highlights: [],
    tags: ['Network Analytics', 'Telecom Product Engineering'],
  },
  {
    year: '2010',
    range: 'Aug 2010 — Aug 2011',
    title: 'Engineer — 1st Level Assurance (Network Analytics & Optimisation)',
    org: 'Ericsson India Global Services',
    location: 'Gurgaon, India',
    summary: 'Provided network analytics assurance and optimisation support for large telecom deployments.',
    highlights: [],
    tags: ['Network Operations', 'Telecom'],
  },
  {
    year: '2009',
    range: 'May 2009 — Jul 2010',
    title: 'Analyst — Performance Management, Global Network Support Centre',
    org: 'Nokia Siemens Networks (via Kelly Services)',
    location: 'Noida, India',
    summary: 'Performance management analytics for a global network support function.',
    highlights: [],
    tags: ['Performance Management'],
  },
  {
    year: '2007',
    range: 'Oct 2007 — Apr 2009',
    title: 'Engineer — Operations Support / Performance Management & Network Operations',
    org: 'Ericsson India (via CadTech Consultants)',
    location: 'Gurgaon, India',
    summary:
      'Where it all began — first engineering role in network operations and performance management, right after completing my B.Tech in Electronics & Telecommunication Engineering.',
    highlights: [],
    tags: ['Career Start', 'Network Operations'],
  },
];

export const education = [
  {
    period: 'Feb 2024 — May 2025',
    program: 'Executive Postgraduate Programme in Data Science, AI/ML & Generative AI-Based Product Management',
    school: 'Indian Institute of Technology (IIT) Guwahati',
  },
  {
    period: 'Apr 2021 — Aug 2022',
    program: 'Executive Postgraduate Programme in Data-Driven Product Management',
    school: 'Indian Institute of Management (IIM) Lucknow',
  },
  {
    period: 'Jul 2003 — Aug 2007',
    program: 'B.Tech, Electronics and Telecommunication Engineering',
    school: 'Kurukshetra University',
  },
];

export const competencies = [
  {
    area: 'Enterprise Architecture & Investment Governance',
    scope:
      'TOGAF-aligned Design Authority, reference architectures, architecture guardrails, portfolio rationalization, enterprise standards governance.',
  },
  {
    area: 'AI Strategy & Industrialization',
    scope:
      'Generative AI, Agentic AI, AI operating models, Responsible AI governance, enterprise AI deployment & scale.',
  },
  {
    area: 'Digital Core & Cloud Modernization',
    scope: 'AWS, Azure, GCP, SAP HANA, big data platforms, distributed systems, cloud-native architecture.',
  },
  {
    area: 'ERP & Financial Systems Transformation',
    scope:
      'Multi-ERP harmonization, SAP ECC, PeopleSoft, Oracle Financials, Hyperion, chart-of-accounts rationalization.',
  },
  {
    area: 'Innovation Portfolio & Technology Governance',
    scope: 'Horizon-2 / Horizon-3, technology radar, TIE framework, emerging tech evaluation, capital allocation.',
  },
  {
    area: 'Digital Health & RWD/RWE Architecture',
    scope: 'Clinical innovation, decentralized clinical trials, digital biomarkers, SaMD ecosystems, interoperability.',
  },
  {
    area: 'Enterprise Data & Analytics Strategy',
    scope: 'Data governance, MDM, ETL, OLAP, financial analytics, revenue intelligence platforms.',
  },
  {
    area: 'Global Capability & Vendor Leadership',
    scope: 'Multi-vendor governance (IBM, Accenture, TCS, Tech Mahindra), talent development, executive alignment.',
  },
];

export const heroStats = [
  { label: 'Years in Enterprise Tech', value: '18+' },
  { label: 'Users Impacted (Telecom Modernization)', value: '300M+' },
  { label: 'Faster Financial Consolidation', value: '35%' },
  { label: 'Reduction in System Redundancy', value: '40%' },
];
