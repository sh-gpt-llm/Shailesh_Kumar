import { INDUSTRIES, DEFAULT_INDUSTRY_SLUG } from '../data/radar/industries';
import { QUADRANTS, RINGS, MOMENTUM } from '../data/radar/types';
import type { IndustryRadar, Technology, Ring, QuadrantId } from '../data/radar/types';
import { CANONICAL_THEMES, canonicalKeyFor, themeByKey } from '../data/radar/canonical';
import { readStateFromUrl, writeStateToUrl, shareUrlFor } from './radar/url';
import type { RadarState, Tab } from './radar/url';
import { fuzzySearch } from './radar/fuzzy';
import {
  STANCES,
  loadPosition,
  savePosition,
  clearPosition,
  encodePosition,
  decodePosition,
  analysePosition,
} from './radar/position';
import type { PositionMap, Stance } from './radar/position';
import { layoutBlips, RING_BANDS } from './radar/layout';
import { toCsv, toJson, download } from './radar/export';
import { ROLE_PATHS, rolePathById } from './radar/roles';
import type { GeoView, GlobeHandle } from './radar/geo';

const RING_ORDER: Ring[] = ['adopt', 'trial', 'assess', 'hold'];
const RING_COLOR: Record<Ring, string> = {
  adopt: '#7c3aed',
  trial: '#06b6d4',
  assess: '#f59e0b',
  hold: '#64748b',
};

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'radar', label: 'Radar', hint: 'The quadrant and ring visualisation of every technology' },
  { id: 'list', label: 'List', hint: 'Every technology as one index, grouped by quadrant and ring' },
  { id: 'roadmap', label: 'Roadmap', hint: 'When to act, and what each technology builds on' },
  { id: 'compare', label: 'Compare', hint: 'One technology, seen across all five industries at once' },
  { id: 'position', label: 'Your Position', hint: 'Mark where you stand and get a gap analysis' },
  { id: 'ecosystem', label: 'Ecosystem', hint: 'The vendors and platforms building in this space' },
  { id: 'functions', label: 'By Function', hint: "The radar through each business function's lens" },
  { id: 'geography', label: 'Geography', hint: 'Where capability concentrates around the world' },
];

// Ordered buckets for the Roadmap swimlanes; technologies are matched by the
// timeHorizon strings used across the datasets.
const HORIZONS: { label: string; matches: string[] }[] = [
  { label: 'Act now', matches: ['Now'] },
  { label: 'Next 6–12 months', matches: ['6-12 mo'] },
  { label: '12–18 months', matches: ['12-18 mo'] },
  { label: '2–3 years', matches: ['2-3 yr'] },
];

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const momentumGlyph = (m: string) => MOMENTUM.find((x) => x.id === m)?.glyph ?? '—';
const momentumLabel = (m: string) => MOMENTUM.find((x) => x.id === m)?.label ?? m;
const ringLabel = (r: string) => RINGS.find((x) => x.id === r)?.label ?? r;
const quadrantName = (q: QuadrantId) => QUADRANTS.find((x) => x.id === q)?.name ?? '';
const quadrantCode = (q: QuadrantId) => QUADRANTS.find((x) => x.id === q)?.code ?? '';
const pad2 = (n: number) => n.toString().padStart(2, '0');

