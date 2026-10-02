import { DIMENSIONS, ASKS, verdictById } from '../../data/nexa/framework';
import type { AskId } from '../../data/nexa/framework';
import { assess, BLANK_SCORES } from './engine';
import type { Assessment, Scores } from './engine';

const KEY = 'vantessence.nexa.assessments';

export function loadAll(): Assessment[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Assessment[]) : [];
    return Array.isArray(list) ? list.filter((a) => a && typeof a.id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveAll(list: Assessment[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* private browsing — assessments live for the session only */
  }
}

export function newAssessment(path: 'vendor' | 'gap'): Assessment {
  return {
    id: Math.random().toString(36).slice(2, 10),
    path,
    subject: '',
    capability: '',
    estate: [],
    ask: 'moderate',
    scores: { ...BLANK_SCORES },
    created: new Date().toISOString().slice(0, 10),
  };
}

/* ------------------------------------------------------------ URL sharing */

const DIM_ORDER = DIMENSIONS.map((d) => d.id);
const ASK_CODE: Record<AskId, string> = { low: 'l', moderate: 'm', significant: 's', major: 'x' };

/** Compact wire format: "<ask><six digits>~<subject>" e.g. "m342213~Acme Copilot". */
export function encodeAssessment(a: Assessment): string {
  const digits = DIM_ORDER.map((id) => String(Math.max(0, Math.min(4, a.scores[id])))).join('');
  return `${ASK_CODE[a.ask]}${digits}~${encodeURIComponent(a.subject.slice(0, 80))}`;
}

export function decodeAssessment(encoded: string): Assessment | null {
  const m = /^([lmsx])([0-4]{6})~?(.*)$/.exec(encoded.trim());
  if (!m) return null;
  const ask = (Object.keys(ASK_CODE) as AskId[]).find((k) => ASK_CODE[k] === m[1]) ?? 'moderate';
  const scores = {} as Scores;
  DIM_ORDER.forEach((id, i) => {
    scores[id] = Number(m[2][i]);
  });
  const a = newAssessment('vendor');
  let subject = '';
  try {
    subject = decodeURIComponent(m[3] ?? '');
  } catch {
    subject = m[3] ?? '';
  }
  return { ...a, ask, scores, subject };
}

/* ---------------------------------------------------------------- exports */

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(list: Assessment[]): string {
  const header = ['subject', 'path', 'capability', 'sizeOfAsk', 'score', 'bar', 'verdict', ...DIM_ORDER, 'estate', 'assessed'];
  const rows = list.map((a) => {
    const r = assess(a);
    return [
      a.subject,
      a.path,
      a.capability,
      ASKS.find((x) => x.id === a.ask)?.label ?? a.ask,
      r.composite,
      r.bar,
      verdictById(r.verdict).label,
      ...DIM_ORDER.map((id) => a.scores[id]),
      a.estate.join('; '),
      a.created,
    ];
  });
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export function toJson(list: Assessment[]): string {
  return JSON.stringify(
    {
      framework: 'NEXA — technology assessment framework',
      source: 'https://vantessence.com/nexa/',
      methodology: 'https://vantessence.com/nexa/framework/',
      exported: new Date().toISOString().slice(0, 10),
      assessments: list.map((a) => {
        const r = assess(a);
        return {
          subject: a.subject,
          path: a.path,
          capability: a.capability,
          sizeOfAsk: a.ask,
          estate: a.estate,
          scores: a.scores,
          composite: r.composite,
          bar: r.bar,
          verdict: verdictById(r.verdict).label,
          reasoning: r.reasoning,
          assessed: a.created,
        };
      }),
    },
    null,
    2
  );
}
