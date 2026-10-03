import { CONTROL_THEMES } from '../data/ai-governance/model';
import { RAI_LEVELS, RAI_BANDS } from '../data/ai-governance/assessments';
import { download } from './radar/export';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const MAX = 4;

export function initAiResponsible() {
  const root = document.getElementById('ai-responsible');
  if (!root) return;

  let scores: Record<string, number> = {};
  let toast = '';

  const valueFor = (id: string) => scores[id] ?? 0;
  const overall = () => Math.round((CONTROL_THEMES.reduce((n, t) => n + valueFor(t.id), 0) / (CONTROL_THEMES.length * MAX)) * 100);
  const band = () => RAI_BANDS.find((b) => overall() >= b.min)!;
  const weakest = () => [...CONTROL_THEMES].sort((a, b) => valueFor(a.id) - valueFor(b.id)).slice(0, 3);

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
      'RESPONSIBLE AI CONTROL ASSESSMENT',
      `Date: ${new Date().toISOString().slice(0, 10)}`,
      '',
      `OVERALL: ${overall()}% — Level ${b.level}, ${b.label}`,
      b.meaning,
      '',
      'BY THEME',
      ...CONTROL_THEMES.map((t) => {
        const lvl = RAI_LEVELS.find((l) => l.value === valueFor(t.id))!;
        return `- ${t.name}: ${lvl.label} (${valueFor(t.id)}/${MAX})`;
      }),
      '',
      'WEAKEST THREE — START HERE',
      ...weakest().flatMap((t) => [
        `# ${t.name}`,
        `  Intent: ${t.intent}`,
        ...t.controls.map((c) => `  - ${c}`),
        `  Anchors: ${t.anchors.join('; ')}`,
        '',
      ]),
      'Assessed against the published operating model at https://vantessence.com/ai-governance/framework/',
    ]
      .filter((l) => l !== undefined)
      .join('\n');
  }

  function render() {
    const b = band();

    root!.innerHTML = `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft p-7 sm:p-9">
          <div class="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Control coverage</p>
              <p class="mt-2 max-w-md text-sm leading-relaxed text-mist">
                Score each theme as it genuinely operates today, not as the policy describes it.
              </p>
            </div>
            <div class="text-right">
              <div class="font-display text-5xl font-bold text-white">${overall()}<span class="text-xl text-mist">%</span></div>
              <div class="text-xs font-semibold uppercase tracking-wide" style="color:${b.color}">Level ${b.level} · ${esc(b.label)}</div>
            </div>
          </div>

          <div class="mt-5 rounded-2xl border-l-4 p-4" style="border-color:${b.color};background:${b.color}12">
            <p class="text-sm leading-relaxed text-mist">${esc(b.meaning)}</p>
          </div>

          <div class="mt-7 space-y-3">
            ${CONTROL_THEMES.map((t, i) => {
              const v = valueFor(t.id);
              const lvl = RAI_LEVELS.find((l) => l.value === v)!;
              return `
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 class="font-display text-base font-semibold text-white">
                    <span class="mr-2 font-mono text-xs text-cyan-400">${String(i + 1).padStart(2, '0')}</span>${esc(t.name)}
                  </h3>
                  <span class="text-xs text-mist">${esc(lvl.label)} · ${v}/${MAX}</span>
                </div>
                <p class="mt-1.5 text-xs leading-relaxed text-mist">${esc(t.intent)}</p>

                <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style="width:${(v / MAX) * 100}%"></div>
                </div>

                <div class="mt-3 flex flex-wrap gap-1">
                  ${RAI_LEVELS.map(
                    (l) => `
                    <button data-action="set" data-id="${t.id}" data-value="${l.value}" title="${esc(l.meaning)}"
                      class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        v === l.value ? 'bg-white/[0.1] text-white ring-1 ring-white/20' : 'text-mist hover:bg-white/10 hover:text-white'
                      }">${esc(l.label)}</button>`
                  ).join('')}
                </div>
              </div>`;
            }).join('')}
          </div>

          <div class="mt-8 border-t border-white/10 pt-6">
            <h3 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-mist">Start with these three</h3>
            <p class="mt-1 text-xs text-mist/70">Your weakest themes, with the specific controls that close them.</p>
            <div class="mt-4 space-y-4">
              ${weakest()
                .map(
                  (t) => `
                <div class="rounded-2xl border border-amber-400/25 bg-amber-400/[0.04] p-5">
                  <p class="font-display text-base font-semibold text-white">${esc(t.name)}</p>
                  <ul class="mt-2.5 space-y-1.5">
                    ${t.controls.map((c) => `<li class="text-xs leading-relaxed text-mist">— ${esc(c)}</li>`).join('')}
                  </ul>
                  <div class="mt-3 flex flex-wrap gap-1.5">
                    ${t.anchors.map((a) => `<span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-mist">${esc(a)}</span>`).join('')}
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="no-print mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            <button data-action="copy" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90">Copy the assessment</button>
            <button data-action="export" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Download</button>
            <button data-action="print" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Print / PDF</button>
            <button data-action="reset" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Reset</button>
          </div>
          <p class="mt-4 text-[11px] leading-relaxed text-mist/60">Nothing you enter leaves your browser. Themes and anchors come from the <a href="/ai-governance/framework/" class="underline decoration-dotted hover:text-white">published operating model</a>.</p>
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
  }

  function handle(action: string, el: HTMLElement) {
    switch (action) {
      case 'set':
        scores[el.dataset.id!] = Number(el.dataset.value);
        render();
        break;
      case 'reset':
        scores = {};
        render();
        break;
      case 'copy':
        navigator.clipboard?.writeText(summaryText()).then(
          () => flash('Assessment copied'),
          () => flash('Copy failed — your browser blocked clipboard access')
        );
        break;
      case 'export':
        download(`responsible-ai-assessment-${new Date().toISOString().slice(0, 10)}.txt`, summaryText(), 'text/plain;charset=utf-8');
        flash('Assessment downloaded');
        break;
      case 'print':
        window.print();
        break;
    }
  }

  render();
}
