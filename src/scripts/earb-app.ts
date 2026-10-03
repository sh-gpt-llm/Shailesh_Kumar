import { INDUSTRIES } from '../data/radar/industries';
import { RINGS } from '../data/radar/types';
import { routeFor as radarRoute } from '../data/radar/routes';
import {
  ASK_TYPES,
  ROUTES,
  OUTCOMES,
  TRIAGE_TESTS,
  EARB_PURPOSE,
} from '../data/earb/model';
import type { AskId } from '../data/earb/model';
import {
  newSubmission,
  criteriaFor,
  routeFor,
  readiness,
  likelyOutcome,
  boardQuestions,
  paperOutline,
  TRIAGE_SCALES,
} from './earb/engine';
import type { Submission, Answer, TriageKey, RadarFlag } from './earb/engine';
import { termMatchScored, NAME_HIT } from './nexa/match';
import { download } from './radar/export';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const CATALOGUE = [
  ...new Map(
    INDUSTRIES.flatMap((i) =>
      i.technologies.map(
        (t) =>
          [
            t.name,
            { name: t.name, summary: t.summary, tags: t.tags, ring: t.ring, url: radarRoute(i.slug, t.name) },
          ] as const
      )
    )
  ).values(),
];

const ringLabel = (id: string) => RINGS.find((r) => r.id === id)?.label ?? id;

type Step = 'intake' | 'triage' | 'readiness' | 'verdict';

