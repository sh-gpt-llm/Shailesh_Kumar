import type { APIRoute } from 'astro';
import {
  EARB_PURPOSE,
  TRIAGE_TESTS,
  ROUTES,
  ASK_TYPES,
  CRITERIA,
  OUTCOMES,
  INTEGRITY_RULES,
  WAIVER,
  HEALTH_METRICS,
  ANTI_PATTERNS,
  EARB_FAQ,
} from '../../data/earb/model';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://vantessence.com';

  const payload = {
    name: 'EARB — Enterprise Architecture Review Board operating model',
    description:
      'A complete operating model for an architecture review board: triage and entry criteria, the DIA(+C) classification of what is being asked, weighted submission readiness criteria, six decision outcomes, integrity rules, a waiver process, service levels, health metrics and anti-patterns.',
    author: { name: 'Shailesh Kumar', url: `${base}/` },
    url: `${base}/earb/`,
    methodology: `${base}/earb/framework/`,
    license: 'Free to adopt, adapt and cite with attribution to Shailesh Kumar (vantessence.com).',
    deterministic: true,
    usesLanguageModel: false,

    purpose: EARB_PURPOSE,

    triage: {
      description:
        'Four tests applied at submission decide where an item is decided. Governance effort should be proportionate to the size of the bet.',
      tests: TRIAGE_TESTS.map((t) => ({ id: t.id, name: t.name, question: t.question, rationale: t.why })),
      scale: { 0: 'lowest', 3: 'highest' },
      rules: [
        { order: 1, condition: 'reversibility >= 3 || blastRadius >= 3 || novelty >= 3', route: 'full' },
        { order: 2, condition: 'reversibility >= 2 || blastRadius >= 2 || novelty >= 2 || materiality >= 3', route: 'fast' },
        { order: 3, condition: 'otherwise', route: 'delegated' },
      ],
      routes: ROUTES.map((r) => ({ id: r.id, label: r.label, meaning: r.meaning, serviceLevel: r.sla })),
    },

    askTypes: ASK_TYPES.map((a) => ({
      id: a.id,
      code: a.code,
      label: a.label,
      meaning: a.meaning,
      paperMustCarry: a.requires,
    })),

    readiness: {
      description:
        'Each applicable criterion is answered yes (1), partly (0.5) or no (0), weighted, and normalised to a percentage. Criteria apply only to the kinds of ask listed.',
      criteria: CRITERIA.map((c) => ({
        id: c.id,
        name: c.name,
        test: c.test,
        rationale: c.why,
        weight: c.weight,
        boardChallenge: c.challenge,
        appliesTo: c.appliesTo,
      })),
      outcomeBands: [
        { condition: 'ask is information or awareness', outcome: 'noted' },
        { condition: 'readiness >= 85', outcome: 'approved' },
        { condition: 'readiness >= 70', outcome: 'conditions' },
        { condition: 'readiness >= 50', outcome: 'rework' },
        { condition: 'otherwise', outcome: 'deferred' },
      ],
    },

    outcomes: OUTCOMES.map((o) => ({
      id: o.id,
      label: o.label,
      meaning: o.meaning,
      whatFollows: o.next,
      expiry: o.expiry,
    })),

    integrity: INTEGRITY_RULES.map((r) => ({ name: r.name, rule: r.rule, rationale: r.why })),

    waivers: {
      summary: WAIVER.summary,
      requirements: WAIVER.requirements,
      warning: WAIVER.warning,
    },

    healthMetrics: HEALTH_METRICS.map((m) => ({ name: m.name, measure: m.measure, target: m.target, signal: m.signal })),

    antiPatterns: ANTI_PATTERNS.map((p) => ({ name: p.name, looksLike: p.looks, costs: p.costs })),

    standardsSource: {
      description:
        'A gate must test against published positions or it is senior opinion. Technology positions are taken from the radar.',
      radar: `${base}/radar/data.json`,
      rule: 'A submission naming a Hold-ring technology is challenged by default; Assess-ring technologies attract reversibility and exit questions.',
    },

    faq: EARB_FAQ.map((f) => ({ question: f.q, answer: f.a })),

    privacy: 'The readiness tool runs entirely in the visitor’s browser. Nothing is transmitted to a server.',
    caveat: 'A rehearsal, not a ruling. Directional guidance for preparing a submission — never a substitute for the board.',
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
