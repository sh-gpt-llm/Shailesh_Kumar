import type { APIRoute } from 'astro';
import {
  SOURCE_NOTE,
  PILLARS,
  DESIGN_PRINCIPLES,
  LIFECYCLE,
  OWNER_ROLES,
  THREE_LINES,
  ACCOUNTABILITY_MOMENTS,
  CONTROL_THEMES,
  OVERSIGHT_RULE,
  GENAI_RISKS,
  AUTONOMY_LEVELS,
  AGENTIC_CONTROLS,
  AGENTIC_THESIS,
  SHADOW_AI,
  MATURITY,
  METRICS,
  ANTI_PATTERNS,
} from '../../data/ai-governance/model';
import { DIMENSIONS, LANES, TRIAGE_RULES, MODULES, OBLIGATIONS, SCOPE_NOTE, AI_FAQ } from '../../data/ai-governance/triage';
import { STANDARDS, STANDARDS_NOTE, LANDSCAPE_INSIGHT, STANDARDS_FAQ } from '../../data/ai-governance/standards';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://vantessence.com';

  const payload = {
    name: 'AI governance operating model — intake, accountability, responsible AI',
    description:
      'A complete operating model for governing AI: one intake front door with published triage rules, named accountability, nine control themes mapped to NIST AI RMF, ISO/IEC 42001, the OECD principles and the EU AI Act, an obligation map, and generative and agentic overlays.',
    author: { name: 'Shailesh Kumar', url: `${base}/` },
    url: `${base}/ai-governance/`,
    methodology: `${base}/ai-governance/framework/`,
    license: 'Free to adopt, adapt and cite with attribution to Shailesh Kumar (vantessence.com).',
    deterministic: true,
    usesLanguageModel: false,
    sourceNote: SOURCE_NOTE,
    disclaimer:
      'An operating model, not legal advice. Obligations are described by category rather than by date because the EU AI Act phase-in schedule has been amended; verify current effective dates against the Official Journal.',

    pillars: PILLARS.map((p) => ({ id: p.id, name: p.name, question: p.question, outcome: p.outcome, failureMode: p.failure })),
    designPrinciples: DESIGN_PRINCIPLES,
    scope: SCOPE_NOTE,
    lifecycle: LIFECYCLE,

    accountability: {
      roles: OWNER_ROLES.map((r) => ({ role: r.role, owns: r.owns, line: r.firstLine ? 'first' : 'second or third' })),
      threeLines: THREE_LINES,
      momentsRequiringAName: ACCOUNTABILITY_MOMENTS,
      principle: 'Risk accepted by a committee is risk accepted by nobody. Owners are individuals.',
    },

    controlFramework: {
      description:
        'Nine themes, each mapped to the frameworks it satisfies. The mapping absorbs regulatory change: when an obligation moves, re-point a mapping rather than rewrite a programme.',
      themes: CONTROL_THEMES.map((t) => ({ id: t.id, name: t.name, intent: t.intent, controls: t.controls, frameworkAnchors: t.anchors })),
    },

    oversightRule: OVERSIGHT_RULE,

    triage: {
      description:
        'Ten dimensions, evaluated against ordered rules. The first rule that matches decides the route. A prohibited-practice screen runs first and cannot be overridden by anything downstream.',
      dimensions: DIMENSIONS.map((d) => ({
        id: d.id,
        name: d.name,
        question: d.question,
        rationale: d.why,
        options: d.options.map((o) => ({ value: o.value, label: o.label, flags: o.flags ?? [] })),
      })),
      rules: TRIAGE_RULES,
      lanes: LANES.map((l) => ({ id: l.id, label: l.label, meaning: l.meaning, serviceLevel: l.sla })),
      assessmentModules: MODULES.map((m) => ({ id: m.id, name: m.name, scope: m.scope, reviewer: m.reviewer, attachesOnFlags: m.whenFlags })),
    },

    obligationMap: {
      description:
        'A risk tier tells you how much review to do. It does not tell you what you must produce. This maps answers to deliverables.',
      obligations: OBLIGATIONS.map((o) => ({
        id: o.id,
        name: o.name,
        applies: o.applies,
        produce: o.produce,
        frameworkAnchor: o.anchor,
        attachesOnFlags: o.whenFlags,
      })),
    },

    generativeRisks: {
      source: 'NIST Generative AI Profile — twelve risk categories',
      categories: GENAI_RISKS.map((r) => ({ number: r.n, name: r.name, concern: r.concern })),
    },

    agentic: {
      thesis: AGENTIC_THESIS,
      autonomyLevels: AUTONOMY_LEVELS,
      controls: AGENTIC_CONTROLS,
      note: 'Autonomy is classified first because it determines every other control.',
    },

    shadowAi: SHADOW_AI,

    standardsLandscape: {
      note: STANDARDS_NOTE,
      insights: LANDSCAPE_INSIGHT,
      regions: [...new Set(STANDARDS.map((s) => s.region))],
      natures: [...new Set(STANDARDS.map((s) => s.nature))],
      instruments: STANDARDS.map((s) => ({
        id: s.id,
        name: s.name,
        body: s.body,
        region: s.region,
        nature: s.nature,
        covers: s.covers,
        soWhat: s.soWhat,
        supportsControlThemes: s.themes,
      })),
      faq: STANDARDS_FAQ.map((f) => ({ question: f.q, answer: f.a })),
    },
    maturityModel: MATURITY,
    metrics: METRICS,
    antiPatterns: ANTI_PATTERNS.map((p) => ({ name: p.name, looksLike: p.looks, costs: p.costs })),
    faq: AI_FAQ.map((f) => ({ question: f.q, answer: f.a })),

    privacy: 'The classifier runs entirely in the visitor’s browser. Nothing is transmitted to a server.',
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
