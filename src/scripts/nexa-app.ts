import { INDUSTRIES } from '../data/radar/industries';
import { DIMENSIONS, ASKS, VERDICTS, ROUTES, VENDOR_QUESTIONS, verdictById } from '../data/nexa/framework';
import type { AskId, DimensionId } from '../data/nexa/framework';
import { assess } from './nexa/engine';
import type { Assessment } from './nexa/engine';
import { loadAll, saveAll, newAssessment, encodeAssessment, decodeAssessment, toCsv, toJson } from './nexa/store';
import { fuzzySearch } from './radar/fuzzy';
import { termMatch, termMatchScored, NAME_HIT } from './nexa/match';
import { suggestFrom, PREFILLABLE } from './nexa/prefill';
import type { RadarMatch } from './nexa/prefill';
import { routeFor } from '../data/radar/routes';
import { download } from './radar/export';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

// One flat catalogue of every technology on the radar, used as the estate picker's
// vocabulary and as the source for score prefill. Names recur across industries,
// so it is deduplicated by name.
const CATALOGUE: RadarMatch[] = [
  ...new Map(
    INDUSTRIES.flatMap((i) =>
      i.technologies.map(
        (t) =>
          [
            t.name,
            {
              name: t.name,
              summary: t.summary,
              tags: t.tags,
              ring: t.ring,
              momentum: t.momentum,
              timeHorizon: t.timeHorizon,
              evidence: t.evidence ?? [],
              url: routeFor(i.slug, t.name),
              industry: i.name,
            },
          ] as const
      )
    )
  ).values(),
];

type Step = 'path' | 'subject' | 'estate' | 'score' | 'verdict';

