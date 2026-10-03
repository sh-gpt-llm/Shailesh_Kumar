import {
  ENGAGE_QUESTIONS,
  LEVELS,
  levelMeta,
  NEXT_STEPS,
} from '../data/earb/engagement';
import type { Level } from '../data/earb/engagement';
import { download } from './radar/export';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

type Answers = Record<string, Level>;

export function initEarbEngage() {
  const root = document.getElementById('earb-engage');
  if (!root) return;

  let stage: 'start' | number | 'result' = 'start';
  let initiative = '';
  let team = '';
  let answers: Answers = {};
  let reference = '';
  let toast = '';

  const newReference = () => {
    const a = Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');
    return `EA-${a}`;
  };

  function flash(message: string) {
    toast = message;
    render();
    setTimeout(() => {
      toast = '';
      render();
    }, 2200);
  }

  /** Highest trigger wins, and an unsure answer never lowers the level. */
  function outcome(): Exclude<Level, 'unsure'> {
    const values = ENGAGE_QUESTIONS.map((q) => answers[q.id]).filter(Boolean) as Level[];
    if (values.includes('board')) return 'board';
    if (values.includes('single') || values.includes('unsure')) return 'single';
    return 'none';
  }

  function triggers() {
    const result = outcome();
    return ENGAGE_QUESTIONS.flatMap((q) => {
      const a = answers[q.id];
      if (!a || a === 'none') return [];
      if (result === 'board' && a !== 'board') return [];
      const option = q.options.find((o) => o.level === a)!;
      return [{ q, option, level: a }];
    });
  }

  /* ---------------------------------------------------------------- views */

  function startView() {
    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft p-7 sm:p-9">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Before you start</p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">Ten questions, about two minutes</h2>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
            Answer for the initiative as it is actually scoped today, not as you hope it will land. Where you are
            unsure, say so — an unsure answer raises the level rather than lowering it, which is the right default.
          </p>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="eng-initiative">Initiative name <span class="font-normal normal-case tracking-normal text-mist/60">— optional</span></label>
              <input id="eng-initiative" type="text" value="${esc(initiative)}" autocomplete="off" placeholder="e.g. Claims portal consolidation"
                class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="eng-team">Team or business area <span class="font-normal normal-case tracking-normal text-mist/60">— optional</span></label>
              <input id="eng-team" type="text" value="${esc(team)}" autocomplete="off" placeholder="e.g. Operations"
                class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />
            </div>
          </div>
          <p class="mt-3 text-xs text-mist/70">
            Both are optional and only used to label your summary. There is deliberately no name or email field —
            nothing here is sent anywhere, so there would be nothing to send it to.
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-3">
            ${LEVELS.map(
              (l) => `
              <div class="rounded-2xl border p-4" style="border-color:${l.color}44;background:${l.color}10">
                <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style="color:${l.color}">
                  <span class="h-1.5 w-1.5 rounded-full" style="background:${l.color}"></span>${esc(l.label)}
                </p>
                <p class="mt-2 text-xs leading-relaxed text-mist">${esc(l.summary)}</p>
              </div>`
            ).join('')}
          </div>

          <div class="mt-7 flex justify-end">
            <button data-action="begin" class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">Start the questions →</button>
          </div>
        </div>
      </section>`;
  }

  function questionView(index: number) {
    const q = ENGAGE_QUESTIONS[index];
    const chosen = answers[q.id];
    const pct = Math.round((index / ENGAGE_QUESTIONS.length) * 100);
    const badge = (level: Level) => {
      if (level === 'unsure') return { text: 'Not sure', color: '#94a3b8' };
      const m = levelMeta(level);
      return { text: level === 'none' ? 'No engagement' : level === 'single' ? 'Single architect' : 'Review board', color: m.color };
    };

    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft p-7 sm:p-9">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-mist">Question ${index + 1} of ${ENGAGE_QUESTIONS.length}</p>
            <p class="text-xs font-semibold text-amber-400">${esc(q.topic)}</p>
          </div>
          <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style="width:${pct}%"></div>
          </div>

          <h2 class="mt-6 font-display text-2xl font-semibold text-white">${esc(q.question)}</h2>
          <p class="mt-2 text-sm text-mist">${esc(q.hint)}</p>

          <div class="mt-6 space-y-2.5">
            ${q.options
              .map((o) => {
                const b = badge(o.level);
                const active = chosen === o.level;
                return `
              <button data-action="answer" data-id="${q.id}" data-level="${o.level}"
                class="flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  active ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                }">
                <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-white' : 'border-white/30'}">
                  ${active ? '<span class="h-2 w-2 rounded-full bg-white"></span>' : ''}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm leading-relaxed text-white">${esc(o.text)}</span>
                  <span class="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style="background:${b.color}26;color:${b.color}">${esc(b.text)}</span>
                </span>
              </button>`;
              })
              .join('')}
          </div>

          <p class="mt-5 border-l-2 border-white/15 pl-3 text-xs leading-relaxed text-mist/70">${esc(q.why)}</p>

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="prev" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">← Back</button>
            <button data-action="next" ${chosen ? '' : 'disabled'}
              class="rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                chosen ? 'bg-gradient-to-r from-violet-500 to-cyan-400 text-ink hover:opacity-90' : 'cursor-not-allowed bg-white/10 text-mist/50'
              }">${index === ENGAGE_QUESTIONS.length - 1 ? 'See recommendation ✓' : 'Next →'}</button>
          </div>
        </div>
      </section>`;
  }

  function summaryText() {
    const result = outcome();
    const m = levelMeta(result);
    const lines = [
      `EA ENGAGEMENT RECOMMENDATION`,
      `Reference: ${reference}`,
      `Date: ${new Date().toISOString().slice(0, 10)}`,
      initiative ? `Initiative: ${initiative}` : '',
      team ? `Team: ${team}` : '',
      ``,
      `RECOMMENDATION: ${m.label}`,
      m.summary,
      `Expected turnaround: ${m.sla}`,
      ``,
      `WHY`,
      ...triggers().map((t) => `- ${t.q.topic}: ${t.option.text}${t.level === 'unsure' ? ' (unsure — raised the level)' : ''}`),
      triggers().length ? '' : '- No triggers. Every answer sat at the lowest level.',
      ``,
      `WHAT TO DO NOW`,
      ...NEXT_STEPS[result].map((s, i) => `${i + 1}. ${s}`),
      ``,
      `ALL ANSWERS`,
      ...ENGAGE_QUESTIONS.map((q) => {
        const a = answers[q.id];
        const o = q.options.find((x) => x.level === a);
        return `- ${q.topic}: ${o ? o.text : 'not answered'}`;
      }),
      ``,
      `Produced with the EA engagement triage at https://vantessence.com/earb/engage/`,
      `Thresholds are indicative. Every organisation must set its own.`,
    ];
    return lines.filter((l) => l !== undefined).join('\n');
  }

  function resultView() {
    const result = outcome();
    const m = levelMeta(result);
    const list = triggers();

    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft">
          <div class="rounded-3xl p-7 sm:p-9">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Your recommendation</p>
                <p class="mt-2 font-mono text-xs text-mist">${esc(reference)}</p>
              </div>
              <button data-action="restart" class="no-print rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Start over</button>
            </div>

            <div class="mt-6 rounded-2xl border-l-4 p-5" style="border-color:${m.color};background:${m.color}12">
              <h2 class="font-display text-2xl font-semibold" style="color:${m.color}">${esc(m.label)}</h2>
              <p class="mt-2 text-sm leading-relaxed text-mist">${esc(m.summary)}</p>
              <p class="mt-2 text-xs text-mist/70">Expected turnaround — ${esc(m.sla)}</p>
            </div>

            <h3 class="mt-8 text-xs font-semibold uppercase tracking-wide text-cyan-400">Summary</h3>
            <dl class="mt-3 divide-y divide-white/5 text-sm">
              <div class="flex gap-4 py-2.5"><dt class="w-40 shrink-0 text-mist">Reference</dt><dd class="font-mono text-white">${esc(reference)}</dd></div>
              <div class="flex gap-4 py-2.5"><dt class="w-40 shrink-0 text-mist">Date</dt><dd class="text-white">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</dd></div>
              ${initiative ? `<div class="flex gap-4 py-2.5"><dt class="w-40 shrink-0 text-mist">Initiative</dt><dd class="text-white">${esc(initiative)}</dd></div>` : ''}
              ${team ? `<div class="flex gap-4 py-2.5"><dt class="w-40 shrink-0 text-mist">Team</dt><dd class="text-white">${esc(team)}</dd></div>` : ''}
              <div class="flex gap-4 py-2.5"><dt class="w-40 shrink-0 text-mist">Recommendation</dt><dd class="text-white">${esc(m.label)}</dd></div>
            </dl>

            <h3 class="mt-8 text-xs font-semibold uppercase tracking-wide text-cyan-400">Why this recommendation</h3>
            ${
              list.length
                ? `<div class="mt-3 space-y-2.5">
                     ${list
                       .map((t) => {
                         const c = t.level === 'unsure' ? '#94a3b8' : levelMeta(t.level as Exclude<Level, 'unsure'>).color;
                         const tag = t.level === 'unsure' ? 'Unsure — raised the level' : t.level === 'board' ? 'Board trigger' : 'Single-architect trigger';
                         return `
                       <div class="rounded-xl border-l-2 bg-white/[0.03] p-4" style="border-color:${c}">
                         <p class="text-[10px] font-semibold uppercase tracking-wide text-mist">${esc(t.q.topic)} · <span style="color:${c}">${esc(tag)}</span></p>
                         <p class="mt-1.5 text-sm leading-relaxed text-white">${esc(t.option.text)}</p>
                       </div>`;
                       })
                       .join('')}
                   </div>`
                : `<p class="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-sm text-mist">No triggers fired. Every answer sat at the lowest level, so this is yours to decide and record.</p>`
            }

            <h3 class="mt-8 text-xs font-semibold uppercase tracking-wide text-cyan-400">What to do now</h3>
            <ol class="mt-3 space-y-2">
              ${NEXT_STEPS[result]
                .map(
                  (s, i) => `
                <li class="flex gap-3">
                  <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/30 text-[10px] font-bold text-violet-200">${i + 1}</span>
                  <span class="text-sm leading-relaxed text-mist">${esc(s)}</span>
                </li>`
                )
                .join('')}
            </ol>

            <div class="no-print mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              ${
                result === 'board'
                  ? `<a href="/earb/" class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-ink transition hover:opacity-90">Check if your submission is ready →</a>`
                  : ''
              }
              <button data-action="copy" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90">Copy summary</button>
              <button data-action="export" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Download</button>
              <button data-action="print" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Print / PDF</button>
            </div>
            <p class="mt-4 text-[11px] leading-relaxed text-mist/60">
              Indicative guidance against the
              <a href="/earb/framework/" class="underline decoration-dotted hover:text-white">published operating model</a> —
              every organisation sets its own thresholds. Nothing you enter leaves your browser.
            </p>
          </div>
        </div>
      </section>`;
  }

  /* --------------------------------------------------------------- render */

  function render() {
    const body = stage === 'start' ? startView() : stage === 'result' ? resultView() : questionView(stage as number);
    root!.innerHTML = `${body}${
      toast ? `<div class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xl">${esc(toast)}</div>` : ''
    }`;
    bind();
  }

  function capture() {
    const a = document.getElementById('eng-initiative') as HTMLInputElement | null;
    const b = document.getElementById('eng-team') as HTMLInputElement | null;
    if (a) initiative = a.value;
    if (b) team = b.value;
  }

  function bind() {
    root!.querySelectorAll<HTMLElement>('[data-action]').forEach((el) =>
      el.addEventListener('click', (ev) => {
        if (el.tagName === 'A') return;
        ev.preventDefault();
        handle(el.dataset.action!, el);
      })
    );
  }

  function handle(action: string, el: HTMLElement) {
    switch (action) {
      case 'begin':
        capture();
        stage = 0;
        render();
        break;
      case 'answer':
        answers[el.dataset.id!] = el.dataset.level as Level;
        render();
        break;
      case 'next': {
        const i = stage as number;
        if (i === ENGAGE_QUESTIONS.length - 1) {
          reference = newReference();
          stage = 'result';
        } else {
          stage = i + 1;
        }
        render();
        break;
      }
      case 'prev':
        stage = (stage as number) === 0 ? 'start' : (stage as number) - 1;
        render();
        break;
      case 'restart':
        answers = {};
        stage = 'start';
        reference = '';
        render();
        break;
      case 'copy':
        navigator.clipboard?.writeText(summaryText()).then(
          () => flash('Summary copied'),
          () => flash('Copy failed — your browser blocked clipboard access')
        );
        break;
      case 'export':
        download(`ea-engagement-${reference.toLowerCase()}.txt`, summaryText(), 'text/plain;charset=utf-8');
        flash('Summary downloaded');
        break;
      case 'print':
        window.print();
        break;
    }
  }

  render();
}
