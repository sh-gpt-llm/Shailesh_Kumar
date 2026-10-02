import { geoOrthographic, geoNaturalEarth1, geoPath, geoGraticule, geoCircle } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeographyEntry } from '../../data/radar/types';

export type GeoView = 'globe' | 'map';

// The radar uses common short names; the boundary data uses formal ones.
const NAME_ALIASES: Record<string, string> = {
  'United States': 'United States of America',
  UAE: 'United Arab Emirates',
};

// City-states have no polygon at 110m resolution, so they are drawn as markers.
const CITY_STATES: Record<string, [number, number]> = {
  Singapore: [103.82, 1.35],
  'Hong Kong': [114.17, 22.32],
};

const LAND_FILL = '#2f4b36';
const LAND_STROKE = 'rgba(8,23,38,0.75)';

const KEY_PARALLELS: { lat: number; label: string }[] = [
  { lat: 66.56, label: 'Arctic Circle' },
  { lat: 23.44, label: 'Tropic of Cancer' },
  { lat: 0, label: 'Equator' },
  { lat: -23.44, label: 'Tropic of Capricorn' },
  { lat: -66.56, label: 'Antarctic Circle' },
];

interface WorldData {
  countries: FeatureCollection<Geometry, { name: string }>;
}

let worldCache: WorldData | null = null;

export async function loadWorld(): Promise<WorldData> {
  if (worldCache) return worldCache;
  const topo = (await import('world-atlas/countries-110m.json')).default as never;
  const countries = feature(
    topo,
    (topo as { objects: { countries: unknown } }).objects.countries as never
  ) as unknown as FeatureCollection<Geometry, { name: string }>;
  worldCache = { countries };
  return worldCache;
}

const scoreColor = (ratio: number) => {
  const stops: [number, number, number][] = [
    [94, 234, 212],
    [34, 211, 238],
    [124, 58, 237],
  ];
  const t = Math.max(0, Math.min(1, ratio));
  const seg = t < 0.5 ? 0 : 1;
  const local = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const [a, b] = [stops[seg], stops[seg + 1]];
  const mix = a.map((v, i) => Math.round(v + (b[i] - v) * local));
  return `rgb(${mix[0]},${mix[1]},${mix[2]})`;
};