export function initNexaApp() {
  const root = document.getElementById('nexa-app');
  if (!root) return;

  let saved: Assessment[] = loadAll();
  let draft: Assessment | null = null;
  let step: Step = 'path';
  let showSaved = false;
  let estateQuery = '';
  let prefillDismissed = false;
  let prefillApplied = false;
  let toast = '';

  const shared = new URLSearchParams(window.location.search).get('a');
  if (shared) {
    const decoded = decodeAssessment(shared);
    if (decoded) {
      draft = decoded;
      step = 'verdict';
    }
  }

  function flash(message: string) {
    toast = message;
    render();
    setTimeout(() => {
      toast = '';
      render();
    }, 2200);
  }

  function persist() {
    saveAll(saved);
  }

  /* ------------------------------------------------------------ fragments */

  function pathChooser() {
    const cards = [
      {
        id: 'vendor',
        kicker: 'Start from a vendor',
        title: 'Assess something specific',
        body: 'Someone has put a product, a start-up or a pitch in front of you. Work out whether it is genuinely new, whether you already run something that does the job, and whether it earns a trial.',
        cta: 'Assess a vendor',
      },
      {
        id: 'gap',
        kicker: 'Start from a problem',
        title: 'Describe a gap',
        body: 'You have an unmet need and no vendor in mind. Check what you already own first, then find out whether the honest answer is adopt, extend, or go and look outside.',
        cta: 'Describe the gap',
      },
    ];
    return `
      <section class="mx-auto max-w-5xl px-6 pb-8">
        <div class="grid gap-5 md:grid-cols-2">
          ${cards
            .map(
              (c) => `
            <button data-action="choose-path" data-path="${c.id}"
              class="glass glow-border group rounded-3xl p-7 text-left transition hover:bg-white/[0.06]">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">${esc(c.kicker)}</p>
              <h2 class="mt-3 font-display text-2xl font-semibold text-white">${esc(c.title)}</h2>
              <p class="mt-3 text-sm leading-relaxed text-mist">${esc(c.body)}</p>
              <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                ${esc(c.cta)} <span class="transition group-hover:translate-x-1">→</span>
              </span>
            </button>`
            )
            .join('')}
        </div>
        <p class="mt-6 text-center text-xs text-mist">
          Both paths end the same way — a verdict you can defend, with the reasoning and the one thing that would change it.
          <a href="/nexa/framework/" class="ml-1 underline decoration-dotted transition hover:text-white">Read the framework</a>
        </p>
      </section>`;
  }

  function stepper() {
    if (!draft) return '';
    const steps: { id: Step; label: string }[] = [
      { id: 'subject', label: draft.path === 'vendor' ? 'The vendor' : 'The gap' },
      { id: 'estate', label: 'Your estate' },
      { id: 'score', label: 'The scoring' },
      { id: 'verdict', label: 'The verdict' },
    ];
    const current = steps.findIndex((s) => s.id === step);
    return `
      <section class="mx-auto max-w-5xl px-6 pb-6">
        <ol class="flex flex-wrap items-center gap-2">
          ${steps
            .map((s, i) => {
              const done = i < current;
              const now = i === current;
              return `
              <li>
                <button ${i <= current ? `data-action="goto-step" data-step="${s.id}"` : 'disabled'}
                  class="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    now
                      ? 'border-transparent bg-gradient-to-r from-violet-500 to-cyan-400 text-ink shadow-lg shadow-violet-500/20'
                      : done
                        ? 'border-white/20 text-white hover:bg-white/10'
                        : 'border-white/10 text-mist/50'
                  }">
                  <span class="font-mono">${i + 1}</span>${esc(s.label)}
                </button>
              </li>
              ${i < steps.length - 1 ? '<li class="text-mist/30">—</li>' : ''}`;
            })
            .join('')}
        </ol>
      </section>`;
  }

  function subjectStep() {
    const a = draft!;
    const isVendor = a.path === 'vendor';
    return `
      <section class="mx-auto max-w-3xl px-6 pb-10">
        <div class="glass glow-border rounded-3xl p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            Step 1 · ${isVendor ? 'The vendor' : 'The gap'}
          </p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">
            ${isVendor ? 'What are we looking at?' : 'What problem needs solving?'}
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-mist">
            ${
              isVendor
                ? 'Name the product and describe, in one plain sentence, the job it would actually do for you. Not the vendor’s pitch — the job.'
                : 'Describe the need in plain words, as the person with the problem would describe it. Avoid naming a solution; that is what the rest of this works out.'
            }
          </p>

          <label class="mt-6 block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="nexa-subject">
            ${isVendor ? 'Product or vendor name' : 'Give this gap a short name'}
          </label>
          <input id="nexa-subject" type="text" value="${esc(a.subject)}" autocomplete="off"
            placeholder="${isVendor ? 'e.g. Acme Copilot for Claims' : 'e.g. Contract review turnaround'}"
            class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />

          <label class="mt-5 block text-xs font-semibold uppercase tracking-wide text-cyan-400" for="nexa-capability">
            ${isVendor ? 'The job it would do' : 'The problem, in plain words'}
          </label>
          <textarea id="nexa-capability" rows="3"
            placeholder="${isVendor ? 'e.g. Reads inbound claims and drafts a first-pass assessment for a human to approve.' : 'e.g. Legal takes nine days to review standard supplier contracts and the queue is growing.'}"
            class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none">${esc(a.capability)}</textarea>
          <p class="mt-2 text-xs text-mist/70">This text is used to search the radar for things you may already own. It never leaves your browser.</p>

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="abandon" class="text-sm text-mist transition hover:text-white">Start over</button>
            <button data-action="goto-step" data-step="estate"
              class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">
              Next — your estate
            </button>
          </div>
        </div>
      </section>`;
  }

  function estateSuggestions() {
    const a = draft!;
    const typed = estateQuery.trim();
    const derived = `${a.capability} ${a.subject}`.trim();
    const q = typed || derived;
    if (!q) return CATALOGUE.slice(0, 8);

    // Short typed queries suit the subsequence matcher; sentences need term overlap.
    const useFuzzy = typed.length > 0 && typed.length <= 20 && !typed.includes(' ');
    const fuzzy = useFuzzy ? fuzzySearch(typed, CATALOGUE, (c) => [c.name, c.summary, ...c.tags], 8).map((r) => r.item) : [];
    return fuzzy.length ? fuzzy : termMatch(q, CATALOGUE, 8);
  }

  function estateStep() {
    const a = draft!;
    const suggestions = estateSuggestions().filter((c) => !a.estate.includes(c.name));
    return `
      <section class="mx-auto max-w-3xl px-6 pb-10">
        <div class="glass glow-border rounded-3xl p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Step 2 · Your estate</p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">What do you already run that is close to this?</h2>
          <p class="mt-3 text-sm leading-relaxed text-mist">
            This is the question most assessments skip, and it is the one that most often changes the answer. Search the
            ${CATALOGUE.length} technologies on the radar, or type your own. Be generous — "close enough" counts.
          </p>

          <input id="nexa-estate-search" type="text" value="${esc(estateQuery)}" autocomplete="off"
            placeholder="Search capabilities, or type anything you run…"
            class="mt-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist/50 focus:border-violet-400 focus:outline-none" />

          ${
            a.estate.length
              ? `<div class="mt-4 flex flex-wrap gap-2">
                   ${a.estate
                     .map(
                       (name) => `
                     <button data-action="estate-remove" data-name="${esc(name)}"
                       class="group flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/20">
                       ${esc(name)} <span class="text-emerald-200/60 group-hover:text-white">✕</span>
                     </button>`
                     )
                     .join('')}
                 </div>`
              : `<p class="mt-4 rounded-xl border border-dashed border-white/15 px-4 py-3 text-xs text-mist">Nothing declared yet. If you genuinely run nothing in this space, that itself is a finding — carry on.</p>`
          }

          <p class="mt-5 text-xs font-semibold uppercase tracking-wide text-cyan-400">Closest matches on the radar</p>
          <div class="mt-2 space-y-1.5">
            ${
              suggestions.length
                ? suggestions
                    .slice(0, 6)
                    .map(
                      (c) => `
              <button data-action="estate-add" data-name="${esc(c.name)}"
                class="block w-full rounded-xl border border-white/10 px-4 py-2.5 text-left transition hover:bg-white/10">
                <span class="block text-sm font-medium text-white">${esc(c.name)}</span>
                <span class="block truncate text-xs text-mist">${esc(c.summary)}</span>
              </button>`
                    )
                    .join('')
                : `<p class="text-xs text-mist">No radar match. ${
                    estateQuery.trim()
                      ? `<button data-action="estate-add-custom" class="underline decoration-dotted hover:text-white">Add “${esc(estateQuery.trim())}” anyway</button>`
                      : ''
                  }</p>`
            }
            ${
              estateQuery.trim() && suggestions.length
                ? `<button data-action="estate-add-custom" class="mt-1 text-xs text-mist underline decoration-dotted transition hover:text-white">Not listed — add “${esc(estateQuery.trim())}” as my own</button>`
                : ''
            }
          </div>

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="goto-step" data-step="subject" class="text-sm text-mist transition hover:text-white">Back</button>
            <button data-action="goto-step" data-step="score"
              class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">
              Next — the scoring
            </button>
          </div>
        </div>
      </section>`;
  }

  function bestRadarMatch(): RadarMatch | null {
    const a = draft!;
    const q = `${a.capability} ${a.subject}`.trim();
    if (!q) return null;
    // Prefilling asserts "this is that technology", so it needs at least one hit
    // on the name itself. Summary-only collisions are far too loose for a claim.
    const top = termMatchScored(q, CATALOGUE, 1)[0];
    return top && top.score >= NAME_HIT ? top.item : null;
  }

  function prefillCard() {
    if (prefillDismissed) return '';
    const match = bestRadarMatch();
    if (!match) return '';
    const suggestion = suggestFrom(match);
    const untouched = DIMENSIONS.filter((d) => !PREFILLABLE.includes(d.id)).map((d) => d.name.toLowerCase());

    return `
      <div class="no-print mb-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.06] p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-cyan-400">The radar knows this one</p>
            <p class="mt-2 text-sm text-mist">
              This looks like <a href="${esc(match.url)}" target="_blank" rel="noopener" class="font-semibold text-white underline decoration-dotted">${esc(match.name)}</a>,
              placed in <strong class="text-white">${esc(match.ring.toUpperCase())}</strong> on the ${esc(match.industry)} radar.
            </p>
          </div>
          <button data-action="dismiss-prefill" aria-label="Dismiss" class="shrink-0 text-xs text-mist/70 transition hover:text-white">Dismiss</button>
        </div>

        <ul class="mt-4 space-y-2">
          ${suggestion.notes
            .map(
              (n) => `
            <li class="flex gap-3 text-xs leading-relaxed text-mist">
              <span class="mt-0.5 flex h-5 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 font-mono text-[10px] font-bold text-cyan-200">${n.score}/4</span>
              <span><strong class="text-white">${esc(DIMENSIONS.find((d) => d.id === n.dimension)!.name)}</strong> — ${esc(n.reason)}</span>
            </li>`
            )
            .join('')}
        </ul>

        ${
          match.evidence.length
            ? `<div class="mt-3 border-t border-white/10 pt-3">
                 <p class="text-[11px] font-semibold uppercase tracking-wide text-mist/70">Signals behind that placement</p>
                 <ul class="mt-1.5 space-y-1">
                   ${match.evidence.slice(0, 3).map((e) => `<li class="text-[11px] leading-relaxed text-mist/80">— ${esc(e)}</li>`).join('')}
                 </ul>
               </div>`
            : ''
        }

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button data-action="apply-prefill"
            class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90">
            ${prefillApplied ? 'Re-apply these two' : 'Use these as a starting point'}
          </button>
          <p class="text-[11px] leading-relaxed text-mist/70">
            Only ${PREFILLABLE.length} of the ${DIMENSIONS.length} can come from the radar.
            ${esc(untouched.join(', '))} are about your organisation, so they are left for you.
          </p>
        </div>
      </div>`;
  }

  function scoreStep() {
    const a = draft!;
    return `
      <section class="mx-auto max-w-3xl px-6 pb-10">
        <div class="glass glow-border rounded-3xl p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Step 3 · The scoring</p>
          <h2 class="mt-3 font-display text-2xl font-semibold text-white">Six judgements, made explicit</h2>
          <p class="mt-3 text-sm leading-relaxed text-mist">
            Pick the statement that is closest to true. Where you are unsure, pick the less flattering option — an
            assessment that cannot survive a pessimistic reading will not survive a steering committee either.
          </p>

          <div class="mt-6">${prefillCard()}</div>

          <div class="space-y-6">
            ${DIMENSIONS.map(
              (d) => `
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div class="flex items-baseline justify-between gap-3">
                  <h3 class="font-display text-base font-semibold text-white">${esc(d.name)}</h3>
                  <span class="font-mono text-xs text-mist">${a.scores[d.id]} / 4</span>
                </div>
                <p class="mt-1 text-sm text-mist">${esc(d.question)}</p>
                <div class="mt-3 space-y-1">
                  ${d.anchors
                    .map(
                      (an) => `
                    <button data-action="set-score" data-dim="${d.id}" data-score="${an.score}"
                      class="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-xs transition ${
                        a.scores[d.id] === an.score ? 'bg-white/[0.07] text-white font-semibold ring-1 ring-white/15' : 'text-mist hover:bg-white/10'
                      }">
                      <span class="font-mono ${a.scores[d.id] === an.score ? 'text-cyan-300' : 'text-mist/50'}">${an.score}</span>
                      <span>${esc(an.label)}</span>
                    </button>`
                    )
                    .join('')}
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-mist/60">${esc(d.why)}</p>
              </div>`
            ).join('')}

            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h3 class="font-display text-base font-semibold text-white">Size of the ask</h3>
              <p class="mt-1 text-sm text-mist">How much are you being asked to commit? This sets the bar the score has to clear — it is not scored itself.</p>
              <div class="mt-3 grid gap-2 sm:grid-cols-2">
                ${ASKS.map(
                  (k) => `
                  <button data-action="set-ask" data-ask="${k.id}"
                    class="rounded-xl border px-4 py-3 text-left transition ${
                      a.ask === k.id ? 'border-transparent bg-white/[0.07] text-white ring-1 ring-white/20' : 'border-white/10 text-mist hover:bg-white/10'
                    }">
                    <span class="block text-sm font-semibold">${esc(k.label)} <span class="font-mono text-xs opacity-60">bar ${k.bar}</span></span>
                    <span class="block text-xs ${a.ask === k.id ? 'text-mist' : 'text-mist/70'}">${esc(k.detail)}</span>
                  </button>`
                ).join('')}
              </div>
            </div>
          </div>

          <div class="mt-7 flex items-center justify-between gap-3">
            <button data-action="goto-step" data-step="estate" class="text-sm text-mist transition hover:text-white">Back</button>
            <button data-action="goto-step" data-step="verdict"
              class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90">
              See the verdict
            </button>
          </div>
        </div>
      </section>`;
  }

  /** Six-axis plot of the dimension scores — the shape is the argument. */
  function hexChart(a: Assessment, color: string) {
    const cx = 160;
    const cy = 125;
    const r = 92;
    const pt = (i: number, mag: number) => {
      const ang = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
      return [cx + Math.cos(ang) * r * mag, cy + Math.sin(ang) * r * mag];
    };
    const grid = [0.25, 0.5, 0.75, 1]
      .map(
        (m) =>
          `<polygon points="${DIMENSIONS.map((_, i) => pt(i, m).map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="1" />`
      )
      .join('');
    const spokes = DIMENSIONS.map((_, i) => {
      const [x, y] = pt(i, 1);
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.1)" />`;
    }).join('');
    const shape = DIMENSIONS.map((d, i) => pt(i, Math.max(0.04, a.scores[d.id] / 4)).map((n) => n.toFixed(1)).join(',')).join(' ');
    const dots = DIMENSIONS.map((d, i) => {
      const [x, y] = pt(i, Math.max(0.04, a.scores[d.id] / 4));
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${color}" />`;
    }).join('');
    const labels = DIMENSIONS.map((d, i) => {
      const [x, y] = pt(i, 1.12);
      const anchor = x > cx + 6 ? 'start' : x < cx - 6 ? 'end' : 'middle';
      return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${anchor}" font-size="9" fill="#9aa4b2">${esc(d.name)}</text>`;
    }).join('');

    return `<svg viewBox="0 0 320 250" class="h-auto w-full max-w-[320px]" role="img" aria-label="Scores across the six NEXA dimensions">
      ${grid}${spokes}
      <polygon points="${shape}" fill="${color}33" stroke="${color}" stroke-width="2" stroke-linejoin="round" />
      ${dots}${labels}
    </svg>`;
  }

  function verdictStep() {
    const a = draft!;
    const r = assess(a);
    const v = verdictById(r.verdict);
    const route = ROUTES.find((x) => x.id === r.route)!;
    const swingDim = r.swing ? DIMENSIONS.find((d) => d.id === r.swing!.dimension)! : null;
    const alreadySaved = saved.some((s) => s.id === a.id);

    return `
      <section class="mx-auto max-w-4xl px-6 pb-10">
        <div class="glow-border rounded-3xl border border-white/15 bg-ink-soft">
          <div class="rounded-3xl p-7 sm:p-9">
            <div class="flex flex-wrap items-start justify-between gap-5">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">The verdict</p>
                <h2 class="mt-3 font-display text-3xl font-semibold" style="color:${v.color}">${esc(v.label)}</h2>
                <p class="mt-2 max-w-xl text-sm text-mist">${esc(a.subject || 'This assessment')}${a.capability ? ` — ${esc(a.capability)}` : ''}</p>
              </div>
              <div class="text-right">
                <div class="font-display text-5xl font-bold text-white">${r.composite}</div>
                <div class="text-xs uppercase tracking-wide text-mist">out of 100 · bar ${r.bar}</div>
              </div>
            </div>

            <div class="mt-7 grid gap-7 lg:grid-cols-[320px_1fr]">
              <div class="justify-self-center">${hexChart(a, v.color)}</div>
              <div>
                <p class="text-sm leading-relaxed text-mist">${esc(r.reasoning)}</p>

                ${
                  swingDim && r.swing
                    ? `<div class="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                         <p class="text-xs font-semibold uppercase tracking-wide text-cyan-400">What would change this</p>
                         <p class="mt-2 text-sm leading-relaxed text-mist">
                           Moving <strong class="text-white">${esc(swingDim.name.toLowerCase())}</strong> from ${r.swing.from} to ${r.swing.to}
                           takes the score to <strong class="text-white">${r.swing.newComposite}</strong>${
                             r.swing.flipsTo
                               ? ` and changes the verdict to <strong style="color:${verdictById(r.swing.flipsTo).color}">${esc(verdictById(r.swing.flipsTo).label.toLowerCase())}</strong>.`
                               : ' without changing the verdict.'
                           }
                           ${r.swing.flipsTo ? 'That is the single question worth answering before you decide.' : 'No single dimension flips this — the case is stable.'}
                         </p>
                       </div>`
                    : ''
                }

                <div class="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Where this points</p>
                  <p class="mt-2 text-sm text-mist"><strong style="color:${route.color}">${esc(route.label)}</strong> — ${esc(route.meaning)}</p>
                </div>

                <div class="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Your next step</p>
                  <p class="mt-2 text-sm text-mist">${esc(v.nextStep)}</p>
                </div>
              </div>
            </div>

            <div class="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-mist">Due diligence, in priority order</h3>
                <p class="mt-1 text-xs text-mist/70">Ordered by where your own scores say the risk sits.</p>
                <ol class="mt-3 space-y-2.5">
                  ${r.diligence
                    .slice(0, 6)
                    .map(
                      (d, i) => `
                    <li class="flex gap-3">
                      <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/30 text-[10px] font-bold text-violet-200">${i + 1}</span>
                      <span class="text-xs leading-relaxed text-mist"><strong class="text-white">${esc(d.name)}</strong> — ${esc(d.prompt)}</span>
                    </li>`
                    )
                    .join('')}
                </ol>
              </div>
              <div>
                <h3 class="font-display text-sm font-semibold uppercase tracking-[0.2em] text-mist">Questions to put to the vendor</h3>
                <p class="mt-1 text-xs text-mist/70">Ask these before the commercial conversation, not after.</p>
                <ul class="mt-3 space-y-2.5">
                  ${VENDOR_QUESTIONS.slice(0, 5)
                    .map(
                      (q) => `
                    <li>
                      <p class="text-xs font-medium leading-relaxed text-white">“${esc(q.q)}”</p>
                      <p class="mt-0.5 text-[11px] leading-relaxed text-mist/70">${esc(q.why)}</p>
                    </li>`
                    )
                    .join('')}
                </ul>
              </div>
            </div>

            <div class="no-print mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <button data-action="goto-step" data-step="score" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Adjust the scoring</button>
              <button data-action="save" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90">${alreadySaved ? 'Update saved' : 'Save this assessment'}</button>
              <button data-action="share" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Copy share link</button>
              <button data-action="print" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">Print / PDF</button>
              <button data-action="abandon" class="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist transition hover:text-white">New assessment</button>
            </div>
            <p class="mt-4 text-[11px] leading-relaxed text-mist/60">
              Directional guidance to focus deeper diligence — never a replacement for it.
              Scored against the <a href="/nexa/framework/" class="underline decoration-dotted hover:text-white">published NEXA framework</a>.
            </p>
          </div>
        </div>
      </section>`;
  }

  function savedPanel() {
    if (!showSaved) return '';
    if (!saved.length) {
      return `
        <section class="mx-auto max-w-5xl px-6 pb-12">
          <div class="rounded-3xl border border-dashed border-white/15 p-8 text-center">
            <p class="text-sm text-mist">No saved assessments yet. Complete one and save it — the value compounds when you can line several up against each other.</p>
          </div>
        </section>`;
    }
    const rows = saved.map((a) => ({ a, r: assess(a) })).sort((x, y) => y.r.composite - x.r.composite);
    return `
      <section class="mx-auto max-w-5xl px-6 pb-12">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-display text-lg font-semibold text-white">Saved assessments <span class="text-mist">${saved.length}</span></h2>
          <div class="no-print flex flex-wrap gap-2">
            <button data-action="export-csv" class="rounded-full border border-white/15 px-3 py-1 text-xs text-mist transition hover:text-white">Download CSV</button>
            <button data-action="export-json" class="rounded-full border border-white/15 px-3 py-1 text-xs text-mist transition hover:text-white">Download JSON</button>
          </div>
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-white/10 text-xs uppercase tracking-wide text-mist">
                <th class="py-2.5 pr-3">Subject</th>
                <th class="py-2.5 pr-3">Score</th>
                <th class="py-2.5 pr-3">Verdict</th>
                ${DIMENSIONS.map((d) => `<th class="py-2.5 pr-2 text-center" title="${esc(d.name)}">${esc(d.name.slice(0, 4))}</th>`).join('')}
                <th class="py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(({ a, r }) => {
                  const v = verdictById(r.verdict);
                  return `
                <tr class="border-b border-white/5">
                  <td class="py-2.5 pr-3">
                    <button data-action="open-saved" data-id="${a.id}" class="text-left font-medium text-white underline decoration-dotted">${esc(a.subject || 'Untitled')}</button>
                    <span class="block text-xs text-mist">${esc(a.created)} · ${a.path === 'vendor' ? 'vendor' : 'gap'}</span>
                  </td>
                  <td class="py-2.5 pr-3 font-mono text-white">${r.composite}<span class="text-xs text-mist">/${r.bar}</span></td>
                  <td class="py-2.5 pr-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" style="background:${v.color}26;color:${v.color}">${esc(v.short)}</span></td>
                  ${DIMENSIONS.map((d) => `<td class="py-2.5 pr-2 text-center font-mono text-xs text-mist">${a.scores[d.id]}</td>`).join('')}
                  <td class="py-2.5 text-right"><button data-action="delete-saved" data-id="${a.id}" aria-label="Delete" class="no-print text-xs text-mist/60 transition hover:text-white">✕</button></td>
                </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  function toolbar() {
    return `
      <section class="no-print mx-auto max-w-5xl px-6 pb-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <button data-action="toggle-saved" class="glass rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${showSaved ? 'text-white' : 'text-mist hover:text-white'}">
              ${showSaved ? 'Hide' : 'Show'} saved <span class="font-mono">${saved.length}</span>
            </button>
            ${draft ? `<button data-action="abandon" class="glass rounded-xl px-3.5 py-1.5 text-xs text-mist transition hover:text-white">New assessment</button>` : ''}
          </div>
          <a href="/nexa/framework/" class="text-xs text-mist underline decoration-dotted transition hover:text-white">How the scoring works</a>
        </div>
      </section>`;
  }

  /* ---------------------------------------------------------------- render */

  function render() {
    const body =
      !draft || step === 'path'
        ? pathChooser()
        : step === 'subject'
          ? subjectStep()
          : step === 'estate'
            ? estateStep()
            : step === 'score'
              ? scoreStep()
              : verdictStep();

    root!.innerHTML = `
      ${toolbar()}
      ${draft && step !== 'path' ? stepper() : ''}
      ${body}
      ${savedPanel()}
      ${toast ? `<div class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xl">${esc(toast)}</div>` : ''}`;
    bind();
  }

  function captureInputs() {
    if (!draft) return;
    const s = document.getElementById('nexa-subject') as HTMLInputElement | null;
    const c = document.getElementById('nexa-capability') as HTMLTextAreaElement | null;
    if (s) draft.subject = s.value;
    if (c) draft.capability = c.value;
  }

  function bind() {
    root!.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        handle(el.dataset.action!, el);
      });
    });

    const search = document.getElementById('nexa-estate-search') as HTMLInputElement | null;
    if (search) {
      search.addEventListener('input', () => {
        estateQuery = search.value;
        render();
        const next = document.getElementById('nexa-estate-search') as HTMLInputElement | null;
        next?.focus();
        next?.setSelectionRange(next.value.length, next.value.length);
      });
    }
  }

  function handle(action: string, el: HTMLElement) {
    switch (action) {
      case 'choose-path':
        draft = newAssessment(el.dataset.path as 'vendor' | 'gap');
        step = 'subject';
        estateQuery = '';
        prefillDismissed = false;
        prefillApplied = false;
        render();
        break;
      case 'goto-step':
        captureInputs();
        step = el.dataset.step as Step;
        render();
        break;
      case 'estate-add': {
        const name = el.dataset.name!;
        if (draft && !draft.estate.includes(name)) draft.estate.push(name);
        estateQuery = '';
        suggestOverlap();
        render();
        break;
      }
      case 'estate-add-custom': {
        const name = estateQuery.trim();
        if (draft && name && !draft.estate.includes(name)) draft.estate.push(name);
        estateQuery = '';
        suggestOverlap();
        render();
        break;
      }
      case 'estate-remove':
        if (draft) draft.estate = draft.estate.filter((n) => n !== el.dataset.name);
        suggestOverlap();
        render();
        break;
      case 'set-score':
        if (draft) draft.scores[el.dataset.dim as DimensionId] = Number(el.dataset.score);
        render();
        break;
      case 'set-ask':
        if (draft) draft.ask = el.dataset.ask as AskId;
        render();
        break;
      case 'apply-prefill': {
        const match = bestRadarMatch();
        if (!draft || !match) break;
        Object.assign(draft.scores, suggestFrom(match).scores);
        prefillApplied = true;
        flash(`Starting scores taken from ${match.name}`);
        break;
      }
      case 'dismiss-prefill':
        prefillDismissed = true;
        render();
        break;
      case 'save': {
        if (!draft) break;
        captureInputs();
        const i = saved.findIndex((s) => s.id === draft!.id);
        if (i >= 0) saved[i] = { ...draft };
        else saved = [{ ...draft }, ...saved];
        persist();
        flash('Assessment saved to this browser');
        break;
      }
      case 'open-saved': {
        const found = saved.find((s) => s.id === el.dataset.id);
        if (found) {
          draft = { ...found, scores: { ...found.scores }, estate: [...found.estate] };
          step = 'verdict';
          showSaved = false;
          render();
        }
        break;
      }
      case 'delete-saved':
        saved = saved.filter((s) => s.id !== el.dataset.id);
        persist();
        flash('Assessment deleted');
        break;
      case 'toggle-saved':
        showSaved = !showSaved;
        render();
        break;
      case 'abandon':
        draft = null;
        step = 'path';
        estateQuery = '';
        prefillDismissed = false;
        prefillApplied = false;
        render();
        break;
      case 'share': {
        if (!draft) break;
        const url = `${window.location.origin}/nexa/?a=${encodeAssessment(draft)}`;
        navigator.clipboard?.writeText(url).then(
          () => flash('Share link copied — the scores travel in the URL'),
          () => flash('Copy failed — your browser blocked clipboard access')
        );
        break;
      }
      case 'print':
        window.print();
        break;
      case 'export-csv':
        download(`nexa-assessments-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(saved), 'text/csv;charset=utf-8');
        flash('CSV downloaded');
        break;
      case 'export-json':
        download(`nexa-assessments-${new Date().toISOString().slice(0, 10)}.json`, toJson(saved), 'application/json');
        flash('JSON downloaded');
        break;
    }
  }

  /** Estate picks are evidence about overlap, so nudge that score rather than leaving it at the default. */
  function suggestOverlap() {
    if (!draft) return;
    const n = draft.estate.length;
    draft.scores.overlap = n === 0 ? 4 : n === 1 ? 2 : n === 2 ? 1 : 0;
  }

  render();
}
