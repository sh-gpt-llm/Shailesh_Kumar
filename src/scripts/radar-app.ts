import { INDUSTRIES, DEFAULT_INDUSTRY_SLUG } from '../data/radar/industries';
import { QUADRANTS, RINGS, MOMENTUM } from '../data/radar/types';
import type { IndustryRadar, Technology, Ring, QuadrantId } from '../data/radar/types';

type Tab = 'radar' | 'list' | 'ecosystem' | 'functions' | 'geography';

interface State {
  industrySlug: string;
  tab: Tab;
  search: string;
  quadrant: QuadrantId | 'all';
  ring: Ring | 'all';
  selectedId: number | null;
  showGuide: boolean;
  geoCategory: string;
}

const ringOrder: Ring[] = ['adopt', 'trial', 'assess', 'hold'];
const ringBand: Record<Ring, [number, number]> = {
  adopt: [0.1, 0.32],
  trial: [0.32, 0.56],
  assess: [0.56, 0.8],
  hold: [0.8, 0.98],
};
const quadrantAngle: Record<QuadrantId, [number, number]> = {
  1: [270, 360],
  2: [0, 90],
  3: [90, 180],
  4: [180, 270],
};

function hashSeed(id: number): number {
  const x = Math.sin(id * 999.37) * 10000;
  return x - Math.floor(x);
}

