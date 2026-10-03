import { ACCOUNTABILITY_CHECKS, ACCOUNTABILITY_BANDS, CHECK_VALUE } from '../data/ai-governance/assessments';
import type { CheckAnswer } from '../data/ai-governance/assessments';
import { download } from './radar/export';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const GROUPS = ['Named owners', 'Authority', 'Evidence', 'Third parties'] as const;

export function initAiAccountability() {
  const root = document.getElementById('ai-accountability');
  if (!root) return;

  let system = '';
  let answers: Record<string, CheckAnswer> = {};
  let toast = '';

  const score = () => {
    const max = ACCOUNTABILITY_CHECKS.reduce((n, c) => n + c.weight, 0);
    const got = ACCOUNTABILITY_CHECKS.reduce((n, c) => n + c.weight * CHECK_VALUE[answers[c.id] ?? 'no'], 0);
    return Math.round((got / max) * 100);
  };

  const band = () => {
    const b = ACCOUNTABILITY_BANDS.find((x) => score() >= x.min)!;
    // "Absent" means nobody can say who is accountable. If all four owners are
    // named that is untrue however weak everything else is.
    if (b.label === 'Absent' && namedOwners() === 4) return ACCOUNTABILITY_BANDS.find((x) => x.label === 'Thin')!;
    return b;
  };
  const gaps = () =>
    ACCOUNTABILITY_CHECKS.filter((c) => (answers[c.id] ?? 'no') !== 'yes').sort((a, b) => b.weight - a.weight);
  const namedOwners = () =>
    ACCOUNTABILITY_CHECKS.filter((c) => c.group === 'Named owners' && answers[c.id] === 'yes').length;


  function flash(message: string) {
    toast = message;
    render();
    setTimeout(() => {
      toast = '';
      render();
    }, 2000);
  }

  function summaryText() {
    const b = band();
    return [
      'AI ACCOUNTABILITY CHECK',
      system ? `System: ${system}` : '',
      `Date: ${new Date().toISOString().slice(0, 10)}`,
      '',
      `SCORE: ${score()}% — ${b.label}`,
      b.meaning,
      `Sixty-second test: ${namedOwners()} of 4 owner roles named.`,
      '',
      'ANSWERS',
      ...ACCOUNTABILITY_CHECKS.map((c) => `- [${(answers[c.id] ?? 'no').toUpperCase()}] ${c.question}`),
      '',
      'GAPS, HEAVIEST FIRST',
      ...gaps().flatMap((c) => [`- ${c.question}`, `    Why it matters: ${c.gap}`, `    Fix: ${c.fix}`]),
      '',
      'Assessed against the published operating model at https://vantessence.com/ai-governance/framework/',
    ]
      .filter((l) => l !== '')
      .join('\n');
  }

  function render() {
    const b = band();
    const g = gaps();
    const answersUi: { id: CheckAnswer; label: string }[] = [
      { id: 'yes', label: 'Yes' },
      { id: 'partial', label: 'Partly' },
      { id: 'no', label: 'No' },
    ];

    root!.innerHTML = `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft p-7 sm:p-9">
          <div class="flex flex-wrap items-start justify-between gap-5">
            <div class="min-w-0 flex-1">
              <label class="block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="acc-system">System or service <span class="font-normal normal-case tracking-normal text-mist/60">— optional</span></label>
              <input id="acc-system" type="text" value="${esc(system)}" autocomplete="off" placeholder="e.g. Claims triage assistant"
                class="mt-2 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />
            </div>
            <div class="text-right">
              <div class="font-display text-5xl font-bold text-white">${score()}<span class="text-xl text-mist">%</span></div>
              <div class="text-xs font-semibold uppercase tracking-wide" style="color:${b.color}">${esc(b.label)}</div>
            </div>
          </div>

          <div class="mt-5 rounded-2xl border-l-4 p-4" style="border-color:${b.color};background:${b.color}12">
            <p class="text-sm leading-relaxed text-mist">${esc(b.meaning)}</p>
            <p class="mt-2 text-xs text-mist/70">Sixty-second test — <strong class="text-white">${namedOwners()} of 4</strong> owner roles named as individuals.</p>
          </div>

          ${GROUPS.map((group) => {
            const items = ACCOUNTABILITY_CHECKS.filter((c) => c.group === group);
            return `
            <div class="mt-7">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-cyan-400">${esc(group)}</h3>
              <div class="mt-3 space-y-2.5">
                ${items
                  .map(
                    (c) => `
                  <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-white">${esc(c.question)}</p>
                        <p class="mt-1 text-xs leading-relaxed text-mist">${esc(c.hint)}</p>
                      </div>
                      <div class="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                        ${answersUi
                          .map(
                            (a) => `
                          <button data-action="set" data-id="${c.id}" data-answer="${a.id}"
                            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              (answers[c.id] ?? 'no') === a.id ? 'bg-gradient-to-r from-violet-500 to-cyan-400 text-ink' : 'text-mist hover:text-white'
                            }">${a.label}</button>`
                          )
                          .join('')}
                      </div>
                    </div>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>`;
          }).join('')}

          <div class="mt-8 border-t border-white/10 pt-6">
            <h3 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-mist">What to fix, heaviest first</h3>
            ${
              g.length
                ? `<ol class="mt-4 space-y-3">
                     ${g
                       .map(
                         (c, i) => `
                       <li class="flex gap-3">
                         <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${(answers[c.id] ?? 'no') === 'no' ? 'bg-rose-500/30 text-rose-200' : 'bg-amber-500/30 text-amber-200'} text-[10px] font-bold">${i + 1}</span>
                         <span class="text-sm leading-relaxed text-mist">
                           <span class="block font-medium text-white">${esc(c.gap)}</span>
                           <span class="mt-0.5 block text-xs">${esc(c.fix)}</span>
                         </span>
                       </li>`
                       )
                       .join('')}
                   </ol>`
                : `<p class="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-sm text-mist">Every check answered yes. If that is genuinely true for this system, it is in better shape than most — keep the attestations current and re-run after any change of owner.</p>`
            }
          </div>

          <div class="no-print mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            <button data-action="copy" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90">Copy the result</button>
            <button data-action="export" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Download</button>
            <button data-action="print" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Print / PDF</button>
            <button data-action="reset" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Reset</button>
          </div>
          <p class="mt-4 text-[11px] leading-relaxed text-mist/60">Nothing you enter leaves your browser. Assessed against the <a href="/ai-governance/framework/" class="underline decoration-dotted hover:text-white">published operating model</a>.</p>
        </div>
      </section>
      ${toast ? `<div class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xl">${esc(toast)}</div>` : ''}`;

    bind();
  }

  function bind() {
    root!.querySelectorAll<HTMLElement>('[data-action]').forEach((el) =>
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        handle(el.dataset.action!, el);
      })
    );
    const input = document.getElementById('acc-system') as HTMLInputElement | null;
    input?.addEventListener('input', () => {
      system = input.value;
    });
  }

  function handle(action: string, el: HTMLElement) {
    const input = document.getElementById('acc-system') as HTMLInputElement | null;
    if (input) system = input.value;

    switch (action) {
      case 'set':
        answers[el.dataset.id!] = el.dataset.answer as CheckAnswer;
        render();
        break;
      case 'reset':
        answers = {};
        system = '';
        render();
        break;
      case 'copy':
        navigator.clipboard?.writeText(summaryText()).then(
          () => flash('Result copied'),
          () => flash('Copy failed — your browser blocked clipboard access')
        );
        break;
      case 'export':
        download(`ai-accountability-${new Date().toISOString().slice(0, 10)}.txt`, summaryText(), 'text/plain;charset=utf-8');
        flash('Result downloaded');
        break;
      case 'print':
        window.print();
        break;
    }
  }

  render();
}
