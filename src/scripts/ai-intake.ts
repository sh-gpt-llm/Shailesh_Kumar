import { DIMENSIONS, LANES, laneMeta, TRIAGE_RULES } from '../data/ai-governance/triage';
import type { DimensionId } from '../data/ai-governance/triage';
import { AUTONOMY_LEVELS, AGENTIC_CONTROLS, GENAI_RISKS } from '../data/ai-governance/model';
import { classify } from './ai/classify';
import type { Answers } from './ai/classify';
import { download } from './radar/export';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export function initAiIntake() {
  const root = document.getElementById('ai-intake');
  if (!root) return;

  let stage: 'start' | number | 'result' = 'start';
  let name = '';
  let answers: Answers = {};
  let reference = '';
  let toast = '';

  const newRef = () =>
    `AI-${Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')}`;

  function flash(message: string) {
    toast = message;
    render();
    setTimeout(() => {
      toast = '';
      render();
    }, 2200);
  }

  /* ---------------------------------------------------------------- views */

  function startView() {
    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft p-7 sm:p-9">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Before you start</p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">${DIMENSIONS.length} questions, about three minutes</h2>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
            Answer for the system as it will actually run at volume, not as the pilot ran. The classification is
            deterministic — the rules are published below, so you can check the answer rather than trust it.
          </p>

          <label class="mt-6 block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="ai-name">
            System or use case name <span class="font-normal normal-case tracking-normal text-mist/60">— optional</span>
          </label>
          <input id="ai-name" type="text" value="${esc(name)}" autocomplete="off" placeholder="e.g. Claims triage assistant"
            class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />
          <p class="mt-2 text-xs text-mist/70">
            Used only to label your summary. Nothing you enter is transmitted anywhere — there is no server behind this page.
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-2">
            ${LANES.map(
              (l) => `
              <div class="rounded-2xl border p-4" style="border-color:${l.color}44;background:${l.color}10">
                <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style="color:${l.color}">
                  <span class="h-1.5 w-1.5 rounded-full" style="background:${l.color}"></span>${esc(l.label)}
                </p>
                <p class="mt-2 text-xs leading-relaxed text-mist">${esc(l.sla)}</p>
              </div>`
            ).join('')}
          </div>

          <div class="mt-7 flex justify-end">
            <button data-action="begin" class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">Start →</button>
          </div>
        </div>
      </section>`;
  }

  function questionView(index: number) {
    const d = DIMENSIONS[index];
    const chosen = answers[d.id];
    const pct = Math.round((index / DIMENSIONS.length) * 100);

    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft p-7 sm:p-9">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-mist">Question ${index + 1} of ${DIMENSIONS.length}</p>
            <p class="text-xs font-semibold text-amber-400">${esc(d.name)}</p>
          </div>
          <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style="width:${pct}%"></div>
          </div>

          <h2 class="mt-6 font-display text-2xl font-semibold text-white">${esc(d.question)}</h2>
          <p class="mt-2 text-sm leading-relaxed text-mist">${esc(d.hint)}</p>

          <div class="mt-6 space-y-2.5">
            ${d.options
              .map((o) => {
                const active = chosen === o.value;
                return `
              <button data-action="answer" data-id="${d.id}" data-value="${esc(o.value)}"
                class="flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  active ? 'border-white/40 bg-white/[0.08]' : 'border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                }">
                <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-white' : 'border-white/30'}">
                  ${active ? '<span class="h-2 w-2 rounded-full bg-gradient-to-br from-violet-400 to-cyan-300"></span>' : ''}
                </span>
                <span class="text-sm leading-relaxed ${active ? 'text-white' : 'text-mist'}">${esc(o.label)}</span>
              </button>`;
              })
              .join('')}
          </div>

          <p class="mt-5 border-l-2 border-white/15 pl-3 text-xs leading-relaxed text-mist/70">${esc(d.why)}</p>

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="prev" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">← Back</button>
            <button data-action="next" ${chosen ? '' : 'disabled'}
              class="rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                chosen ? 'bg-gradient-to-r from-violet-500 to-cyan-400 text-ink hover:opacity-90' : 'cursor-not-allowed bg-white/10 text-mist/50'
              }">${index === DIMENSIONS.length - 1 ? 'Classify ✓' : 'Next →'}</button>
          </div>
        </div>
      </section>`;
  }

  function summaryText() {
    const r = classify(answers);
    const m = laneMeta(r.lane);
    return [
      'AI USE CASE CLASSIFICATION',
      `Reference: ${reference}`,
      `Date: ${new Date().toISOString().slice(0, 10)}`,
      name ? `System: ${name}` : '',
      '',
      `ROUTE: ${m.label}`,
      m.meaning,
      `Expected turnaround: ${m.sla}`,
      '',
      'RULES THAT FIRED',
      ...r.firedRules.map((f) => `- Rule ${f.order}: ${f.name}`),
      '',
      'YOUR ANSWERS',
      ...DIMENSIONS.map((d) => {
        const o = d.options.find((x) => x.value === answers[d.id]);
        return `- ${d.name}: ${o ? o.label : 'not answered'}`;
      }),
      '',
      'ASSESSMENT MODULES THAT APPLY',
      ...(r.modules.length ? r.modules.map((x) => `- ${x.name} (${x.reviewer}) — ${x.scope}`) : ['- None beyond attestation.']),
      '',
      'OBLIGATIONS THAT ATTACH',
      ...r.obligations.map((o) => `- ${o.name}\n    Applies: ${o.applies}\n    Produce: ${o.produce}\n    Anchor: ${o.anchor}`),
      '',
      'ACCOUNTABLE ROLES TO NAME',
      ...r.ownersRequired.map((o) => `- ${o}`),
      '',
      r.overlays.includes('genai') ? 'GENERATIVE OVERLAY APPLIES — grounding, confabulation thresholds, prompt-injection defence, provenance, IP exposure, vendor model-change tracking.' : '',
      r.overlays.includes('agentic') ? 'AGENTIC OVERLAY APPLIES — classify autonomy first, then agent identity, tool permissions, memory scope, transaction limits, blast-radius containment and a tested kill-switch.' : '',
      '',
      'Classified against the published operating model at https://vantessence.com/ai-governance/framework/',
      'Indicative guidance. Obligation names are described by category; verify current effective dates against the Official Journal.',
    ]
      .filter((l) => l !== '')
      .join('\n');
  }

  function resultView() {
    const r = classify(answers);
    const m = laneMeta(r.lane);

    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft">
          <div class="rounded-3xl p-7 sm:p-9">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Classification</p>
                <p class="mt-2 font-mono text-xs text-mist">${esc(reference)}${name ? ` · ${esc(name)}` : ''}</p>
              </div>
              <button data-action="restart" class="no-print rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Start over</button>
            </div>

            <div class="mt-6 rounded-2xl border-l-4 p-5" style="border-color:${m.color};background:${m.color}12">
              <h2 class="font-display text-2xl font-semibold" style="color:${m.color}">${esc(m.label)}</h2>
              <p class="mt-2 text-sm leading-relaxed text-mist">${esc(r.reasoning)}</p>
              <p class="mt-2 text-xs text-mist/70">${esc(m.sla)}</p>
            </div>

            ${
              r.overlays.length
                ? `<div class="mt-4 grid gap-3 sm:grid-cols-${r.overlays.length}">
                     ${r.overlays
                       .map((o) =>
                         o === 'genai'
                           ? `<div class="rounded-2xl border border-violet-400/30 bg-violet-400/[0.07] p-4">
                                <p class="text-xs font-semibold uppercase tracking-wide text-violet-300">Generative overlay</p>
                                <p class="mt-1.5 text-xs leading-relaxed text-mist">Grounding, confabulation thresholds, prompt-injection defence, content provenance, IP exposure, and treating vendor model updates as material change.</p>
                              </div>`
                           : `<div class="rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.07] p-4">
                                <p class="text-xs font-semibold uppercase tracking-wide text-cyan-300">Agentic overlay</p>
                                <p class="mt-1.5 text-xs leading-relaxed text-mist">Classify autonomy first. Then agent identity, whitelisted tools, bounded memory, transaction limits, blast-radius containment and a tested kill-switch.</p>
                              </div>`
                       )
                       .join('')}
                   </div>`
                : ''
            }

            <h3 class="mt-8 text-xs font-semibold uppercase tracking-wide text-cyan-400">Rules that fired</h3>
            <ul class="mt-3 space-y-1.5">
              ${r.firedRules
                .map(
                  (f) => `<li class="text-sm text-mist"><span class="font-mono text-xs text-white">Rule ${f.order}</span> — ${esc(f.name)}</li>`
                )
                .join('')}
            </ul>

            <h3 class="mt-8 text-xs font-semibold uppercase tracking-wide text-cyan-400">Obligations that attach</h3>
            <p class="mt-1 text-xs text-mist/70">Not a risk score — the things you are actually required to produce.</p>
            <div class="mt-3 space-y-2.5">
              ${r.obligations
                .map(
                  (o) => `
                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p class="font-display text-sm font-semibold text-white">${esc(o.name)}</p>
                  <p class="mt-1.5 text-xs leading-relaxed text-mist"><span class="text-white">Applies —</span> ${esc(o.applies)}</p>
                  <p class="mt-1 text-xs leading-relaxed text-mist"><span class="text-white">Produce —</span> ${esc(o.produce)}</p>
                  <p class="mt-1.5 text-[11px] text-mist/60">${esc(o.anchor)}</p>
                </div>`
                )
                .join('')}
            </div>

            ${
              r.modules.length
                ? `<h3 class="mt-8 text-xs font-semibold uppercase tracking-wide text-cyan-400">Assessment modules that apply</h3>
                   <div class="mt-3 grid gap-2.5 sm:grid-cols-2">
                     ${r.modules
                       .map(
                         (x) => `
                       <div class="rounded-xl border border-white/10 p-3.5">
                         <p class="text-sm font-medium text-white">${esc(x.name)}</p>
                         <p class="mt-1 text-xs leading-relaxed text-mist">${esc(x.scope)}</p>
                         <p class="mt-1.5 text-[11px] text-mist/60">${esc(x.reviewer)}</p>
                       </div>`
                       )
                       .join('')}
                   </div>`
                : ''
            }

            <h3 class="mt-8 text-xs font-semibold uppercase tracking-wide text-cyan-400">Name these before you proceed</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              ${r.ownersRequired
                .map((o) => `<span class="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white">${esc(o)}</span>`)
                .join('')}
            </div>
            <p class="mt-2 text-xs text-mist/70">Individuals, not teams. Risk accepted by a committee is risk accepted by nobody.</p>

            <div class="no-print mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <button data-action="copy" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90">Copy the classification</button>
              <button data-action="export" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Download</button>
              <button data-action="print" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Print / PDF</button>
              <a href="/ai-governance/framework/" class="text-sm text-mist underline decoration-dotted transition hover:text-white">Read the operating model</a>
            </div>
            <p class="mt-4 text-[11px] leading-relaxed text-mist/60">
              Indicative guidance to structure a submission, never a legal determination. Obligations are described by
              category — verify current effective dates against the Official Journal before relying on them.
            </p>
          </div>
        </div>
      </section>`;
  }

  function rulesPanel() {
    if (stage !== 'start') return '';
    return `
      <section class="mx-auto max-w-4xl px-6 pb-12">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">The published rules</h2>
        <p class="mt-2 text-sm text-mist">Evaluated in order. The first that matches decides the route.</p>
        <ol class="mt-4 space-y-2.5">
          ${TRIAGE_RULES.map(
            (r) => `
            <li class="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p class="text-sm font-semibold text-white"><span class="font-mono text-xs text-cyan-400">Rule ${r.order}</span> · ${esc(r.name)}</p>
              <p class="mt-1 text-xs leading-relaxed text-mist"><span class="text-white">If</span> ${esc(r.condition)}</p>
              <p class="mt-1 text-xs leading-relaxed text-mist"><span class="text-white">Then</span> ${esc(r.result)}</p>
            </li>`
          ).join('')}
        </ol>

        <h2 class="mt-12 font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Autonomy levels</h2>
        <p class="mt-2 text-sm text-mist">For agentic systems this is the first classification, because it determines every other control.</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          ${AUTONOMY_LEVELS.map(
            (a) => `
            <div class="rounded-2xl border border-white/10 p-4">
              <p class="font-display text-sm font-semibold text-white">${esc(a.level)}</p>
              <p class="mt-1 text-xs text-mist">${esc(a.meaning)}</p>
              <p class="mt-1.5 text-xs leading-relaxed text-mist/70">${esc(a.governance)}</p>
            </div>`
          ).join('')}
        </div>
        <p class="mt-4 text-xs text-mist/70">
          ${AGENTIC_CONTROLS.length} agentic controls and ${GENAI_RISKS.length} generative risk categories are set out in the
          <a href="/ai-governance/framework/" class="underline decoration-dotted hover:text-white">operating model</a>.
        </p>
      </section>`;
  }

  /* --------------------------------------------------------------- render */

  function render() {
    const body = stage === 'start' ? startView() : stage === 'result' ? resultView() : questionView(stage as number);
    root!.innerHTML = `${body}${rulesPanel()}${
      toast ? `<div class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xl">${esc(toast)}</div>` : ''
    }`;
    bind();
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
      case 'begin': {
        const input = document.getElementById('ai-name') as HTMLInputElement | null;
        if (input) name = input.value;
        stage = 0;
        render();
        break;
      }
      case 'answer':
        answers[el.dataset.id as DimensionId] = el.dataset.value!;
        render();
        break;
      case 'next': {
        const i = stage as number;
        if (i === DIMENSIONS.length - 1) {
          reference = newRef();
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
          () => flash('Classification copied'),
          () => flash('Copy failed — your browser blocked clipboard access')
        );
        break;
      case 'export':
        download(`ai-classification-${reference.toLowerCase()}.txt`, summaryText(), 'text/plain;charset=utf-8');
        flash('Classification downloaded');
        break;
      case 'print':
        window.print();
        break;
    }
  }

  render();
}