export function initRadarApp() {
  const root = document.getElementById('radar-app');
  if (!root) return;

  let state: RadarState = readStateFromUrl({
    industrySlug: DEFAULT_INDUSTRY_SLUG,
    tab: 'radar',
    search: '',
    quadrant: 'all',
    ring: 'all',
    selectedId: null,
    compareKey: null,
    geoCategory: '',
    role: null,
  });

  let position: PositionMap = {};
  let paletteOpen = false;
  let paletteQuery = '';
  let paletteIndex = 0;
  let toast = '';
  let geoView: GeoView = 'globe';
  let geoHandle: GlobeHandle | null = null;

  const industry = (): IndustryRadar => INDUSTRIES.find((i) => i.slug === state.industrySlug) ?? INDUSTRIES[0];

  // A shared position can be handed over in the URL; adopt it once on boot.
  const sharedPos = new URLSearchParams(window.location.search).get('pos');

  function syncPosition() {
    position = loadPosition(state.industrySlug);
  }

  function filteredTech(ind: IndustryRadar): Technology[] {
    const q = state.search.trim();
    const items = ind.technologies.filter((t) => {
      if (state.quadrant !== 'all' && t.quadrant !== state.quadrant) return false;
      if (state.ring !== 'all' && t.ring !== state.ring) return false;
      return true;
    });
    if (!q) return items;
    return fuzzySearch(q, items, (t) => [t.name, t.summary, ...t.tags]).map((h) => h.item);
  }

  function setState(patch: Partial<RadarState>, opts: { refocusSearch?: boolean } = {}) {
    state = { ...state, ...patch };
    writeStateToUrl(state, DEFAULT_INDUSTRY_SLUG);
    render();
    if (opts.refocusSearch) {
      const input = document.getElementById('radar-search') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
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

  /* ---------------------------------------------------------------- sections */

  function industryPicker(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 pt-16">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <p class="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-400">Select an industry</p>
          <button data-action="open-palette" class="glass flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-mist transition hover:text-white">
            <span>Search everything</span>
            <kbd class="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
        </div>
        <div class="mt-5 flex flex-wrap gap-3">
          ${INDUSTRIES.map(
            (i) => `
            <button data-action="industry" data-slug="${i.slug}" class="rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              i.slug === ind.slug
                ? 'border-transparent bg-gradient-to-r from-violet-500 to-cyan-400 text-ink'
                : 'border-white/10 bg-white/5 text-mist hover:border-white/30 hover:text-white'
            }">${esc(i.name)}</button>`
          ).join('')}
        </div>
      </section>`;
  }

  function hero(ind: IndustryRadar) {
    const newCount = ind.technologies.filter((t) => t.momentum === 'new').length;
    // Derived from the data so the headline numbers can never drift from the radar.
    const stats = [
      { label: 'technologies tracked', value: String(ind.technologies.length) },
      { label: 'new this edition', value: String(newCount) },
      { label: 'accelerating', value: String(ind.technologies.filter((t) => t.momentum === 'accelerating').length) },
      { label: 'on the watchlist', value: String(ind.watchlist.length) },
    ];
    return `
      <section class="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-xs font-semibold uppercase tracking-[0.4em] text-amber-400">Emerging Technology &amp; Innovation Radar</p>
          <span class="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-mist">${esc(ind.edition.label)}</span>
        </div>
        <h1 class="mt-4 font-display text-3xl font-semibold text-white sm:text-5xl">
          <span class="gradient-text">${esc(ind.name)}</span> — where to place your next bet.
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-mist">${esc(ind.tagline)}</p>
        <p class="mt-4 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-mist">${esc(ind.scope)}</p>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          ${stats
            .map(
              (s) => `
            <div class="glass rounded-2xl p-4 text-center">
              <div class="font-display text-2xl font-bold text-white">${esc(s.value)}</div>
              <div class="mt-1 text-xs uppercase tracking-wide text-mist">${esc(s.label)}</div>
            </div>`
            )
            .join('')}
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-mist">
          <span class="rounded-full bg-white/5 px-3 py-1">◌ ${newCount} new this edition</span>
          <span class="rounded-full bg-white/5 px-3 py-1">Published ${esc(ind.edition.published)}</span>
          ${ind.edition.baseline ? `<span class="rounded-full bg-white/5 px-3 py-1">Baseline edition — ring movement is tracked from the next release</span>` : ''}
          <button data-action="share" class="no-print rounded-full border border-white/15 px-3 py-1 transition hover:text-white">Copy share link</button>
          <button data-action="export-csv" class="no-print rounded-full border border-white/15 px-3 py-1 transition hover:text-white">Download CSV</button>
          <button data-action="export-json" class="no-print rounded-full border border-white/15 px-3 py-1 transition hover:text-white">Download JSON</button>
          <button data-action="print" class="no-print rounded-full border border-white/15 px-3 py-1 transition hover:text-white">Print / PDF</button>
        </div>
      </section>`;
  }

  function themes(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 py-6">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Themes of this edition</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          ${ind.themes
            .map(
              (t) => `
            <div class="glass glow-border rounded-2xl p-5">
              <h3 class="font-display text-base font-semibold text-white">${esc(t.title)}</h3>
              <p class="mt-2 text-sm leading-relaxed text-mist">${esc(t.description)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>`;
  }

  function tabBar() {
    return `
      <section class="sticky top-[73px] z-30 border-y border-white/5 bg-ink/80 backdrop-blur-xl">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-3">
          <div class="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            ${TABS.map(
              (t) => `
              <button data-action="tab" data-tab="${t.id}" title="${esc(t.hint)}" class="rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                state.tab === t.id ? 'bg-white text-ink' : 'text-mist hover:text-white'
              }">${t.label}</button>`
            ).join('')}
          </div>
          <p class="ml-1 hidden text-xs text-mist lg:block">${esc(TABS.find((t) => t.id === state.tab)?.hint ?? '')}</p>
        </div>
      </section>`;
  }

  function controls(ind: IndustryRadar) {
    if (state.tab !== 'radar' && state.tab !== 'list' && state.tab !== 'roadmap') return '';
    const active = state.quadrant !== 'all' || state.ring !== 'all' || state.search;
    return `
      <section class="mx-auto max-w-6xl px-6 py-5">
        <div class="flex flex-wrap items-center gap-3">
          <input id="radar-search" type="text" value="${esc(state.search)}" placeholder="Fuzzy search ${ind.technologies.length} technologies…"
            class="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-mist/60 focus:border-violet-400 focus:outline-none" />
          <select id="radar-quadrant" class="rounded-xl border border-white/10 bg-ink-soft px-3 py-2.5 text-sm text-white">
            <option value="all">All quadrants</option>
            ${QUADRANTS.map((q) => `<option value="${q.id}" ${state.quadrant === q.id ? 'selected' : ''}>${esc(q.name)}</option>`).join('')}
          </select>
          <select id="radar-ring" class="rounded-xl border border-white/10 bg-ink-soft px-3 py-2.5 text-sm text-white">
            <option value="all">All rings</option>
            ${RINGS.map((r) => `<option value="${r.id}" ${state.ring === r.id ? 'selected' : ''}>${esc(r.label)}</option>`).join('')}
          </select>
          ${active ? `<button data-action="reset-filters" class="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-mist hover:text-white">Reset</button>` : ''}
        </div>
      </section>`;
  }

  /* -------------------------------------------------------------- radar tab */

  function radarTab(ind: IndustryRadar) {
    const items = filteredTech(ind);
    const size = 660;
    const cx = size / 2;
    const cy = size / 2;
    const R = size / 2 - 26;
    const blips = layoutBlips(items, cx, cy, R);

    const ringFills = RING_ORDER.map((r, i) => {
      const [, r1] = RING_BANDS[r];
      return `<circle cx="${cx}" cy="${cy}" r="${(r1 * R).toFixed(1)}" fill="#ffffff" opacity="${0.05 + (3 - i) * 0.012}" />`;
    })
      .reverse()
      .join('');

    const ringStrokes = RING_ORDER.map((r) => {
      const [, r1] = RING_BANDS[r];
      return `<circle cx="${cx}" cy="${cy}" r="${(r1 * R).toFixed(1)}" fill="none" stroke="${RING_COLOR[r]}" stroke-opacity="0.22" />`;
    }).join('');

    const ringLabels = RING_ORDER.map((r) => {
      const [r0, r1] = RING_BANDS[r];
      return `<text x="${cx + ((r0 + r1) / 2) * R}" y="${cy - 6}" text-anchor="middle" class="fill-mist" style="font-size:9px;letter-spacing:1.5px">${ringLabel(r).toUpperCase()}</text>`;
    }).join('');

    const dots = blips
      .map(({ tech, x, y }) => {
        const isPick = ind.editorsPicks.includes(tech.id);
        const stance = position[tech.id];
        const stanceColor = stance ? STANCES.find((s) => s.id === stance)?.color : null;
        const r = isPick ? 12 : 9.5;
        return `
          <g data-action="select-tech" data-id="${tech.id}" tabindex="0" role="button"
             aria-label="${esc(tech.name)} — ${esc(ringLabel(tech.ring))}, ${esc(momentumLabel(tech.momentum))}"
             class="radar-blip cursor-pointer" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
            <title>${esc(tech.name)} · ${esc(ringLabel(tech.ring))}</title>
            ${stanceColor ? `<circle r="${r + 4}" fill="none" stroke="${stanceColor}" stroke-width="2" opacity="0.9" />` : ''}
            <circle r="${r}" fill="#121727" stroke="${isPick ? '#f59e0b' : RING_COLOR[tech.ring]}" stroke-width="2" />
            <text text-anchor="middle" dy="3.5" class="pointer-events-none select-none fill-white font-display" style="font-size:${isPick ? 10 : 9}px">${tech.id}</text>
            ${tech.momentum === 'accelerating' ? `<text x="-13" y="-9" class="pointer-events-none fill-emerald-400" style="font-size:9px">▲</text>` : ''}
            ${tech.momentum === 'cooling' ? `<text x="-13" y="-9" class="pointer-events-none fill-rose-400" style="font-size:9px">▼</text>` : ''}
            ${tech.momentum === 'new' ? `<text x="-13" y="-9" class="pointer-events-none fill-cyan-300" style="font-size:9px">◌</text>` : ''}
          </g>`;
      })
      .join('');

    return `
      <div class="grid gap-8 lg:grid-cols-[1fr_270px]">
        <div class="glass rounded-3xl p-4 sm:p-7">
          <div class="mb-3 flex items-center justify-between text-xs sm:text-sm">
            <span class="font-display font-semibold text-white">Q04 <em class="not-italic text-mist">${esc(quadrantName(4))}</em></span>
            <span class="font-display font-semibold text-white"><em class="not-italic text-mist">${esc(quadrantName(1))}</em> Q01</span>
          </div>
          <svg viewBox="0 0 ${size} ${size}" class="mx-auto w-full max-w-2xl" role="img" aria-label="Technology radar chart">
            ${ringFills}
            ${ringStrokes}
            <line x1="${cx}" y1="4" x2="${cx}" y2="${size - 4}" stroke="#fff" stroke-opacity="0.08" />
            <line x1="4" y1="${cy}" x2="${size - 4}" y2="${cy}" stroke="#fff" stroke-opacity="0.08" />
            ${ringLabels}
            ${dots}
          </svg>
          <div class="mt-3 flex items-center justify-between text-xs sm:text-sm">
            <span class="font-display font-semibold text-white">Q03 <em class="not-italic text-mist">${esc(quadrantName(3))}</em></span>
            <span class="font-display font-semibold text-white"><em class="not-italic text-mist">${esc(quadrantName(2))}</em> Q02</span>
          </div>
          <p class="mt-5 text-center text-xs text-mist">
            ${items.length} of ${ind.technologies.length} shown · blips nearer a ring's inner edge are closer to promotion · click or press Enter on a blip for the brief
          </p>
        </div>
        <aside class="space-y-3">
          <h3 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Editor's picks</h3>
          ${ind.editorsPicks
            .map((id) => ind.technologies.find((t) => t.id === id))
            .filter((t): t is Technology => !!t)
            .map(
              (t) => `
            <button data-action="select-tech" data-id="${t.id}" class="glass glow-border block w-full rounded-xl p-3 text-left transition hover:bg-white/10">
              <div class="flex items-center justify-between text-xs text-mist">
                <span>${pad2(t.id)}</span>
                <span>${momentumGlyph(t.momentum)} ${esc(momentumLabel(t.momentum))}</span>
              </div>
              <div class="mt-1 text-sm font-semibold text-white">${esc(t.name)}</div>
            </button>`
            )
            .join('')}
          <div class="glass rounded-xl p-3 text-xs text-mist">
            <p class="font-semibold text-white">Your position</p>
            <p class="mt-1">${Object.keys(position).length} of ${ind.technologies.length} marked.
              <button data-action="tab" data-tab="position" class="text-cyan-300 underline">Open the gap analysis →</button>
            </p>
          </div>
        </aside>
      </div>`;
  }

  /* --------------------------------------------------------------- list tab */

  function techCard(t: Technology) {
    const stance = position[t.id];
    const meta = stance ? STANCES.find((s) => s.id === stance) : null;
    return `
      <button data-action="select-tech" data-id="${t.id}" class="glass rounded-xl p-4 text-left transition hover:bg-white/10">
        <div class="flex items-center justify-between text-xs text-mist">
          <span>${pad2(t.id)}</span>
          <span>${momentumGlyph(t.momentum)} ${esc(momentumLabel(t.momentum))}</span>
        </div>
        <div class="mt-1.5 text-sm font-semibold text-white">${esc(t.name)}</div>
        <p class="mt-1.5 text-xs italic leading-relaxed text-mist">${esc(t.summary)}</p>
        ${meta ? `<span class="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" style="background:${meta.color}22;color:${meta.color}">${esc(meta.label)}</span>` : ''}
      </button>`;
  }

  function listTab(ind: IndustryRadar) {
    const items = filteredTech(ind);
    if (!items.length) return `<p class="py-16 text-center text-mist">No technologies match that filter.</p>`;
    const groups = QUADRANTS.map((q) => {
      const qItems = items.filter((t) => t.quadrant === q.id);
      if (!qItems.length) return '';
      const rings = RING_ORDER.map((r) => {
        const rItems = qItems.filter((t) => t.ring === r);
        if (!rItems.length) return '';
        return `
          <div class="mt-4">
            <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mist">
              <span class="h-2 w-2 rounded-full" style="background:${RING_COLOR[r]}"></span>
              ${esc(ringLabel(r))} <span class="text-mist/60">${rItems.length}</span>
            </div>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">${rItems.map(techCard).join('')}</div>
          </div>`;
      }).join('');
      return `
        <div class="mt-8 border-t border-white/10 pt-6 first:mt-0 first:border-0 first:pt-0">
          <div class="flex items-baseline justify-between">
            <h3 class="font-display text-xl font-semibold text-white"><span class="text-mist">${q.code}</span> ${esc(q.name)}</h3>
            <span class="text-sm text-mist">${qItems.length}</span>
          </div>
          ${rings}
        </div>`;
    }).join('');
    return `<div class="pb-10"><p class="text-lg italic text-mist">The complete radar · <strong class="text-white">${items.length}</strong> technologies, by quadrant &amp; ring</p>${groups}</div>`;
  }

  /* ------------------------------------------------------------ compare tab */

  interface ComparisonRow {
    key: string;
    label: string;
    blurb: string;
    entries: { industry: IndustryRadar; tech: Technology }[];
  }

  function buildComparisons(): ComparisonRow[] {
    const rows: ComparisonRow[] = [];
    for (const theme of CANONICAL_THEMES) {
      const entries: { industry: IndustryRadar; tech: Technology }[] = [];
      for (const ind of INDUSTRIES) {
        const tech = ind.technologies.find((t) => canonicalKeyFor(t.name) === theme.key);
        if (tech) entries.push({ industry: ind, tech });
      }
      if (entries.length >= 2) rows.push({ key: theme.key, label: theme.label, blurb: theme.blurb, entries });
    }
    return rows.sort((a, b) => b.entries.length - a.entries.length || a.label.localeCompare(b.label));
  }

  const divergenceOf = (row: ComparisonRow) => {
    const idx = row.entries.map((e) => RING_ORDER.indexOf(e.tech.ring));
    return Math.max(...idx) - Math.min(...idx);
  };

  function compareTab() {
    const rows = buildComparisons();
    const selected = state.compareKey ? rows.find((r) => r.key === state.compareKey) : null;
    const mostDivergent = [...rows].sort((a, b) => divergenceOf(b) - divergenceOf(a)).slice(0, 3);

    const detail = selected
      ? `
      <div class="glass glow-border mt-6 rounded-3xl p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-display text-2xl font-semibold text-white">${esc(selected.label)}</h3>
            <p class="mt-1 text-sm text-mist">${esc(selected.blurb)}</p>
          </div>
          <button data-action="clear-compare" class="shrink-0 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white">Clear</button>
        </div>
        <div class="mt-6 space-y-3">
          ${selected.entries
            .map(
              (e) => `
            <div class="rounded-2xl border border-white/10 p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-cyan-400">${esc(e.industry.name)}</span>
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span class="rounded-full px-2.5 py-1 font-semibold" style="background:${RING_COLOR[e.tech.ring]}33;color:${RING_COLOR[e.tech.ring]}">${esc(ringLabel(e.tech.ring))}</span>
                  <span class="rounded-full bg-white/10 px-2.5 py-1 text-mist">${momentumGlyph(e.tech.momentum)} ${esc(momentumLabel(e.tech.momentum))}</span>
                  <span class="rounded-full bg-white/10 px-2.5 py-1 text-mist">${esc(e.tech.timeHorizon)}</span>
                </div>
              </div>
              <p class="mt-2 font-display text-sm font-semibold text-white">${esc(e.tech.name)}</p>
              <p class="mt-1.5 text-sm leading-relaxed text-mist">${esc(e.tech.brief)}</p>
              <button data-action="goto-tech" data-slug="${e.industry.slug}" data-id="${e.tech.id}" class="mt-3 text-xs font-semibold text-cyan-300 hover:underline">Open in the ${esc(e.industry.name)} radar →</button>
            </div>`
            )
            .join('')}
        </div>
      </div>`
      : '';

    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">One technology. <em class="gradient-text not-italic">Five industries.</em></h2>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
          The same technology rarely sits in the same ring everywhere. This view lines up each cross-cutting theme
          across all five radars, so you can see exactly where your industry leads — and where it lags.
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          ${mostDivergent
            .map(
              (r) => `
            <button data-action="compare" data-key="${r.key}" class="glass glow-border rounded-2xl p-4 text-left transition hover:bg-white/10">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-amber-400">Widest divergence</p>
              <p class="mt-1 font-display text-sm font-semibold text-white">${esc(r.label)}</p>
              <p class="mt-1 text-xs text-mist">Spans ${divergenceOf(r) + 1} rings across ${r.entries.length} industries</p>
            </button>`
            )
            .join('')}
        </div>

        ${detail}

        <div class="mt-8 overflow-x-auto">
          <table class="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-white/10 text-left text-xs uppercase tracking-wide text-mist">
                <th class="py-3 pr-4 font-semibold">Technology theme</th>
                ${INDUSTRIES.map((i) => `<th class="px-2 py-3 text-center font-semibold">${esc(i.name.split(' ')[0])}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows
                .map((row) => {
                  const cells = INDUSTRIES.map((ind) => {
                    const entry = row.entries.find((e) => e.industry.slug === ind.slug);
                    if (!entry) return `<td class="px-2 py-2 text-center text-mist/30">—</td>`;
                    return `<td class="px-2 py-2 text-center">
                        <span title="${esc(entry.tech.name)}" class="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold" style="background:${RING_COLOR[entry.tech.ring]}33;color:${RING_COLOR[entry.tech.ring]}">${esc(ringLabel(entry.tech.ring))}</span>
                      </td>`;
                  }).join('');
                  return `
                    <tr data-action="compare" data-key="${row.key}" class="cursor-pointer border-b border-white/5 transition hover:bg-white/5 ${state.compareKey === row.key ? 'bg-white/5' : ''}">
                      <td class="py-2 pr-4 font-medium text-white">${esc(row.label)}</td>
                      ${cells}
                    </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
        <p class="mt-4 text-xs text-mist">${rows.length} cross-industry themes tracked · click any row for the full side-by-side read</p>
      </div>`;
  }

  /* ----------------------------------------------------------- position tab */

  function positionTab(ind: IndustryRadar) {
    const gap = analysePosition(ind, position);
    const scoreColor = gap.readinessScore >= 70 ? '#34d399' : gap.readinessScore >= 40 ? '#fbbf24' : '#f87171';

    const groupList = (title: string, note: string, items: Technology[], color: string) =>
      items.length
        ? `
      <div class="rounded-2xl border border-white/10 p-4">
        <h4 class="font-display text-sm font-semibold" style="color:${color}">${esc(title)} <span class="text-mist">· ${items.length}</span></h4>
        <p class="mt-1 text-xs text-mist">${esc(note)}</p>
        <ul class="mt-3 space-y-1.5">
          ${items
            .map(
              (t) => `<li><button data-action="select-tech" data-id="${t.id}" class="text-left text-sm text-white hover:underline">${pad2(t.id)} · ${esc(t.name)}</button></li>`
            )
            .join('')}
        </ul>
      </div>`
        : '';

    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">Where do <em class="gradient-text not-italic">you</em> actually stand?</h2>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
          Mark your organisation's stance on each technology. The radar overlays your position and produces a gap
          analysis against this edition. Everything stays in your browser — nothing is sent anywhere.
        </p>

        <div class="mt-6 grid gap-4 lg:grid-cols-[260px_1fr]">
          <div class="glass glow-border rounded-2xl p-5 text-center">
            <p class="text-xs uppercase tracking-wide text-mist">Readiness score</p>
            <p class="mt-2 font-display text-5xl font-bold" style="color:${scoreColor}">${gap.readinessScore}</p>
            <p class="mt-1 text-xs text-mist">${gap.assessed} of ${gap.total} technologies marked</p>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div class="h-full rounded-full" style="width:${gap.readinessScore}%;background:${scoreColor}"></div>
            </div>
            <p class="mt-3 text-xs text-mist">Adopt-ring coverage: <strong class="text-white">${gap.adoptCovered}/${gap.adoptTotal}</strong></p>
            <div class="mt-4 flex flex-col gap-2">
              <button data-action="share-position" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink">Copy shareable link</button>
              <button data-action="reset-position" class="rounded-xl border border-white/15 px-3 py-2 text-xs text-mist hover:text-white">Reset my position</button>
            </div>
          </div>
          <div class="glass rounded-2xl p-5">
            <p class="font-display text-base font-semibold text-white">Verdict</p>
            <p class="mt-2 text-sm leading-relaxed text-mist">${esc(gap.verdict)}</p>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              ${groupList('Adopt-ring gaps', 'Proven and low-risk, but not yet in production for you. Fastest returns available.', gap.adoptGaps, '#a78bfa')}
              ${groupList('Hold-ring risks', 'You are running things this edition advises caution on.', gap.holdRisks, '#f87171')}
              ${groupList('Ahead of the curve', 'In production for you while the wider market is still assessing.', gap.aheadOfCurve, '#34d399')}
              ${groupList('Suggested next moves', 'Trial-ring technologies you have not yet picked up.', gap.nextMoves, '#22d3ee')}
            </div>
          </div>
        </div>

        <h3 class="mt-10 font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Mark your stance</h3>
        ${RING_ORDER.map((r) => {
          const items = ind.technologies.filter((t) => t.ring === r);
          if (!items.length) return '';
          return `
            <div class="mt-5">
              <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mist">
                <span class="h-2 w-2 rounded-full" style="background:${RING_COLOR[r]}"></span>${esc(ringLabel(r))}
              </p>
              <div class="mt-2 space-y-1.5">
                ${items
                  .map(
                    (t) => `
                  <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                    <button data-action="select-tech" data-id="${t.id}" class="text-left text-sm text-white hover:underline">${pad2(t.id)} · ${esc(t.name)}</button>
                    <div class="flex gap-1">
                      ${STANCES.map(
                        (s) => `
                        <button data-action="set-stance" data-id="${t.id}" data-stance="${s.id}" title="${esc(s.label)}"
                          class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                          style="${position[t.id] === s.id ? `background:${s.color};color:#0b0e17` : 'background:rgba(255,255,255,0.06);color:#94a3b8'}">${esc(s.label.split(' ')[0])}</button>`
                      ).join('')}
                      ${position[t.id] ? `<button data-action="set-stance" data-id="${t.id}" data-stance="" aria-label="Clear" class="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-mist">✕</button>` : ''}
                    </div>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  /* --------------------------------------------------- ecosystem / functions */

  function mixBar(mix: Partial<Record<Ring, number>>) {
    const total = (Object.values(mix) as number[]).reduce((a, b) => a + b, 0) || 1;
    return RING_ORDER.map((r) => {
      const v = mix[r] ?? 0;
      return v ? `<span style="width:${(v / total) * 100}%;background:${RING_COLOR[r]}" title="${ringLabel(r)}: ${v}"></span>` : '';
    }).join('');
  }

  function ecosystemTab(ind: IndustryRadar) {
    const onRadar = ind.ecosystem.reduce((a, e) => a + e.onRadar, 0);
    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">What the ecosystem is building next.</h2>
        <div class="mt-6 grid grid-cols-3 gap-4 sm:max-w-md">
          <div class="glass rounded-xl p-4 text-center"><div class="font-display text-xl font-bold text-white">${ind.ecosystem.length}</div><div class="text-xs text-mist">players</div></div>
          <div class="glass rounded-xl p-4 text-center"><div class="font-display text-xl font-bold text-white">${onRadar}</div><div class="text-xs text-mist">on the radar</div></div>
          <div class="glass rounded-xl p-4 text-center"><div class="font-display text-xl font-bold text-white">${ind.movements.length}</div><div class="text-xs text-mist">movements</div></div>
        </div>
        <h3 class="mt-10 font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Movements to watch</h3>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${ind.movements
            .map(
              (m) => `
            <div class="glass rounded-2xl p-5">
              <div class="flex items-center justify-between gap-2">
                <h4 class="font-display text-sm font-semibold text-white">${esc(m.title)}</h4>
                <span class="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">${esc(m.horizon)}</span>
              </div>
              <p class="mt-2 text-xs leading-relaxed text-mist">${esc(m.description)}</p>
            </div>`
            )
            .join('')}
        </div>
        <h3 class="mt-10 font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Footprint</h3>
        <div class="mt-4 space-y-2">
          ${ind.ecosystem
            .map(
              (e) => `
            <div class="glass flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-center sm:gap-4">
              <div class="flex shrink-0 items-center gap-3 sm:w-64">
                <span class="text-xs text-mist">${pad2(e.rank)}</span>
                <span class="font-semibold text-white">${esc(e.name)}</span>
                <span class="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-mist">${esc(e.posture)}</span>
              </div>
              <div class="flex h-2 flex-1 overflow-hidden rounded-full bg-white/5">${mixBar(e.mix)}</div>
              <p class="shrink-0 text-xs text-mist sm:w-72">${esc(e.note)}</p>
            </div>`
            )
            .join('')}
        </div>
      </div>`;
  }

  function functionsTab(ind: IndustryRadar) {
    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">The radar, through each function's lens.</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${ind.functions
            .map(
              (f) => `
            <div class="glass glow-border rounded-2xl p-5">
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-display text-base font-semibold text-white">${esc(f.name)}</h3>
                <span class="shrink-0 text-xs text-amber-300">+${f.newCount} new</span>
              </div>
              <p class="mt-2 text-xs text-mist">${esc(f.description)}</p>
              <span class="mt-3 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-mist">${esc(f.posture)}</span>
              <div class="mt-3 flex h-2 overflow-hidden rounded-full bg-white/5">${mixBar(f.mix)}</div>
            </div>`
            )
            .join('')}
        </div>
      </div>`;
  }

  function geographyTab(ind: IndustryRadar) {
    const cat = state.geoCategory || ind.geography.categories[0];
    const leaders = ind.geography.leaders[cat] ?? [];
    const max = Math.max(...leaders.map((l) => l.score), 1);
    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">Where it concentrates around the world.</h2>
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            ${ind.geography.categories
              .map(
                (c) => `
              <button data-action="geo-cat" data-cat="${esc(c)}" class="rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                cat === c ? 'border-transparent bg-white text-ink' : 'border-white/10 text-mist hover:text-white'
              }">${esc(c)}</button>`
              )
              .join('')}
          </div>
          <div class="no-print flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            ${(['globe', 'map'] as GeoView[])
              .map(
                (v) => `
              <button data-action="geo-view" data-view="${v}" class="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                geoView === v ? 'bg-white text-ink' : 'text-mist hover:text-white'
              }">${v}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div class="glass rounded-3xl p-3 sm:p-5">
            <div id="geo-canvas" class="flex min-h-[320px] items-center justify-center">
              <p class="text-sm text-mist">Loading map…</p>
            </div>
            <p class="mt-3 text-center text-xs text-mist">
              ${geoView === 'globe' ? 'Drag to spin the globe · hover a country for its score' : 'Hover a country for its score'}
            </p>
          </div>
          <aside>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-mist">Centre of gravity</p>
            <p class="mt-1 font-display text-sm italic text-white">${esc(cat)}</p>
            <div class="mt-3 space-y-1.5">
              ${leaders
                .map(
                  (l) => `
                <div data-geo-row="${esc(l.place)}" class="flex items-center gap-2 rounded-lg px-1.5 py-1 transition">
                  <span class="w-5 shrink-0 text-right text-[11px] text-mist">${l.rank}</span>
                  <span class="w-28 shrink-0 truncate text-xs text-white">${esc(l.place)}</span>
                  <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div class="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style="width:${(l.score / max) * 100}%"></div>
                  </div>
                  <span class="w-6 shrink-0 text-right text-[11px] text-mist">${l.score}</span>
                </div>`
                )
                .join('')}
            </div>
            <div class="mt-4 flex items-center gap-2 text-[10px] text-mist">
              <span>Less</span>
              <span class="h-1.5 flex-1 rounded-full" style="background:linear-gradient(90deg,#94a3b8,#22d3ee,#7c3aed)"></span>
              <span>More</span>
            </div>
          </aside>
        </div>
        <p class="mt-4 text-xs text-mist">Editorial, directional read — relative signal, not a precise index. Singapore and Hong Kong are shown as markers; they are too small to render as areas at this scale.</p>
      </div>`;
  }

  /* -------------------------------------------------------- shared sections */

  function startHere(ind: IndustryRadar) {
    const active = state.role ? rolePathById(state.role) : null;
    return `
      <section class="mx-auto max-w-6xl px-6 py-6 no-print">
        <div class="glass glow-border rounded-3xl p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="font-display text-base font-semibold text-white">Start here</h2>
              <p class="mt-1 text-sm text-mist">Ninety seconds, tailored to how you'll actually use this radar.</p>
            </div>
            ${active ? `<button data-action="clear-role" class="rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white">Clear</button>` : ''}
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            ${ROLE_PATHS.map(
              (r) => `
              <button data-action="role" data-role="${r.id}" class="rounded-full border px-4 py-2 text-sm font-medium transition ${
                state.role === r.id
                  ? 'border-transparent bg-white text-ink'
                  : 'border-white/10 text-mist hover:border-white/30 hover:text-white'
              }">${esc(r.label)}</button>`
            ).join('')}
          </div>
          ${
            active
              ? `
            <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <p class="text-sm italic text-mist">${esc(active.blurb)}</p>
                <ol class="mt-3 space-y-2">
                  ${active.steps
                    .map(
                      (s, i) => `
                    <li class="flex gap-3">
                      <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/30 text-[10px] font-bold text-violet-200">${i + 1}</span>
                      <span class="text-sm text-mist"><strong class="text-white">${esc(s.title)}</strong> — ${esc(s.detail)}</span>
                    </li>`
                    )
                    .join('')}
                </ol>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Your ${active.pick(ind).length} priority reads</p>
                <div class="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                  ${active
                    .pick(ind)
                    .slice(0, 12)
                    .map(
                      (t) => `<button data-action="select-tech" data-id="${t.id}" class="block w-full rounded-lg border border-white/10 px-3 py-1.5 text-left text-xs text-white transition hover:bg-white/10">${pad2(t.id)} · ${esc(t.name)}</button>`
                    )
                    .join('')}
                </div>
              </div>
            </div>`
              : ''
          }
        </div>
      </section>`;
  }

  function whatChanged(ind: IndustryRadar) {
    const fresh = ind.technologies.filter((t) => t.momentum === 'new');
    const accelerating = ind.technologies.filter((t) => t.momentum === 'accelerating');
    const cooling = ind.technologies.filter((t) => t.momentum === 'cooling');
    const moved = ind.technologies.filter((t) => t.previousRing && t.previousRing !== t.ring);

    const column = (title: string, color: string, items: Technology[], empty: string) => `
      <div class="rounded-2xl border border-white/10 p-4">
        <h3 class="font-display text-sm font-semibold" style="color:${color}">${esc(title)} <span class="text-mist">· ${items.length}</span></h3>
        ${
          items.length
            ? `<ul class="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">${items
                .map(
                  (t) => `<li><button data-action="select-tech" data-id="${t.id}" class="text-left text-xs text-white hover:underline">${pad2(t.id)} · ${esc(t.name)}</button></li>`
                )
                .join('')}</ul>`
            : `<p class="mt-2 text-xs text-mist">${esc(empty)}</p>`
        }
      </div>`;

    return `
      <section class="mx-auto max-w-6xl px-6 py-10">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">What changed · ${esc(ind.edition.label)}</h2>
          <span class="text-xs text-mist">Published ${esc(ind.edition.published)}</span>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          ${column('New this edition', '#22d3ee', fresh, 'Nothing new.')}
          ${column('Accelerating', '#34d399', accelerating, 'No accelerating entries.')}
          ${column('Cooling', '#f87171', cooling, 'Nothing cooling.')}
          ${column(
            'Moved ring',
            '#a78bfa',
            moved,
            ind.edition.baseline
              ? 'This is the baseline edition — ring movement is tracked from the next release onward.'
              : 'No ring changes.'
          )}
        </div>
      </section>`;
  }

  function roadmapTab(ind: IndustryRadar) {
    const items = filteredTech(ind);
    const byId = new Map(ind.technologies.map((t) => [t.id, t]));
    const enables = new Map<number, Technology[]>();
    for (const t of ind.technologies) {
      for (const dep of t.dependsOn ?? []) {
        const list = enables.get(dep);
        if (list) list.push(t);
        else enables.set(dep, [t]);
      }
    }

    const lanes = HORIZONS.map((h) => {
      const laneItems = items.filter((t) => h.matches.includes(t.timeHorizon));
      if (!laneItems.length) return '';
      return `
        <div class="mt-6">
          <div class="flex items-baseline gap-3">
            <h3 class="font-display text-lg font-semibold text-white">${esc(h.label)}</h3>
            <span class="text-xs text-mist">${laneItems.length} ${laneItems.length === 1 ? 'technology' : 'technologies'}</span>
          </div>
          <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            ${laneItems
              .map((t) => {
                const deps = (t.dependsOn ?? []).map((d) => byId.get(d)).filter((d): d is Technology => !!d);
                const unlocks = enables.get(t.id) ?? [];
                return `
                <div class="glass rounded-xl p-4">
                  <div class="flex items-center justify-between gap-2 text-xs text-mist">
                    <span>${pad2(t.id)}</span>
                    <span class="rounded-full px-2 py-0.5 font-semibold" style="background:${RING_COLOR[t.ring]}33;color:${RING_COLOR[t.ring]}">${esc(ringLabel(t.ring))}</span>
                  </div>
                  <button data-action="select-tech" data-id="${t.id}" class="mt-1.5 block text-left text-sm font-semibold text-white hover:underline">${esc(t.name)}</button>
                  ${
                    deps.length
                      ? `<p class="mt-2 text-[11px] text-mist"><span class="text-amber-300">Builds on</span> ${deps
                          .map((d) => `<button data-action="select-tech" data-id="${d.id}" class="underline decoration-dotted hover:text-white">${esc(d.name)}</button>`)
                          .join(', ')}</p>`
                      : ''
                  }
                  ${
                    unlocks.length
                      ? `<p class="mt-1 text-[11px] text-mist"><span class="text-emerald-300">Enables</span> ${unlocks
                          .map((d) => `<button data-action="select-tech" data-id="${d.id}" class="underline decoration-dotted hover:text-white">${esc(d.name)}</button>`)
                          .join(', ')}</p>`
                      : ''
                  }
                </div>`;
              })
              .join('')}
          </div>
        </div>`;
    }).join('');

    const linked = ind.technologies.filter((t) => (t.dependsOn ?? []).length).length;

    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">Not just what. <em class="gradient-text not-italic">When, and in what order.</em></h2>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
          Rings tell you how proven something is. They do not tell you when to act or what has to be in place first.
          This view groups the radar by time horizon and maps the dependencies between entries — ${linked} of
          ${ind.technologies.length} technologies have an explicit prerequisite.
        </p>
        ${lanes || `<p class="py-16 text-center text-mist">No technologies match that filter.</p>`}
      </div>`;
  }

  function newsletter() {
    return `
      <section class="mx-auto max-w-6xl px-6 py-10 no-print">
        <div class="glass glow-border rounded-3xl p-6 sm:p-8">
          <div class="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <h2 class="font-display text-xl font-semibold text-white">Get the next edition.</h2>
              <p class="mt-2 text-sm leading-relaxed text-mist">
                Each edition re-scores every technology and tracks what moved. No spam, no sharing your address — just the radar.
              </p>
            </div>
            <form name="radar-subscribe" method="POST" data-netlify="true" netlify-honeypot="bot-field" class="flex flex-col gap-2">
              <input type="hidden" name="form-name" value="radar-subscribe" />
              <p class="hidden"><label>Leave this empty: <input name="bot-field" /></label></p>
              <label class="sr-only" for="subscribe-email">Email address</label>
              <input id="subscribe-email" type="email" name="email" required placeholder="you@company.com"
                class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-mist/60 focus:border-violet-400 focus:outline-none" />
              <button type="submit" class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-ink">Notify me</button>
            </form>
          </div>
        </div>
      </section>`;
  }

  function editorsNote(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 py-10">
        <div class="glass glow-border rounded-3xl p-6 sm:p-8">
          <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">Editor's note</h2>
          <p class="mt-3 text-base leading-relaxed text-mist">${esc(ind.editorsNote)}</p>
        </div>
      </section>`;
  }

  function watchlist(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 py-10">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">On the periphery — watchlist</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${ind.watchlist
            .map(
              (w) => `
            <div class="rounded-xl border border-dashed border-white/15 p-4">
              <h3 class="font-display text-sm font-semibold text-white">${esc(w.name)}</h3>
              <p class="mt-1.5 text-xs leading-relaxed text-mist">${esc(w.blurb)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>`;
  }

  function methodology() {
    return `
      <section class="mx-auto max-w-6xl px-6 py-10">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Methodology</h2>
        <div class="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Rings</h3>
            <ul class="mt-2 space-y-1.5 text-sm text-mist">
              <li><strong class="text-white">Adopt</strong> — proven and low-risk; invest now.</li>
              <li><strong class="text-white">Trial</strong> — worth piloting on a real project.</li>
              <li><strong class="text-white">Assess</strong> — worth understanding, not yet committing.</li>
              <li><strong class="text-white">Hold</strong> — proceed with caution, or de-prioritise.</li>
            </ul>
            <p class="mt-3 text-xs text-mist">A blip's distance from its ring's inner edge reflects how close it is to promotion.</p>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Quadrants</h3>
            <ul class="mt-2 space-y-1.5 text-sm text-mist">
              ${QUADRANTS.map((q) => `<li><strong class="text-white">${esc(q.name)}</strong></li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Market momentum</h3>
            <ul class="mt-2 space-y-1.5 text-sm text-mist">
              ${MOMENTUM.map((m) => `<li>${m.glyph} <strong class="text-white">${esc(m.label)}</strong></li>`).join('')}
            </ul>
          </div>
        </div>
        <p class="mt-8 text-xs text-mist/70">An independent, industry-agnostic radar curated by Shailesh Kumar. Not affiliated with, and containing no confidential information from, any employer.</p>
      </section>`;
  }

  function detailModal(ind: IndustryRadar) {
    if (state.selectedId == null) return '';
    const t = ind.technologies.find((x) => x.id === state.selectedId);
    if (!t) return '';
    const canonical = canonicalKeyFor(t.name);
    const theme = canonical ? themeByKey(canonical) : undefined;
    const otherCount = theme
      ? INDUSTRIES.filter((i) => i.slug !== ind.slug && i.technologies.some((x) => canonicalKeyFor(x.name) === canonical)).length
      : 0;
    const stance = position[t.id];
    const byId = new Map(ind.technologies.map((x) => [x.id, x]));
    const deps = (t.dependsOn ?? []).map((d) => byId.get(d)).filter((d): d is Technology => !!d);
    const unlocks = ind.technologies.filter((x) => (x.dependsOn ?? []).includes(t.id));

    return `
      <div data-action="close-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div data-stop class="glow-border glass max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl p-7">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-white/10 px-2.5 py-1 text-mist">${pad2(t.id)}</span>
                <span class="rounded-full bg-violet-500/20 px-2.5 py-1 text-violet-200">${esc(quadrantCode(t.quadrant))} · ${esc(quadrantName(t.quadrant))}</span>
                <span class="rounded-full px-2.5 py-1" style="background:${RING_COLOR[t.ring]}33;color:${RING_COLOR[t.ring]}">${esc(ringLabel(t.ring))}</span>
                <span class="rounded-full bg-amber-500/20 px-2.5 py-1 text-amber-200">${momentumGlyph(t.momentum)} ${esc(momentumLabel(t.momentum))}</span>
              </div>
              <h3 class="mt-3 font-display text-2xl font-semibold text-white">${esc(t.name)}</h3>
              <p class="mt-1 text-sm italic text-mist">${esc(t.summary)}</p>
            </div>
            <button data-action="close-modal" aria-label="Close" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">✕</button>
          </div>

          <p class="mt-5 text-sm leading-relaxed text-mist">${esc(t.brief)}</p>

          ${
            t.evidence?.length
              ? `<div class="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                   <p class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Signals behind this placement</p>
                   <ul class="mt-2 space-y-1.5">
                     ${t.evidence.map((e) => `<li class="flex gap-2 text-xs leading-relaxed text-mist"><span class="text-cyan-400">—</span><span>${esc(e)}</span></li>`).join('')}
                   </ul>
                 </div>`
              : ''
          }

          ${
            deps.length || unlocks.length
              ? `<div class="mt-4 space-y-2">
                   ${
                     deps.length
                       ? `<p class="text-xs text-mist"><span class="font-semibold text-amber-300">Builds on</span> ${deps
                           .map((d) => `<button data-action="select-tech" data-id="${d.id}" class="underline decoration-dotted hover:text-white">${esc(d.name)}</button>`)
                           .join(', ')}</p>`
                       : ''
                   }
                   ${
                     unlocks.length
                       ? `<p class="text-xs text-mist"><span class="font-semibold text-emerald-300">Enables</span> ${unlocks
                           .map((d) => `<button data-action="select-tech" data-id="${d.id}" class="underline decoration-dotted hover:text-white">${esc(d.name)}</button>`)
                           .join(', ')}</p>`
                       : ''
                   }
                 </div>`
              : ''
          }

          <div class="mt-5 flex flex-wrap items-center gap-2 text-xs text-mist">
            <span class="rounded-full border border-white/10 px-2.5 py-1">Time horizon: ${esc(t.timeHorizon)}</span>
            ${t.tags.map((tag) => `<span class="rounded-full border border-white/10 px-2.5 py-1">${esc(tag)}</span>`).join('')}
          </div>

          <div class="mt-6 border-t border-white/10 pt-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-mist">Your stance</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              ${STANCES.map(
                (s) => `
                <button data-action="set-stance" data-id="${t.id}" data-stance="${s.id}" class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                  style="${stance === s.id ? `background:${s.color};color:#0b0e17` : 'background:rgba(255,255,255,0.06);color:#94a3b8'}">${esc(s.label)}</button>`
              ).join('')}
              ${stance ? `<button data-action="set-stance" data-id="${t.id}" data-stance="" class="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist">Clear</button>` : ''}
            </div>
          </div>

          ${
            otherCount
              ? `<button data-action="compare" data-key="${canonical}" class="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-ink">
                   Compare across ${otherCount} other ${otherCount === 1 ? 'industry' : 'industries'} →
                 </button>`
              : ''
          }
          <button data-action="share" class="mt-2 w-full rounded-xl border border-white/15 px-4 py-2.5 text-xs text-mist hover:text-white">Copy link to this technology</button>
        </div>
      </div>`;
  }

  /* -------------------------------------------------------- command palette */

  interface PaletteItem {
    industry: IndustryRadar;
    tech: Technology;
  }

  function paletteItems(): PaletteItem[] {
    const all: PaletteItem[] = [];
    for (const ind of INDUSTRIES) for (const tech of ind.technologies) all.push({ industry: ind, tech });
    if (!paletteQuery.trim()) return all.filter((i) => i.industry.slug === state.industrySlug).slice(0, 12);
    return fuzzySearch(paletteQuery, all, (i) => [i.tech.name, i.tech.summary, i.industry.name, ...i.tech.tags], 24).map(
      (r) => r.item
    );
  }

  function commandPalette() {
    if (!paletteOpen) return '';
    const items = paletteItems();
    paletteIndex = Math.min(paletteIndex, Math.max(0, items.length - 1));
    return `
      <div data-action="close-palette" class="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm">
        <div data-stop class="glow-border glass w-full max-w-xl overflow-hidden rounded-2xl">
          <input id="palette-input" type="text" value="${esc(paletteQuery)}" placeholder="Search every technology, across every industry…"
            class="w-full border-b border-white/10 bg-transparent px-5 py-4 text-sm text-white placeholder:text-mist/60 focus:outline-none" />
          <div class="max-h-[50vh] overflow-y-auto">
            ${
              items.length
                ? items
                    .map(
                      (i, idx) => `
              <button data-action="palette-go" data-slug="${i.industry.slug}" data-id="${i.tech.id}"
                class="flex w-full items-center gap-3 px-5 py-3 text-left transition ${idx === paletteIndex ? 'bg-white/10' : 'hover:bg-white/5'}">
                <span class="w-7 shrink-0 text-xs text-mist">${pad2(i.tech.id)}</span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-white">${esc(i.tech.name)}</span>
                  <span class="block truncate text-xs text-mist">${esc(i.industry.name)}</span>
                </span>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style="background:${RING_COLOR[i.tech.ring]}33;color:${RING_COLOR[i.tech.ring]}">${esc(ringLabel(i.tech.ring))}</span>
              </button>`
                    )
                    .join('')
                : `<p class="px-5 py-8 text-center text-sm text-mist">No matches.</p>`
            }
          </div>
          <p class="border-t border-white/10 px-5 py-2.5 text-[11px] text-mist">↑↓ navigate · ↵ open · esc close</p>
        </div>
      </div>`;
  }

  const toastEl = () =>
    toast
      ? `<div class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xl">${esc(toast)}</div>`
      : '';

  /* ------------------------------------------------------------------ render */

  function render() {
    const ind = industry();
    if (!state.geoCategory) state.geoCategory = ind.geography.categories[0];

    const body =
      state.tab === 'radar'
        ? radarTab(ind)
        : state.tab === 'list'
          ? listTab(ind)
          : state.tab === 'roadmap'
            ? roadmapTab(ind)
            : state.tab === 'compare'
              ? compareTab()
              : state.tab === 'position'
                ? positionTab(ind)
                : state.tab === 'ecosystem'
                  ? ecosystemTab(ind)
                  : state.tab === 'functions'
                    ? functionsTab(ind)
                    : geographyTab(ind);

    root!.innerHTML = `
      ${industryPicker(ind)}
      ${hero(ind)}
      ${startHere(ind)}
      ${themes(ind)}
      ${tabBar()}
      ${controls(ind)}
      <div class="mx-auto max-w-6xl px-6">${body}</div>
      ${whatChanged(ind)}
      ${editorsNote(ind)}
      ${watchlist(ind)}
      ${methodology()}
      ${newsletter()}
      ${detailModal(ind)}
      ${commandPalette()}
      ${toastEl()}`;

    bind();
    if (state.tab === 'geography') void mountGeography(ind);
  }

  // The boundary data is ~105KB, so it is only fetched when Geography is opened.
  async function mountGeography(ind: IndustryRadar) {
    const host = document.getElementById('geo-canvas');
    if (!host) return;
    geoHandle?.destroy();
    geoHandle = null;
    try {
      const { loadWorld, mountGeo } = await import('./radar/geo');
      const world = await loadWorld();
      if (!document.body.contains(host)) return;
      const cat = state.geoCategory || ind.geography.categories[0];
      const entries = ind.geography.leaders[cat] ?? [];
      geoHandle = mountGeo(host, world, entries, geoView, highlightGeoRow);
    } catch {
      host.innerHTML = `<p class="text-sm text-mist">The map could not be loaded. The ranking list on the right still shows the full picture.</p>`;
    }
  }

  function highlightGeoRow(place: string | null) {
    document.querySelectorAll<HTMLElement>('[data-geo-row]').forEach((row) => {
      const match = place !== null && row.dataset.geoRow === place;
      row.style.background = match ? 'rgba(255,255,255,0.1)' : '';
    });
  }

  /* ------------------------------------------------------------------- bind */

  function bind() {
    root!.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
      const action = el.dataset.action!;
      const isOverlay = action === 'close-modal' || action === 'close-palette';

      el.addEventListener('click', (ev) => {
        // Overlay backdrops dismiss only when the backdrop itself is clicked.
        if (isOverlay && (ev.target as HTMLElement).closest('[data-stop]')) return;
        ev.stopPropagation();
        handle(action, el);
      });

      if (el.tagName === 'G') {
        el.addEventListener('keydown', (ev) => {
          const k = (ev as KeyboardEvent).key;
          if (k === 'Enter' || k === ' ') {
            ev.preventDefault();
            handle(action, el);
          }
        });
      }
    });

    const search = document.getElementById('radar-search') as HTMLInputElement | null;
    search?.addEventListener('input', () => setState({ search: search.value }, { refocusSearch: true }));

    const quad = document.getElementById('radar-quadrant') as HTMLSelectElement | null;
    quad?.addEventListener('change', () =>
      setState({ quadrant: quad.value === 'all' ? 'all' : (Number(quad.value) as QuadrantId) })
    );

    const ring = document.getElementById('radar-ring') as HTMLSelectElement | null;
    ring?.addEventListener('change', () => setState({ ring: ring.value as Ring | 'all' }));

    const palette = document.getElementById('palette-input') as HTMLInputElement | null;
    if (palette) {
      palette.focus();
      palette.setSelectionRange(palette.value.length, palette.value.length);
      palette.addEventListener('input', () => {
        paletteQuery = palette.value;
        paletteIndex = 0;
        render();
      });
    }
  }

  function handle(action: string, el: HTMLElement) {
    switch (action) {
      case 'industry':
        state = {
          ...state,
          industrySlug: el.dataset.slug!,
          selectedId: null,
          search: '',
          quadrant: 'all',
          ring: 'all',
          geoCategory: '',
        };
        syncPosition();
        writeStateToUrl(state, DEFAULT_INDUSTRY_SLUG);
        render();
        break;
      case 'tab':
        setState({ tab: el.dataset.tab as Tab, selectedId: null });
        break;
      case 'select-tech':
        setState({ selectedId: Number(el.dataset.id) });
        break;
      case 'close-modal':
        setState({ selectedId: null });
        break;
      case 'reset-filters':
        setState({ search: '', quadrant: 'all', ring: 'all' });
        break;
      case 'geo-cat':
        setState({ geoCategory: el.dataset.cat! });
        break;
      case 'geo-view':
        geoView = el.dataset.view as GeoView;
        render();
        break;
      case 'compare':
        setState({ tab: 'compare', compareKey: el.dataset.key!, selectedId: null });
        break;
      case 'clear-compare':
        setState({ compareKey: null });
        break;
      case 'goto-tech':
        state = { ...state, industrySlug: el.dataset.slug!, tab: 'radar', selectedId: Number(el.dataset.id) };
        syncPosition();
        writeStateToUrl(state, DEFAULT_INDUSTRY_SLUG);
        render();
        break;
      case 'set-stance': {
        const id = Number(el.dataset.id);
        const stance = el.dataset.stance as Stance | '';
        if (stance) position[id] = stance;
        else delete position[id];
        savePosition(state.industrySlug, position);
        render();
        break;
      }
      case 'reset-position':
        position = {};
        clearPosition(state.industrySlug);
        flash('Your position has been cleared');
        break;
      case 'share':
        copy(shareUrlFor(state, DEFAULT_INDUSTRY_SLUG), 'Link copied to clipboard');
        break;
      case 'role':
        setState({ role: el.dataset.role! });
        break;
      case 'clear-role':
        setState({ role: null });
        break;
      case 'export-csv': {
        const ind = industry();
        download(`radar-${ind.slug}-${ind.edition.published}.csv`, toCsv(ind), 'text/csv;charset=utf-8');
        flash('CSV downloaded');
        break;
      }
      case 'export-json': {
        const ind = industry();
        download(`radar-${ind.slug}-${ind.edition.published}.json`, toJson(ind), 'application/json');
        flash('JSON downloaded');
        break;
      }
      case 'print':
        window.print();
        break;
      case 'share-position': {
        const base = shareUrlFor({ ...state, tab: 'position' }, DEFAULT_INDUSTRY_SLUG);
        copy(`${base}${base.includes('?') ? '&' : '?'}pos=${encodePosition(position)}`, 'Shareable position link copied');
        break;
      }
      case 'open-palette':
        paletteOpen = true;
        paletteQuery = '';
        paletteIndex = 0;
        render();
        break;
      case 'close-palette':
        paletteOpen = false;
        render();
        break;
      case 'palette-go':
        paletteOpen = false;
        state = { ...state, industrySlug: el.dataset.slug!, tab: 'radar', selectedId: Number(el.dataset.id) };
        syncPosition();
        writeStateToUrl(state, DEFAULT_INDUSTRY_SLUG);
        render();
        break;
    }
  }

  function copy(text: string, message: string) {
    navigator.clipboard?.writeText(text).then(
      () => flash(message),
      () => flash('Copy failed — your browser blocked clipboard access')
    );
  }

  /* ------------------------------------------------------- global shortcuts */

  document.addEventListener('keydown', (ev) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      paletteOpen = !paletteOpen;
      paletteQuery = '';
      paletteIndex = 0;
      render();
      return;
    }
    if (ev.key === 'Escape') {
      if (paletteOpen) {
        paletteOpen = false;
        render();
      } else if (state.selectedId != null) {
        setState({ selectedId: null });
      }
      return;
    }
    if (!paletteOpen) return;

    const items = paletteItems();
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      paletteIndex = Math.min(paletteIndex + 1, items.length - 1);
      render();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      paletteIndex = Math.max(paletteIndex - 1, 0);
      render();
    } else if (ev.key === 'Enter') {
      const pick = items[paletteIndex];
      if (!pick) return;
      ev.preventDefault();
      paletteOpen = false;
      state = { ...state, industrySlug: pick.industry.slug, tab: 'radar', selectedId: pick.tech.id };
      syncPosition();
      writeStateToUrl(state, DEFAULT_INDUSTRY_SLUG);
      render();
    }
  });

  /* -------------------------------------------------------------------- boot */

  syncPosition();
  if (sharedPos) {
    position = { ...position, ...decodePosition(sharedPos) };
    savePosition(state.industrySlug, position);
  }
  render();
}