const fmtLat = (lat: number) => `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
const fmtLon = (lon: number) => {
  const wrapped = ((lon + 540) % 360) - 180;
  return `${Math.abs(wrapped).toFixed(1)}°${wrapped >= 0 ? 'E' : 'W'}`;
};

export interface GlobeHandle {
  destroy: () => void;
}

export function mountGeo(
  el: HTMLElement,
  world: WorldData,
  entries: GeographyEntry[],
  view: GeoView,
  onSelect: (place: string | null) => void
): GlobeHandle {
  const size = 560;
  const height = view === 'globe' ? size : size * 0.62;
  const baseScale = size / 2 - 16;
  const max = Math.max(...entries.map((e) => e.score), 1);
  const byMapName = new Map<string, GeographyEntry>();
  for (const e of entries) byMapName.set(NAME_ALIASES[e.place] ?? e.place, e);

  const projection =
    view === 'globe'
      ? geoOrthographic().scale(baseScale).translate([size / 2, size / 2]).clipAngle(90)
      : geoNaturalEarth1().fitSize([size, height], { type: 'Sphere' });

  const path = geoPath(projection);
  const graticule = geoGraticule().step([15, 15]);
  const svgNS = 'http://www.w3.org/2000/svg';

  const make = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string> = {}) => {
    const node = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };

  const wrap = document.createElement('div');
  wrap.className = 'relative mx-auto w-full max-w-[560px]';

  const svg = make('svg', {
    viewBox: `0 0 ${size} ${height}`,
    class: 'w-full touch-none select-none',
    role: 'img',
    'aria-label': 'World map of emerging technology capability',
  });
  if (view === 'globe') svg.style.cursor = 'grab';

  const defs = make('defs');
  defs.innerHTML =
    view === 'globe'
      ? `<radialGradient id="ocean" cx="35%" cy="28%" r="78%">
           <stop offset="0%" stop-color="#2d6ea8" />
           <stop offset="45%" stop-color="#17456e" />
           <stop offset="80%" stop-color="#0c2740" />
           <stop offset="100%" stop-color="#061520" />
         </radialGradient>
         <radialGradient id="atmosphere" cx="50%" cy="50%">
           <stop offset="72%" stop-color="rgba(56,189,248,0)" />
           <stop offset="94%" stop-color="rgba(56,189,248,0.22)" />
           <stop offset="100%" stop-color="rgba(56,189,248,0.5)" />
         </radialGradient>
         <radialGradient id="shade" cx="32%" cy="26%" r="80%">
           <stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
           <stop offset="55%" stop-color="rgba(255,255,255,0)" />
           <stop offset="100%" stop-color="rgba(0,0,0,0.45)" />
         </radialGradient>`
      : `<linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stop-color="#17456e" />
           <stop offset="100%" stop-color="#0b1726" />
         </linearGradient>`;
  svg.appendChild(defs);

  if (view === 'globe') {
    const stars = make('g', { 'pointer-events': 'none' });
    for (let i = 1; i <= 110; i++) {
      const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      const b = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1;
      const x = a * size;
      const y = b * height;
      if (Math.hypot(x - size / 2, y - height / 2) < baseScale + 16) continue;
      stars.appendChild(
        make('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (0.4 + a * 0.9).toFixed(2), fill: '#fff', opacity: (0.2 + b * 0.45).toFixed(2) })
      );
    }
    svg.appendChild(stars);
  }

  const sphere = make('path', { fill: 'url(#ocean)' });
  svg.appendChild(sphere);

  const fineGraticule = make('path', {
    fill: 'none',
    stroke: 'rgba(186,230,253,0.15)',
    'stroke-width': '0.45',
    'pointer-events': 'none',
  });
  svg.appendChild(fineGraticule);

  const countryNodes: { node: SVGPathElement; f: Feature<Geometry, { name: string }> }[] = [];
  for (const f of world.countries.features) {
    const entry = byMapName.get(f.properties.name);
    const node = make('path', {
      fill: entry ? scoreColor(entry.score / max) : LAND_FILL,
      stroke: LAND_STROKE,
      'stroke-width': '0.4',
    });
    if (entry) {
      node.style.cursor = 'pointer';
      node.addEventListener('mouseenter', () => onSelect(entry.place));
      node.addEventListener('mouseleave', () => onSelect(null));
      node.addEventListener('click', () => onSelect(entry.place));
      const title = make('title');
      title.textContent = `${entry.place} · ${entry.score}`;
      node.appendChild(title);
    }
    countryNodes.push({ node, f });
    svg.appendChild(node);
  }

  const parallelNodes = KEY_PARALLELS.map(({ lat, label }) => ({
    lat,
    label,
    node: make('path', {
      fill: 'none',
      stroke: lat === 0 ? 'rgba(251,191,36,0.8)' : 'rgba(186,230,253,0.42)',
      'stroke-width': lat === 0 ? '1.1' : '0.7',
      'stroke-dasharray': lat === 0 ? '' : '3 3',
      'pointer-events': 'none',
    }),
  }));
  for (const p of parallelNodes) svg.appendChild(p.node);

  const meridian = make('path', {
    fill: 'none',
    stroke: 'rgba(251,191,36,0.5)',
    'stroke-width': '0.9',
    'pointer-events': 'none',
  });
  svg.appendChild(meridian);

  const labelLayer = make('g', { 'pointer-events': 'none' });
  svg.appendChild(labelLayer);

  const markerNodes: { node: SVGGElement; coords: [number, number] }[] = [];
  for (const [place, coords] of Object.entries(CITY_STATES)) {
    const entry = entries.find((e) => e.place === place);
    if (!entry) continue;
    const colour = scoreColor(entry.score / max);
    const g = make('g', { style: 'cursor:pointer' });
    g.appendChild(make('circle', { r: '6.5', fill: 'none', stroke: colour, 'stroke-width': '1', opacity: '0.55' }));
    g.appendChild(make('circle', { r: '3.4', fill: colour, stroke: '#061520', 'stroke-width': '1.2' }));
    const title = make('title');
    title.textContent = `${entry.place} · ${entry.score}`;
    g.appendChild(title);
    g.addEventListener('mouseenter', () => onSelect(entry.place));
    g.addEventListener('mouseleave', () => onSelect(null));
    g.addEventListener('click', () => onSelect(entry.place));
    markerNodes.push({ node: g, coords });
    svg.appendChild(g);
  }

  if (view === 'globe') {
    svg.appendChild(make('circle', { cx: String(size / 2), cy: String(size / 2), r: String(baseScale), fill: 'url(#shade)', 'pointer-events': 'none' }));
    svg.appendChild(make('circle', { cx: String(size / 2), cy: String(size / 2), r: String(baseScale + 7), fill: 'url(#atmosphere)', 'pointer-events': 'none' }));
  }

  wrap.appendChild(svg);

  const idleHint = view === 'globe' ? 'drag to rotate · scroll to zoom' : 'hover for coordinates';
  const readout = document.createElement('div');
  readout.className =
    'pointer-events-none absolute bottom-2 left-2 rounded-lg bg-ink/80 px-2.5 py-1 font-mono text-[11px] text-cyan-200 backdrop-blur';
  readout.textContent = idleHint;
  wrap.appendChild(readout);

  el.replaceChildren(wrap);

  const isFrontFacing = ([lon, lat]: [number, number]) => {
    if (view === 'map') return true;
    const r = projection.rotate();
    const toRad = Math.PI / 180;
    const c =
      Math.sin(-r[1] * toRad) * Math.sin(lat * toRad) +
      Math.cos(-r[1] * toRad) * Math.cos(lat * toRad) * Math.cos((lon + r[0]) * toRad);
    return c > 0;
  };

  const drawLabels = () => {
    labelLayer.replaceChildren();
    const centreLon = view === 'globe' ? -projection.rotate()[0] : 0;

    for (const { lat, label } of KEY_PARALLELS) {
      const coords: [number, number] = [centreLon, lat];
      if (!isFrontFacing(coords)) continue;
      const p = projection(coords);
      if (!p) continue;
      const text = make('text', {
        x: p[0].toFixed(1),
        y: (p[1] - 3.5).toFixed(1),
        'text-anchor': 'middle',
        fill: lat === 0 ? 'rgba(251,191,36,0.95)' : 'rgba(186,230,253,0.7)',
        style: 'font-size:7.5px;letter-spacing:0.6px',
      });
      text.textContent = lat === 0 ? label.toUpperCase() : `${label} ${fmtLat(lat)}`;
      labelLayer.appendChild(text);
    }

    for (let lon = -180; lon < 180; lon += 30) {
      const coords: [number, number] = [lon, 0];
      if (!isFrontFacing(coords)) continue;
      const p = projection(coords);
      if (!p) continue;
      const text = make('text', {
        x: p[0].toFixed(1),
        y: (p[1] + 9).toFixed(1),
        'text-anchor': 'middle',
        fill: 'rgba(186,230,253,0.55)',
        style: 'font-size:7px',
      });
      text.textContent = fmtLon(lon).replace('.0', '');
      labelLayer.appendChild(text);
    }
  };

  const meridianLine = {
    type: 'LineString',
    coordinates: Array.from({ length: 181 }, (_, i) => [0, -90 + i]),
  } as unknown as Feature;

  const redraw = () => {
    sphere.setAttribute('d', path({ type: 'Sphere' }) ?? '');
    fineGraticule.setAttribute('d', path(graticule()) ?? '');
    for (const { node, f } of countryNodes) node.setAttribute('d', path(f) ?? '');
    for (const p of parallelNodes) {
      const circle = geoCircle().center([0, 90]).radius(90 - p.lat).precision(1);
      p.node.setAttribute('d', path(circle()) ?? '');
    }
    meridian.setAttribute('d', path(meridianLine) ?? '');
    for (const { node, coords } of markerNodes) {
      const p = projection(coords);
      if (p && isFrontFacing(coords)) {
        node.setAttribute('transform', `translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`);
        node.setAttribute('opacity', '1');
      } else {
        node.setAttribute('opacity', '0');
      }
    }
    drawLabels();
  };

  let frame = 0;
  let dragging = false;
  let autoRotate = view === 'globe';
  let last: [number, number] = [0, 0];
  let rotation: [number, number] = [-20, -18];
  let zoom = 1;

  const showCoords = (ev: PointerEvent) => {
    const rect = svg.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * size;
    const y = ((ev.clientY - rect.top) / rect.height) * height;
    const inv = projection.invert?.([x, y]);
    readout.textContent =
      inv && Number.isFinite(inv[0]) && Number.isFinite(inv[1]) ? `${fmtLat(inv[1])}  ${fmtLon(inv[0])}` : idleHint;
  };

  if (view === 'globe') {
    projection.rotate(rotation);
    redraw();

    svg.addEventListener('pointerdown', (ev) => {
      dragging = true;
      autoRotate = false;
      last = [ev.clientX, ev.clientY];
      svg.style.cursor = 'grabbing';
      svg.setPointerCapture(ev.pointerId);
    });
    svg.addEventListener('pointermove', (ev) => {
      showCoords(ev);
      if (!dragging) return;
      const dx = ev.clientX - last[0];
      const dy = ev.clientY - last[1];
      last = [ev.clientX, ev.clientY];
      rotation = [rotation[0] + dx * 0.32, Math.max(-88, Math.min(88, rotation[1] - dy * 0.32))];
      projection.rotate(rotation);
      redraw();
    });
    const release = (ev: PointerEvent) => {
      dragging = false;
      svg.style.cursor = 'grab';
      try {
        svg.releasePointerCapture(ev.pointerId);
      } catch {
        /* already released */
      }
    };
    svg.addEventListener('pointerup', release);
    svg.addEventListener('pointercancel', release);
    svg.addEventListener('pointerleave', () => {
      readout.textContent = idleHint;
    });
    svg.addEventListener(
      'wheel',
      (ev) => {
        ev.preventDefault();
        zoom = Math.max(0.85, Math.min(3.2, zoom * (ev.deltaY > 0 ? 0.92 : 1.08)));
        projection.scale(baseScale * zoom);
        redraw();
      },
      { passive: false }
    );

    const tick = () => {
      if (autoRotate && !dragging) {
        rotation = [rotation[0] + 0.1, rotation[1]];
        projection.rotate(rotation);
        redraw();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  } else {
    redraw();
    svg.addEventListener('pointermove', showCoords);
    svg.addEventListener('pointerleave', () => {
      readout.textContent = idleHint;
    });
  }

  return {
    destroy: () => {
      if (frame) cancelAnimationFrame(frame);
      el.replaceChildren();
    },
  };
}
