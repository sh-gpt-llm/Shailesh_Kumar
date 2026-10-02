import type { APIRoute } from 'astro';
import {
  DIMENSIONS,
  MAX_WEIGHTED,
  ASKS,
  VERDICTS,
  ROUTES,
  DILIGENCE,
  VENDOR_QUESTIONS,
  NEXA_FAQ,
} from '../../data/nexa/framework';
import { RING_TO_DIFFERENTIATION, HORIZON_TO_TIME_TO_VALUE, PREFILLABLE } from '../../scripts/nexa/prefill';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://vantessence.com';

  const payload = {
    name: 'NEXA — technology assessment framework',
    description:
      'A decision framework for emerging technology. A vendor, product or capability gap is scored across six weighted dimensions, normalised to a composite out of 100, and compared against a bar set by the size of the commitment being requested. The result is one of four verdicts.',
    author: { name: 'Shailesh Kumar', url: `${base}/` },
    url: `${base}/nexa/`,
    methodology: `${base}/nexa/framework/`,
    license: 'Free to adopt, adapt and cite with attribution to Shailesh Kumar (vantessence.com).',
    deterministic: true,
    usesLanguageModel: false,

    scoring: {
      scale: { min: 0, max: 4, step: 1 },
      maxWeighted: Number(MAX_WEIGHTED.toFixed(4)),
      composite: 'round((sum over dimensions of weight * score) / maxWeighted * 100)',
      note: 'No model is involved. Two people scoring the same inputs the same way will reach the same verdict.',
    },

    dimensions: DIMENSIONS.map((d) => ({
      id: d.id,
      name: d.name,
      question: d.question,
      rationale: d.why,
      weight: d.weight,
      anchors: d.anchors.map((a) => ({ score: a.score, meaning: a.label })),
    })),

    sizeOfAsk: ASKS.map((a) => ({ id: a.id, label: a.label, meaning: a.detail, compositeMustClear: a.bar })),

    verdicts: VERDICTS.map((v) => ({
      id: v.id,
      label: v.label,
      meaning: v.meaning,
      nextStep: v.nextStep,
      color: v.color,
    })),

    verdictRules: [
      {
        order: 1,
        name: 'Estate override',
        condition: 'overlap === 0 && gap <= 1',
        result: 'park',
        reason: 'A direct equivalent is already in place. No amount of strategic alignment justifies buying a second one.',
      },
      {
        order: 2,
        name: 'Clears the bar, fast and reversible',
        condition: 'composite >= bar && timeToValue >= 3 && reversibility >= 2 && ask in [low, moderate]',
        result: 'poc',
        reason: 'Cheap to prove and cheap to undo, so proving it beats debating it.',
      },
      { order: 3, name: 'Clears the bar', condition: 'composite >= bar', result: 'pilot', reason: 'Strong case, but slow or hard enough to reverse that it needs structure.' },
      { order: 4, name: 'Within fifteen of the bar', condition: 'composite >= bar - 15', result: 'explore', reason: 'Real potential, but something is not yet true.' },
      { order: 5, name: 'Default', condition: 'otherwise', result: 'park', reason: 'Not differentiated or needed enough to justify the disruption.' },
    ],

    gapRouting: {
      description: 'When there is no vendor yet, the same scores produce a routing decision rather than a purchase decision.',
      rules: [
        { condition: 'gap <= 1 || overlap === 0', result: 'own' },
        { condition: 'gap <= 2 || overlap <= 2', result: 'extend' },
        { condition: 'otherwise', result: 'scout' },
      ],
      routes: ROUTES.map((r) => ({ id: r.id, label: r.label, meaning: r.meaning })),
    },

    swing: {
      description:
        'The framework also reports the single dimension that, raised by one point, most improves the case — and whether that change flips the verdict. A dimension that changes the verdict always outranks one that only moves the number.',
    },

    radarPrefill: {
      description:
        'Where the subject matches a technology on the Emerging Technology & Innovation Radar, starting values are offered for the dimensions that are properties of the technology itself. The remaining dimensions describe the assessing organisation and are never inferred.',
      source: `${base}/radar/data.json`,
      prefillable: PREFILLABLE,
      neverInferred: DIMENSIONS.filter((d) => !PREFILLABLE.includes(d.id)).map((d) => d.id),
      ringToDifferentiation: RING_TO_DIFFERENTIATION,
      momentumAdjustment: { new: 1, cooling: -1, accelerating: 0, steady: 0, clampedTo: [0, 4] },
      horizonToTimeToValue: HORIZON_TO_TIME_TO_VALUE.map((h) => ({ horizon: h.match, score: h.score })),
      horizonDefault: 2,
      applied: 'Only on explicit user action. Every value remains overridable.',
    },

    diligence: DILIGENCE.map((d) => ({
      id: d.id,
      name: d.name,
      question: d.prompt,
      raisedWhenWeak: d.triggers,
    })),

    vendorQuestions: VENDOR_QUESTIONS.map((q) => ({ question: q.q, why: q.why })),

    faq: NEXA_FAQ.map((f) => ({ question: f.q, answer: f.a })),

    privacy: 'Assessments are held in the visitor’s browser only. Nothing is transmitted to a server.',
    caveat: 'Directional guidance to focus deeper diligence — never a replacement for it.',
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