function momentumGlyph(m: string): string {
  return MOMENTUM.find((x) => x.id === m)?.glyph ?? '—';
}
function momentumLabel(m: string): string {
  return MOMENTUM.find((x) => x.id === m)?.label ?? m;
}
function ringLabel(r: string): string {
  return RINGS.find((x) => x.id === r)?.label ?? r;
}
function quadrantName(q: QuadrantId): string {
  return QUADRANTS.find((x) => x.id === q)?.name ?? '';
}
function quadrantCode(q: QuadrantId): string {
  return QUADRANTS.find((x) => x.id === q)?.code ?? '';
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export function initRadarApp() {
  const root = document.getElementById('radar-app');
  if (!root) return;

  const state: State = {
    industrySlug: DEFAULT_INDUSTRY_SLUG,
    tab: 'radar',
    search: '',
    quadrant: 'all',
    ring: 'all',
    selectedId: null,
    showGuide: false,
    geoCategory: '',
  };

  function industry(): IndustryRadar {
    return INDUSTRIES.find((i) => i.slug === state.industrySlug) ?? INDUSTRIES[0];
  }

  function filteredTech(ind: IndustryRadar): Technology[] {
    const q = state.search.trim().toLowerCase();
    return ind.technologies.filter((t) => {
      if (state.quadrant !== 'all' && t.quadrant !== state.quadrant) return false;
      if (state.ring !== 'all' && t.ring !== state.ring) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.summary.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function render() {
    const ind = industry();
    if (!state.geoCategory) state.geoCategory = ind.geography.categories[0];
    root!.innerHTML = `
      ${renderIndustryPicker(ind)}
      ${renderHero(ind)}
      ${renderThemes(ind)}
      ${renderTabs()}
      ${renderControls(ind)}
      <div class="mx-auto max-w-6xl px-6">
        ${state.tab === 'radar' ? renderRadarTab(ind) : ''}
        ${state.tab === 'list' ? renderListTab(ind) : ''}
        ${state.tab === 'ecosystem' ? renderEcosystemTab(ind) : ''}
        ${state.tab === 'functions' ? renderFunctionsTab(ind) : ''}
        ${state.tab === 'geography' ? renderGeographyTab(ind) : ''}
      </div>
      ${renderEditorsNote(ind)}
      ${renderWatchlist(ind)}
      ${renderMethodology()}
      ${renderDetailModal(ind)}
    `;
    attachEvents(ind);
  }

  function renderIndustryPicker(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 pt-16">
        <p class="reveal is-visible text-xs font-semibold uppercase tracking-[0.4em] text-cyan-400">Select an industry</p>
        <div class="mt-5 flex flex-wrap gap-3">
          ${INDUSTRIES.map(
            (i) => `
            <button data-action="industry" data-slug="${i.slug}" class="rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              i.slug === ind.slug
                ? 'border-transparent bg-gradient-to-r from-violet-500 to-cyan-400 text-ink'
                : 'border-white/10 bg-white/5 text-mist hover:text-white hover:border-white/30'
            }">${i.name}</button>`
          ).join('')}
        </div>
      </section>
    `;
  }

  function renderHero(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-amber-400">Emerging Technology &amp; Innovation Radar</p>
        <h1 class="mt-4 font-display text-3xl font-semibold text-white sm:text-5xl">
          <span class="gradient-text">${escapeHtml(ind.name)}</span> — where to place your next bet.
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-mist">${escapeHtml(ind.tagline)}</p>
        <p class="mt-4 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-mist">${escapeHtml(ind.scope)}</p>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          ${ind.heroStat
            .map(
              (s) => `
            <div class="glass rounded-2xl p-4 text-center">
              <div class="font-display text-2xl font-bold text-white">${escapeHtml(s.value)}</div>
              <div class="mt-1 text-xs uppercase tracking-wide text-mist">${escapeHtml(s.label)}</div>
            </div>`
            )
            .join('')}
        </div>
      </section>
    `;
  }

  function renderThemes(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 py-6">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Themes of this edition</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          ${ind.themes
            .map(
              (t) => `
            <div class="glass glow-border rounded-2xl p-5">
              <h3 class="font-display text-base font-semibold text-white">${escapeHtml(t.title)}</h3>
              <p class="mt-2 text-sm leading-relaxed text-mist">${escapeHtml(t.description)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>
    `;
  }

  function renderTabs() {
    const tabs: { id: Tab; label: string; hint: string }[] = [
      { id: 'radar', label: 'Radar', hint: 'The classic quadrant/ring visualisation of every technology' },
      { id: 'list', label: 'List', hint: 'Every technology as one index, grouped by quadrant and ring' },
      { id: 'ecosystem', label: 'Ecosystem', hint: 'The vendors and platforms building in this space' },
      { id: 'functions', label: 'By Function', hint: 'The radar seen through each business function\'s lens' },
      { id: 'geography', label: 'Geography', hint: 'Where capability concentrates around the world' },
    ];
    return `
      <section class="sticky top-[73px] z-30 -mx-6 border-y border-white/5 bg-ink/80 px-6 py-4 backdrop-blur-xl">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div class="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            ${tabs
              .map(
                (t) => `
              <button data-action="tab" data-tab="${t.id}" title="${escapeHtml(t.hint)}" class="rounded-lg px-4 py-2 text-sm font-semibold transition ${
                state.tab === t.id ? 'bg-white text-ink' : 'text-mist hover:text-white'
              }">${t.label}</button>`
              )
              .join('')}
          </div>
          <button data-action="guide" class="glow-border flex h-9 w-9 items-center justify-center rounded-xl text-amber-400 ${
            state.showGuide ? 'bg-amber-400/10' : ''
          }" title="Tab guide">⚡</button>
          ${state.showGuide ? `<p class="text-xs text-mist">${escapeHtml(tabs.find((t) => t.id === state.tab)?.hint ?? '')}</p>` : ''}
        </div>
      </section>
    `;
  }

  function renderControls(ind: IndustryRadar) {
    if (state.tab !== 'radar' && state.tab !== 'list') return '';
    return `
      <section class="mx-auto max-w-6xl px-6 py-5">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[220px]">
            <input id="radar-search" type="text" value="${escapeHtml(state.search)}" placeholder="Search ${ind.technologies.length} technologies..." class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-mist/60 focus:border-violet-400 focus:outline-none" />
          </div>
          <select id="radar-quadrant" class="rounded-xl border border-white/10 bg-ink-soft px-3 py-2.5 text-sm text-white">
            <option value="all" ${state.quadrant === 'all' ? 'selected' : ''}>All quadrants</option>
            ${QUADRANTS.map((q) => `<option value="${q.id}" ${state.quadrant === q.id ? 'selected' : ''}>${escapeHtml(q.name)}</option>`).join('')}
          </select>
          <select id="radar-ring" class="rounded-xl border border-white/10 bg-ink-soft px-3 py-2.5 text-sm text-white">
            <option value="all" ${state.ring === 'all' ? 'selected' : ''}>All rings</option>
            ${RINGS.map((r) => `<option value="${r.id}" ${state.ring === r.id ? 'selected' : ''}>${escapeHtml(r.label)}</option>`).join('')}
          </select>
          ${
            state.quadrant !== 'all' || state.ring !== 'all' || state.search
              ? `<button data-action="reset-filters" class="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-mist hover:text-white">Reset</button>`
              : ''
          }
        </div>
      </section>
    `;
  }

  function renderRadarTab(ind: IndustryRadar) {
    const items = filteredTech(ind);
    const size = 640;
    const cx = size / 2;
    const cy = size / 2;
    const R = size / 2 - 30;

    const dots = items
      .map((t) => {
        const [a0, a1] = quadrantAngle[t.quadrant];
        const [r0, r1] = ringBand[t.ring];
        const seed = hashSeed(t.id);
        const seed2 = hashSeed(t.id * 7 + 3);
        const angle = a0 + 6 + seed * (a1 - a0 - 12);
        const radius = (r0 + 0.08 + seed2 * (r1 - r0 - 0.16)) * R;
        const rad = (angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);
        const isPick = ind.editorsPicks.includes(t.id);
        return `
          <g data-action="select-tech" data-id="${t.id}" class="cursor-pointer group" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
            <circle r="${isPick ? 13 : 10}" class="fill-ink-soft stroke-2 transition group-hover:fill-violet-500" stroke="${isPick ? '#f59e0b' : '#7c3aed'}" />
            <text text-anchor="middle" dy="4" class="select-none fill-white font-display" style="font-size:${isPick ? 10 : 9}px">${t.id}</text>
            ${t.momentum === 'accelerating' ? `<text x="-14" y="-10" class="fill-emerald-400" style="font-size:10px">▲</text>` : ''}
            ${t.momentum === 'cooling' ? `<text x="-14" y="-10" class="fill-rose-400" style="font-size:10px">▼</text>` : ''}
          </g>
        `;
      })
      .join('');

    const ringCircles = ringOrder
      .map((r, i) => {
        const [, r1] = ringBand[r];
        const radius = r1 * R;
        const opacity = 0.05 + i * 0.03;
        return `<circle cx="${cx}" cy="${cy}" r="${radius.toFixed(1)}" fill="#fff" opacity="${opacity}" />`;
      })
      .reverse()
      .join('');

    const ringLabels = ringOrder
      .map((r) => {
        const [r0, r1] = ringBand[r];
        const radius = ((r0 + r1) / 2) * R;
        return `<text x="${cx + radius}" y="${cy - 4}" class="fill-mist" style="font-size:9px;letter-spacing:1px">${ringLabel(r).toUpperCase()}</text>`;
      })
      .join('');

    return `
      <div class="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div class="glass rounded-3xl p-4 sm:p-8">
          <div class="mb-4 flex items-center justify-between text-sm">
            <span class="font-display font-semibold text-white">Q04 <em class="not-italic text-mist">${escapeHtml(quadrantName(4))}</em></span>
            <span class="font-display font-semibold text-white"><em class="not-italic text-mist">${escapeHtml(quadrantName(1))}</em> Q01</span>
          </div>
          <svg viewBox="0 0 ${size} ${size}" class="mx-auto w-full max-w-2xl">
            <line x1="${cx}" y1="0" x2="${cx}" y2="${size}" stroke="#ffffff" stroke-opacity="0.08" />
            <line x1="0" y1="${cy}" x2="${size}" y2="${cy}" stroke="#ffffff" stroke-opacity="0.08" />
            ${ringCircles}
            ${ringLabels}
            ${dots}
          </svg>
          <div class="mt-4 flex items-center justify-between text-sm">
            <span class="font-display font-semibold text-white">Q03 <em class="not-italic text-mist">${escapeHtml(quadrantName(3))}</em></span>
            <span class="font-display font-semibold text-white"><em class="not-italic text-mist">${escapeHtml(quadrantName(2))}</em> Q02</span>
          </div>
          <p class="mt-6 text-center text-xs text-mist">${items.length} of ${ind.technologies.length} technologies shown · click a dot for the full brief</p>
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
                <span>${t.id.toString().padStart(2, '0')}</span>
                <span>${momentumGlyph(t.momentum)} ${escapeHtml(momentumLabel(t.momentum))}</span>
              </div>
              <div class="mt-1 text-sm font-semibold text-white">${escapeHtml(t.name)}</div>
            </button>`
            )
            .join('')}
        </aside>
      </div>
    `;
  }

  function techCard(t: Technology) {
    return `
      <button data-action="select-tech" data-id="${t.id}" class="glass rounded-xl p-4 text-left transition hover:bg-white/10">
        <div class="flex items-center justify-between text-xs text-mist">
          <span>${t.id.toString().padStart(2, '0')}</span>
          <span>${momentumGlyph(t.momentum)} ${escapeHtml(momentumLabel(t.momentum))}</span>
        </div>
        <div class="mt-1.5 text-sm font-semibold text-white">${escapeHtml(t.name)}</div>
        <p class="mt-1.5 text-xs italic leading-relaxed text-mist line-clamp-2">${escapeHtml(t.summary)}</p>
      </button>
    `;
  }

  function renderListTab(ind: IndustryRadar) {
    const items = filteredTech(ind);
    const groups = QUADRANTS.map((q) => {
      const qItems = items.filter((t) => t.quadrant === q.id);
      if (!qItems.length) return '';
      const rings = ringOrder
        .map((r) => {
          const rItems = qItems.filter((t) => t.ring === r);
          if (!rItems.length) return '';
          return `
            <div class="mt-4">
              <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mist">
                <span class="h-2 w-2 rounded-full bg-violet-400"></span> ${escapeHtml(ringLabel(r))} <span class="text-mist/60">${rItems.length}</span>
              </div>
              <div class="mt-2 grid gap-2 sm:grid-cols-2">${rItems.map((t) => techCard(t)).join('')}</div>
            </div>
          `;
        })
        .join('');
      return `
        <div class="mt-8 border-t border-white/10 pt-6 first:mt-0 first:border-0 first:pt-0">
          <div class="flex items-baseline justify-between">
            <h3 class="font-display text-xl font-semibold text-white"><span class="text-mist">${q.code}</span> ${escapeHtml(q.name)}</h3>
            <span class="text-sm text-mist">${qItems.length}</span>
          </div>
          ${rings}
        </div>
      `;
    }).join('');
    return `<div class="pb-10"><p class="text-lg italic text-mist">The complete radar · <strong class="text-white">${items.length}</strong> technologies, by quadrant &amp; ring</p>${groups}</div>`;
  }

  function renderEcosystemTab(ind: IndustryRadar) {
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
              <div class="flex items-center justify-between">
                <h4 class="font-display text-sm font-semibold text-white">${escapeHtml(m.title)}</h4>
                <span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">${escapeHtml(m.horizon)}</span>
              </div>
              <p class="mt-2 text-xs leading-relaxed text-mist">${escapeHtml(m.description)}</p>
            </div>`
            )
            .join('')}
        </div>
        <h3 class="mt-10 font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Footprint</h3>
        <div class="mt-4 space-y-2">
          ${ind.ecosystem
            .map((e) => {
              const total = (Object.values(e.mix) as number[]).reduce((a, b) => a + b, 0) || 1;
              const bars = (['adopt', 'trial', 'assess', 'hold'] as Ring[])
                .map((r) => {
                  const v = e.mix[r] ?? 0;
                  const pct = (v / total) * 100;
                  const colors: Record<Ring, string> = { adopt: '#7c3aed', trial: '#06b6d4', assess: '#f59e0b', hold: '#64748b' };
                  return pct > 0 ? `<span style="width:${pct}%;background:${colors[r]}" title="${ringLabel(r)}: ${v}"></span>` : '';
                })
                .join('');
              return `
              <div class="glass flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-center sm:gap-4">
                <div class="flex items-center gap-3 sm:w-56 shrink-0">
                  <span class="text-xs text-mist">${e.rank.toString().padStart(2, '0')}</span>
                  <span class="font-semibold text-white">${escapeHtml(e.name)}</span>
                  <span class="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-mist">${escapeHtml(e.posture)}</span>
                </div>
                <div class="flex h-2 flex-1 overflow-hidden rounded-full bg-white/5">${bars}</div>
                <p class="text-xs text-mist sm:w-72 shrink-0">${escapeHtml(e.note)}</p>
              </div>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function renderFunctionsTab(ind: IndustryRadar) {
    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">The radar, through each function's lens.</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${ind.functions
            .map((f) => {
              const total = (Object.values(f.mix) as number[]).reduce((a, b) => a + b, 0) || 1;
              const bars = (['adopt', 'trial', 'assess', 'hold'] as Ring[])
                .map((r) => {
                  const v = f.mix[r] ?? 0;
                  const pct = (v / total) * 100;
                  const colors: Record<Ring, string> = { adopt: '#7c3aed', trial: '#06b6d4', assess: '#f59e0b', hold: '#64748b' };
                  return pct > 0 ? `<span style="width:${pct}%;background:${colors[r]}" title="${ringLabel(r)}: ${v}"></span>` : '';
                })
                .join('');
              return `
              <div class="glass glow-border rounded-2xl p-5">
                <div class="flex items-center justify-between">
                  <h3 class="font-display text-base font-semibold text-white">${escapeHtml(f.name)}</h3>
                  <span class="text-xs text-amber-300">+${f.newCount} new</span>
                </div>
                <p class="mt-2 text-xs text-mist">${escapeHtml(f.description)}</p>
                <span class="mt-3 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-mist">${escapeHtml(f.posture)}</span>
                <div class="mt-3 flex h-2 overflow-hidden rounded-full bg-white/5">${bars}</div>
              </div>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function renderGeographyTab(ind: IndustryRadar) {
    const leaders = ind.geography.leaders[state.geoCategory] ?? [];
    const max = Math.max(...leaders.map((l) => l.score), 1);
    return `
      <div class="pb-10">
        <h2 class="font-display text-2xl font-semibold text-white">Where it concentrates around the world.</h2>
        <div class="mt-5 flex flex-wrap gap-2">
          ${ind.geography.categories
            .map(
              (c) => `
            <button data-action="geo-cat" data-cat="${escapeHtml(c)}" class="rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              state.geoCategory === c ? 'border-transparent bg-white text-ink' : 'border-white/10 text-mist hover:text-white'
            }">${escapeHtml(c)}</button>`
            )
            .join('')}
        </div>
        <div class="mt-6 space-y-2">
          ${leaders
            .map(
              (l) => `
            <div class="flex items-center gap-4">
              <span class="w-6 shrink-0 text-xs text-mist">${l.rank}</span>
              <span class="w-36 shrink-0 text-sm text-white">${escapeHtml(l.place)}</span>
              <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style="width:${(l.score / max) * 100}%"></div>
              </div>
              <span class="w-8 shrink-0 text-right text-xs text-mist">${l.score}</span>
            </div>`
            )
            .join('')}
        </div>
        <p class="mt-4 text-xs text-mist">Editorial, directional read — relative signal, not a precise index.</p>
      </div>
    `;
  }

  function renderEditorsNote(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 py-10">
        <div class="glass glow-border rounded-3xl p-6 sm:p-8">
          <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">Editor's note</h2>
          <p class="mt-3 text-base leading-relaxed text-mist">${escapeHtml(ind.editorsNote)}</p>
        </div>
      </section>
    `;
  }

  function renderWatchlist(ind: IndustryRadar) {
    return `
      <section class="mx-auto max-w-6xl px-6 py-10">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">On the periphery — watchlist</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${ind.watchlist
            .map(
              (w) => `
            <div class="rounded-xl border border-dashed border-white/15 p-4">
              <h3 class="font-display text-sm font-semibold text-white">${escapeHtml(w.name)}</h3>
              <p class="mt-1.5 text-xs leading-relaxed text-mist">${escapeHtml(w.blurb)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>
    `;
  }

  function renderMethodology() {
    return `
      <section class="mx-auto max-w-6xl px-6 py-10">
        <h2 class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-mist">Methodology</h2>
        <div class="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Rings</h3>
            <ul class="mt-2 space-y-1.5 text-sm text-mist">
              <li><strong class="text-white">Adopt</strong> — proven, low-risk, invest now.</li>
              <li><strong class="text-white">Trial</strong> — worth piloting in a real project.</li>
              <li><strong class="text-white">Assess</strong> — worth understanding, not yet committing.</li>
              <li><strong class="text-white">Hold</strong> — proceed with caution, or de-prioritise.</li>
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Quadrants</h3>
            <ul class="mt-2 space-y-1.5 text-sm text-mist">
              ${QUADRANTS.map((q) => `<li><strong class="text-white">${escapeHtml(q.name)}</strong></li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-cyan-400">Market momentum</h3>
            <ul class="mt-2 space-y-1.5 text-sm text-mist">
              ${MOMENTUM.map((m) => `<li>${m.glyph} <strong class="text-white">${escapeHtml(m.label)}</strong></li>`).join('')}
            </ul>
          </div>
        </div>
        <p class="mt-8 text-xs text-mist/70">An independent, industry-agnostic radar curated by Shailesh Kumar. Not affiliated with, and containing no confidential information from, any employer.</p>
      </section>
    `;
  }

  function renderDetailModal(ind: IndustryRadar) {
    if (state.selectedId == null) return '';
    const t = ind.technologies.find((x) => x.id === state.selectedId);
    if (!t) return '';
    return `
      <div data-action="close-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div class="glow-border glass max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl p-7" onclick="event.stopPropagation()">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-white/10 px-2.5 py-1 text-mist">${t.id.toString().padStart(2, '0')}</span>
                <span class="rounded-full bg-violet-500/20 px-2.5 py-1 text-violet-200">${escapeHtml(quadrantCode(t.quadrant))} · ${escapeHtml(quadrantName(t.quadrant))}</span>
                <span class="rounded-full bg-cyan-500/20 px-2.5 py-1 text-cyan-200">${escapeHtml(ringLabel(t.ring))}</span>
                <span class="rounded-full bg-amber-500/20 px-2.5 py-1 text-amber-200">${momentumGlyph(t.momentum)} ${escapeHtml(momentumLabel(t.momentum))}</span>
              </div>
              <h3 class="mt-3 font-display text-2xl font-semibold text-white">${escapeHtml(t.name)}</h3>
              <p class="mt-1 text-sm italic text-mist">${escapeHtml(t.summary)}</p>
            </div>
            <button data-action="close-modal" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">✕</button>
          </div>
          <p class="mt-5 text-sm leading-relaxed text-mist">${escapeHtml(t.brief)}</p>
          <div class="mt-5 flex flex-wrap items-center gap-2 text-xs text-mist">
            <span class="rounded-full border border-white/10 px-2.5 py-1">Time horizon: ${escapeHtml(t.timeHorizon)}</span>
            ${t.tags.map((tag) => `<span class="rounded-full border border-white/10 px-2.5 py-1">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function attachEvents(ind: IndustryRadar) {
    root!.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
      const action = el.dataset.action;
      el.addEventListener('click', (e) => {
        if (action === 'industry') {
          state.industrySlug = el.dataset.slug!;
          state.selectedId = null;
          state.tab = 'radar';
          state.search = '';
          state.quadrant = 'all';
          state.ring = 'all';
          state.geoCategory = '';
          render();
        } else if (action === 'tab') {
          state.tab = el.dataset.tab as Tab;
          render();
        } else if (action === 'guide') {
          state.showGuide = !state.showGuide;
          render();
        } else if (action === 'select-tech') {
          state.selectedId = Number(el.dataset.id);
          render();
        } else if (action === 'close-modal' && e.target === el) {
          state.selectedId = null;
          render();
        } else if (action === 'reset-filters') {
          state.search = '';
          state.quadrant = 'all';
          state.ring = 'all';
          render();
        } else if (action === 'geo-cat') {
          state.geoCategory = el.dataset.cat!;
          render();
        }
      });
    });

    const searchInput = document.getElementById('radar-search') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      state.search = searchInput.value;
      renderListOrRadarOnly();
    });
    const quadrantSelect = document.getElementById('radar-quadrant') as HTMLSelectElement | null;
    quadrantSelect?.addEventListener('change', () => {
      state.quadrant = (quadrantSelect.value === 'all' ? 'all' : Number(quadrantSelect.value)) as QuadrantId | 'all';
      render();
    });
    const ringSelect = document.getElementById('radar-ring') as HTMLSelectElement | null;
    ringSelect?.addEventListener('change', () => {
      state.ring = ringSelect.value as Ring | 'all';
      render();
    });
  }

  // Re-render while preserving input focus/cursor for a smoother typing experience.
  function renderListOrRadarOnly() {
    render();
    const input = document.getElementById('radar-search') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  render();
}