export function initEarbApp() {
  const root = document.getElementById('earb-app');
  if (!root) return;

  let s: Submission = newSubmission();
  let step: Step = 'intake';
  let techQuery = '';
  let toast = '';

  function flash(message: string) {
    toast = message;
    render();
    setTimeout(() => {
      toast = '';
      render();
    }, 2200);
  }

  function radarFlags(): RadarFlag[] {
    return s.technologies.map((name) => {
      const hit = termMatchScored(name, CATALOGUE, 1)[0];
      const match = hit && hit.score >= NAME_HIT ? hit.item : null;
      if (!match) {
        return {
          name,
          ring: 'not on the radar',
          severity: 'caution' as const,
          note: 'Not assessed on the radar. Expect to be asked what evidence supports it.',
          url: '/radar/',
        };
      }
      if (match.ring === 'hold') {
        return {
          name: match.name,
          ring: ringLabel(match.ring),
          severity: 'challenge' as const,
          note: 'On Hold. Expect a direct challenge, and prepare the case for why this instance is different.',
          url: match.url,
        };
      }
      if (match.ring === 'assess') {
        return {
          name: match.name,
          ring: ringLabel(match.ring),
          severity: 'caution' as const,
          note: 'Assess ring — worth understanding, not yet proven. Expect questions about reversibility and exit.',
          url: match.url,
        };
      }
      return {
        name: match.name,
        ring: ringLabel(match.ring),
        severity: 'clear' as const,
        note: 'Established position on the radar. Unlikely to be contested on principle.',
        url: match.url,
      };
    });
  }

  /* --------------------------------------------------------------- pieces */

  function stepper() {
    const steps: { id: Step; label: string }[] = [
      { id: 'intake', label: 'The item' },
      { id: 'triage', label: 'Does it belong here' },
      { id: 'readiness', label: 'Is it ready' },
      { id: 'verdict', label: 'The read' },
    ];
    const current = steps.findIndex((x) => x.id === step);
    return `
      <section class="no-print mx-auto max-w-4xl px-6 pb-6">
        <ol class="flex flex-wrap items-center gap-2">
          ${steps
            .map(
              (x, i) => `
            <li>
              <button ${i <= current ? `data-action="goto" data-step="${x.id}"` : 'disabled'}
                class="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  i === current
                    ? 'border-transparent bg-white text-ink'
                    : i < current
                      ? 'border-white/20 text-white hover:bg-white/10'
                      : 'border-white/10 text-mist/50'
                }"><span class="font-mono">${i + 1}</span>${esc(x.label)}</button>
            </li>
            ${i < steps.length - 1 ? '<li class="text-mist/30">—</li>' : ''}`
            )
            .join('')}
        </ol>
      </section>`;
  }

  function intakeStep() {
    const suggestions = (() => {
      const q = techQuery.trim();
      if (!q) return [];
      return termMatchScored(q, CATALOGUE, 5)
        .map((r) => r.item)
        .filter((c) => !s.technologies.includes(c.name));
    })();

    return `
      <section class="mx-auto max-w-3xl px-6 pb-10">
        <div class="glass glow-border rounded-3xl p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Step 1 · The item</p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">What are you bringing, and what do you want?</h2>
          <p class="mt-3 text-sm leading-relaxed text-mist">
            Most board time is lost working out what is actually being asked. Stating it here is the cheapest
            improvement you can make to any submission.
          </p>

          <label class="mt-6 block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="earb-title">Title</label>
          <input id="earb-title" type="text" value="${esc(s.title)}" autocomplete="off"
            placeholder="e.g. Consolidate three claims portals onto one platform"
            class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />

          <label class="mt-5 block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="earb-summary">The problem, in business terms</label>
          <textarea id="earb-summary" rows="3"
            placeholder="Describe the problem without naming a product. If you can only describe it through the solution, you have not found the problem yet."
            class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none">${esc(s.summary)}</textarea>

          <p class="mt-6 text-xs font-semibold uppercase tracking-wide text-cyan-400">What are you asking the board for?</p>
          <div class="mt-3 grid gap-2.5 sm:grid-cols-2">
            ${ASK_TYPES.map(
              (a) => `
              <button data-action="set-ask" data-ask="${a.id}"
                class="rounded-2xl border p-4 text-left transition ${
                  s.ask === a.id ? 'border-transparent bg-white text-ink' : 'border-white/10 text-mist hover:bg-white/10'
                }">
                <span class="flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-bold" style="background:${a.color}33;color:${s.ask === a.id ? '#0b0d12' : a.color}">${a.code}</span>
                  <span class="font-display text-sm font-semibold">${esc(a.label)}</span>
                </span>
                <span class="mt-2 block text-xs leading-relaxed ${s.ask === a.id ? 'text-ink/70' : 'text-mist/80'}">${esc(a.meaning)}</span>
              </button>`
            ).join('')}
          </div>

          ${
            s.ask === 'decision' || s.ask === 'consultation'
              ? `<label class="mt-5 block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="earb-question">
                   ${s.ask === 'decision' ? 'The decision, as one answerable question' : 'Where do you want to be challenged?'}
                 </label>
                 <input id="earb-question" type="text" value="${esc(s.question)}" autocomplete="off"
                   placeholder="${s.ask === 'decision' ? 'e.g. May we retire Portal B and migrate its users to Portal A by Q3?' : 'e.g. Is a single platform the right answer, or should we federate?'}"
                   class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />`
              : ''
          }

          <label class="mt-6 block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="earb-tech">Technologies in scope <span class="font-normal normal-case tracking-normal text-mist/60">— optional, checked against the radar</span></label>
          <input id="earb-tech" type="text" value="${esc(techQuery)}" autocomplete="off"
            placeholder="Search the radar, or type your own…"
            class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />
          ${
            suggestions.length
              ? `<div class="mt-2 space-y-1">${suggestions
                  .map(
                    (c) => `<button data-action="tech-add" data-name="${esc(c.name)}" class="block w-full rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10">${esc(c.name)} <span class="text-mist">· ${esc(ringLabel(c.ring))}</span></button>`
                  )
                  .join('')}</div>`
              : techQuery.trim()
                ? `<button data-action="tech-add-custom" class="mt-2 text-xs text-mist underline decoration-dotted hover:text-white">Add “${esc(techQuery.trim())}” — not on the radar</button>`
                : ''
          }
          ${
            s.technologies.length
              ? `<div class="mt-3 flex flex-wrap gap-2">${s.technologies
                  .map(
                    (t) => `<button data-action="tech-remove" data-name="${esc(t)}" class="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/15">${esc(t)} ✕</button>`
                  )
                  .join('')}</div>`
              : ''
          }

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="reset" class="text-sm text-mist transition hover:text-white">Start over</button>
            <button data-action="goto" data-step="triage" class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">Next — does it belong here?</button>
          </div>
        </div>
      </section>`;
  }

  function triageStep() {
    const route = ROUTES.find((r) => r.id === routeFor(s.triage))!;
    return `
      <section class="mx-auto max-w-3xl px-6 pb-10">
        <div class="glass glow-border rounded-3xl p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Step 2 · Does it belong here</p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">Not everything deserves a board</h2>
          <p class="mt-3 text-sm leading-relaxed text-mist">
            Governance effort should be proportionate to the size of the bet. Boards lose credibility by reviewing
            reversible, contained decisions that a delegate should have made.
          </p>

          <div class="mt-6 space-y-5">
            ${TRIAGE_SCALES.map((scale) => {
              const test = TRIAGE_TESTS.find((t) => t.id === scale.id)!;
              return `
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 class="font-display text-base font-semibold text-white">${esc(scale.name)}</h3>
                <p class="mt-1 text-sm text-mist">${esc(test.question)}</p>
                <div class="mt-3 space-y-1">
                  ${scale.options
                    .map(
                      (opt, i) => `
                    <button data-action="set-triage" data-key="${scale.id}" data-value="${i}"
                      class="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-xs transition ${
                        s.triage[scale.id as TriageKey] === i ? 'bg-white font-semibold text-ink' : 'text-mist hover:bg-white/10'
                      }"><span class="font-mono ${s.triage[scale.id as TriageKey] === i ? 'text-ink/60' : 'text-mist/50'}">${i}</span><span>${esc(opt)}</span></button>`
                    )
                    .join('')}
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-mist/60">${esc(test.why)}</p>
              </div>`;
            }).join('')}
          </div>

          <div class="mt-6 rounded-2xl border p-5" style="border-color:${route.color}55;background:${route.color}14">
            <p class="text-xs font-semibold uppercase tracking-wide" style="color:${route.color}">Route</p>
            <p class="mt-2 font-display text-lg font-semibold text-white">${esc(route.label)}</p>
            <p class="mt-1.5 text-sm leading-relaxed text-mist">${esc(route.meaning)}</p>
            <p class="mt-2 text-xs text-mist/70">Service level — ${esc(route.sla)}</p>
          </div>

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="goto" data-step="intake" class="text-sm text-mist transition hover:text-white">Back</button>
            <button data-action="goto" data-step="readiness" class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">Next — is it ready?</button>
          </div>
        </div>
      </section>`;
  }

  function readinessStep() {
    const list = criteriaFor(s.ask);
    const answers: { id: Answer; label: string }[] = [
      { id: 'yes', label: 'Yes' },
      { id: 'partial', label: 'Partly' },
      { id: 'no', label: 'No' },
    ];
    return `
      <section class="mx-auto max-w-3xl px-6 pb-10">
        <div class="glass glow-border rounded-3xl p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Step 3 · Is it ready</p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">Answer honestly — the board will</h2>
          <p class="mt-3 text-sm leading-relaxed text-mist">
            ${list.length} criteria apply to a ${esc(ASK_TYPES.find((a) => a.id === s.ask)!.label.toLowerCase())} item.
            Where you are unsure, answer “No”. A submission that only survives a generous reading will not survive the room.
          </p>

          <div class="mt-6 space-y-4">
            ${list
              .map(
                (c) => `
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <h3 class="font-display text-base font-semibold text-white">${esc(c.name)}</h3>
                    <p class="mt-1 text-sm text-mist">${esc(c.test)}</p>
                  </div>
                  <div class="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                    ${answers
                      .map(
                        (a) => `
                      <button data-action="set-answer" data-id="${c.id}" data-answer="${a.id}"
                        class="rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          (s.answers[c.id] ?? 'no') === a.id ? 'bg-white text-ink' : 'text-mist hover:text-white'
                        }">${a.label}</button>`
                      )
                      .join('')}
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-mist/60">${esc(c.why)}</p>
              </div>`
              )
              .join('')}
          </div>

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="goto" data-step="triage" class="text-sm text-mist transition hover:text-white">Back</button>
            <button data-action="goto" data-step="verdict" class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">See the read</button>
          </div>
        </div>
      </section>`;
  }

  function verdictStep() {
    const route = ROUTES.find((r) => r.id === routeFor(s.triage))!;
    const score = readiness(s);
    const outcome = OUTCOMES.find((o) => o.id === likelyOutcome(s))!;
    const gaps = boardQuestions(s);
    const flags = radarFlags();
    const ask = ASK_TYPES.find((a) => a.id === s.ask)!;
    // The question only belongs to asks that have one; it must not leak across a change of ask type.
    const showQuestion = (s.ask === 'decision' || s.ask === 'consultation') && s.question.trim();

    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft">
          <div class="rounded-3xl p-7 sm:p-9">
            <div class="flex flex-wrap items-start justify-between gap-5">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">The read</p>
                <h2 class="mt-3 font-display text-2xl font-semibold text-white">${esc(s.title || 'Untitled submission')}</h2>
                <p class="mt-2 text-sm text-mist">${esc(ask.code)} · ${esc(ask.label)}${showQuestion ? ` — ${esc(s.question)}` : ''}</p>
              </div>
              <div class="text-right">
                <div class="font-display text-5xl font-bold text-white">${score}<span class="text-xl text-mist">%</span></div>
                <div class="text-xs uppercase tracking-wide text-mist">ready</div>
              </div>
            </div>

            <div class="mt-7 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border p-5" style="border-color:${route.color}55;background:${route.color}14">
                <p class="text-xs font-semibold uppercase tracking-wide" style="color:${route.color}">Route</p>
                <p class="mt-2 font-display text-base font-semibold text-white">${esc(route.label)}</p>
                <p class="mt-1.5 text-xs leading-relaxed text-mist">${esc(route.sla)}</p>
              </div>
              <div class="rounded-2xl border p-5" style="border-color:${outcome.color}55;background:${outcome.color}14">
                <p class="text-xs font-semibold uppercase tracking-wide" style="color:${outcome.color}">Likely outcome today</p>
                <p class="mt-2 font-display text-base font-semibold text-white">${esc(outcome.label)}</p>
                <p class="mt-1.5 text-xs leading-relaxed text-mist">${esc(outcome.next)}</p>
              </div>
            </div>

            ${
              gaps.length
                ? `<div class="mt-6">
                     <h3 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-mist">What the board will ask</h3>
                     <p class="mt-1 text-xs text-mist/70">Derived from where you answered “partly” or “no”, heaviest first.</p>
                     <ol class="mt-3 space-y-3">
                       ${gaps
                         .map(
                           (g, i) => `
                         <li class="flex gap-3">
                           <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${g.answer === 'no' ? 'bg-rose-500/30 text-rose-200' : 'bg-amber-500/30 text-amber-200'} text-[10px] font-bold">${i + 1}</span>
                           <span class="text-sm leading-relaxed text-mist">
                             <span class="font-medium text-white">“${esc(g.criterion.challenge)}”</span>
                             <span class="mt-0.5 block text-xs text-mist/70">${esc(g.criterion.name)} — answered ${g.answer === 'no' ? 'no' : 'partly'}</span>
                           </span>
                         </li>`
                         )
                         .join('')}
                     </ol>
                   </div>`
                : `<p class="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-sm text-mist">Every criterion answered yes. If that is genuinely true, this is a well-prepared submission — bring it.</p>`
            }

            ${
              flags.length
                ? `<div class="mt-6">
                     <h3 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-mist">Technology positions</h3>
                     <p class="mt-1 text-xs text-mist/70">Checked against the Emerging Technology &amp; Innovation Radar.</p>
                     <ul class="mt-3 space-y-2">
                       ${flags
                         .map((f) => {
                           const c = f.severity === 'challenge' ? '#f43f5e' : f.severity === 'caution' ? '#f59e0b' : '#34d399';
                           return `
                         <li class="rounded-xl border border-white/10 p-3.5">
                           <p class="text-sm font-medium text-white">
                             <a href="${esc(f.url)}" target="_blank" rel="noopener" class="underline decoration-dotted">${esc(f.name)}</a>
                             <span class="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold" style="background:${c}26;color:${c}">${esc(f.ring)}</span>
                           </p>
                           <p class="mt-1 text-xs leading-relaxed text-mist">${esc(f.note)}</p>
                         </li>`;
                         })
                         .join('')}
                     </ul>
                   </div>`
                : ''
            }

            <div class="no-print mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <button data-action="goto" data-step="readiness" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Adjust the answers</button>
              <button data-action="export-paper" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90">Download the paper outline</button>
              <button data-action="copy-paper" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Copy as Markdown</button>
              <button data-action="print" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Print / PDF</button>
              <button data-action="reset" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">New item</button>
            </div>
            <p class="mt-4 text-[11px] leading-relaxed text-mist/60">
              A rehearsal, not a ruling. Scored against the
              <a href="/earb/framework/" class="underline decoration-dotted hover:text-white">published EARB operating model</a>.
              Nothing you type here leaves your browser.
            </p>
          </div>
        </div>
      </section>`;
  }

  function purposeStrip() {
    if (step !== 'intake') return '';
    return `
      <section class="no-print mx-auto max-w-4xl px-6 pb-8">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-300">A board is</p>
            <ul class="mt-2 space-y-1.5">${EARB_PURPOSE.is.map((x) => `<li class="text-xs leading-relaxed text-mist">${esc(x)}</li>`).join('')}</ul>
          </div>
          <div class="rounded-2xl border border-rose-400/20 bg-rose-400/[0.04] p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-rose-300">A board is not</p>
            <ul class="mt-2 space-y-1.5">${EARB_PURPOSE.isNot.map((x) => `<li class="text-xs leading-relaxed text-mist">${esc(x)}</li>`).join('')}</ul>
          </div>
        </div>
      </section>`;
  }

  /* --------------------------------------------------------------- render */

  function render() {
    const body =
      step === 'intake' ? intakeStep() : step === 'triage' ? triageStep() : step === 'readiness' ? readinessStep() : verdictStep();

    root!.innerHTML = `
      ${stepper()}
      ${body}
      ${purposeStrip()}
      ${toast ? `<div class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xl">${esc(toast)}</div>` : ''}`;
    bind();
  }

  function capture() {
    const t = document.getElementById('earb-title') as HTMLInputElement | null;
    const u = document.getElementById('earb-summary') as HTMLTextAreaElement | null;
    const q = document.getElementById('earb-question') as HTMLInputElement | null;
    if (t) s.title = t.value;
    if (u) s.summary = u.value;
    if (q) s.question = q.value;
  }

  function bind() {
    root!.querySelectorAll<HTMLElement>('[data-action]').forEach((el) =>
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        handle(el.dataset.action!, el);
      })
    );
    const tech = document.getElementById('earb-tech') as HTMLInputElement | null;
    if (tech) {
      tech.addEventListener('input', () => {
        capture();
        techQuery = tech.value;
        render();
        const next = document.getElementById('earb-tech') as HTMLInputElement | null;
        next?.focus();
        next?.setSelectionRange(next.value.length, next.value.length);
      });
    }
  }

  function currentPaper() {
    return paperOutline(s, routeFor(s.triage), likelyOutcome(s));
  }

  function handle(action: string, el: HTMLElement) {
    switch (action) {
      case 'goto':
        capture();
        step = el.dataset.step as Step;
        render();
        break;
      case 'set-ask':
        capture();
        s.ask = el.dataset.ask as AskId;
        render();
        break;
      case 'set-triage':
        s.triage[el.dataset.key as TriageKey] = Number(el.dataset.value);
        render();
        break;
      case 'set-answer':
        s.answers[el.dataset.id!] = el.dataset.answer as Answer;
        render();
        break;
      case 'tech-add':
        capture();
        if (!s.technologies.includes(el.dataset.name!)) s.technologies.push(el.dataset.name!);
        techQuery = '';
        render();
        break;
      case 'tech-add-custom':
        capture();
        if (techQuery.trim() && !s.technologies.includes(techQuery.trim())) s.technologies.push(techQuery.trim());
        techQuery = '';
        render();
        break;
      case 'tech-remove':
        capture();
        s.technologies = s.technologies.filter((t) => t !== el.dataset.name);
        render();
        break;
      case 'reset':
        s = newSubmission();
        step = 'intake';
        techQuery = '';
        render();
        break;
      case 'export-paper':
        download(`earb-${(s.title || 'submission').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.md`, currentPaper(), 'text/markdown;charset=utf-8');
        flash('Paper outline downloaded');
        break;
      case 'copy-paper':
        navigator.clipboard?.writeText(currentPaper()).then(
          () => flash('Paper outline copied as Markdown'),
          () => flash('Copy failed — your browser blocked clipboard access')
        );
        break;
      case 'print':
        window.print();
        break;
    }
  }

  render();
}
