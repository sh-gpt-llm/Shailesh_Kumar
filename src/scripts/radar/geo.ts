import { geoOrthographic, geoNaturalEarth1, geoPath, geoGraticule10, geoCentroid } from 'd3-geo';
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

interface WorldData {
  countries: FeatureCollection<Geometry, { name: string }>;
}

let worldCache: WorldData | null = null;

export async function loadWorld(): Promise<WorldData> {
  if (worldCache) return worldCache;
  const topo = (await import('world-atlas/countries-110m.json')).default as never;
  const countries = feature(topo, (topo as { objects: { countries: unknown } }).objects.countries as never) as unknown as FeatureCollection<
    Geometry,
    { name: string }
  >;
  worldCache = { countries };
  return worldCache;
}

const scoreColor = (ratio: number) => {
  // Light cyan through brand violet; deeper means higher capability.
  const stops: [number, number, number][] = [
    [148, 163, 184],
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
  const max = Math.max(...entries.map((e) => e.score), 1);
  const byMapName = new Map<string, GeographyEntry>();
  for (const e of entries) byMapName.set(NAME_ALIASES[e.place] ?? e.place, e);

  const projection =
    view === 'globe'
      ? geoOrthographic().scale(size / 2 - 10).translate([size / 2, size / 2]).clipAngle(90)
      : geoNaturalEarth1().fitSize([size, size * 0.62], { type: 'Sphere' });

  const path = geoPath(projection);
  const svgNS = 'http://www.w3.org/2000/svg';
  const height = view === 'globe' ? size : size * 0.62;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${height}`);
  svg.setAttribute('class', 'w-full touch-none select-none');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'World map of emerging technology capability');
  if (view === 'globe') svg.style.cursor = 'grab';

  const make = (tag: string, attrs: Record<string, string>) => {
    const node = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };

  // Ocean sphere
  const sphere = make('path', { d: path({ type: 'Sphere' }) ?? '', fill: 'url(#ocean)', stroke: 'rgba(255,255,255,0.18)' });
  const defs = make('defs', {});
  defs.innerHTML =
    view === 'globe'
      ? `<radialGradient id="ocean" cx="35%" cy="30%">
           <stop offset="0%" stop-color="#1e3a5f" />
           <stop offset="60%" stop-color="#0f2744" />
           <stop offset="100%" stop-color="#081726" />
         </radialGradient>
         <radialGradient id="glow" cx="50%" cy="50%">
           <stop offset="70%" stop-color="rgba(34,211,238,0)" />
           <stop offset="100%" stop-color="rgba(34,211,238,0.35)" />
         </radialGradient>`
      : `<linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stop-color="#132337" />
           <stop offset="100%" stop-color="#0b1726" />
         </linearGradient>`;
  svg.appendChild(defs);
  svg.appendChild(sphere);

  const graticule = make('path', {
    d: path(geoGraticule10()) ?? '',
    fill: 'none',
    stroke: 'rgba(255,255,255,0.07)',
    'stroke-width': '0.5',
  });
  svg.appendChild(graticule);

  const countryNodes: { node: SVGPathElement; f: Feature<Geometry, { name: string }> }[] = [];
  for (const f of world.countries.features) {
    const entry = byMapName.get(f.properties.name);
    const node = make('path', {
      d: path(f) ?? '',
      fill: entry ? scoreColor(entry.score / max) : 'rgba(255,255,255,0.06)',
      stroke: 'rgba(11,14,23,0.6)',
      'stroke-width': '0.4',
    }) as SVGPathElement;
    if (entry) {
      node.style.cursor = 'pointer';
      node.addEventListener('mouseenter', () => onSelect(entry.place));
      node.addEventListener('mouseleave', () => onSelect(null));
      node.addEventListener('click', () => onSelect(entry.place));
      const title = make('title', {});
      title.textContent = `${entry.place} · ${entry.score}`;
      node.appendChild(title);
    }
    countryNodes.push({ node, f });
    svg.appendChild(node);
  }

  // City-state markers
  const markerNodes: { node: SVGGElement; coords: [number, number]; entry: GeographyEntry }[] = [];
  for (const [place, coords] of Object.entries(CITY_STATES)) {
    const entry = entries.find((e) => e.place === place);
    if (!entry) continue;
    const g = make('g', { style: 'cursor:pointer' }) as SVGGElement;
    const ring = make('circle', { r: '5', fill: scoreColor(entry.score / max), stroke: '#0b0e17', 'stroke-width': '1.5' });
    const title = make('title', {});
    title.textContent = `${entry.place} · ${entry.score}`;
    g.appendChild(ring);
    g.appendChild(title);
    g.addEventListener('mouseenter', () => onSelect(entry.place));
    g.addEventListener('mouseleave', () => onSelect(null));
    g.addEventListener('click', () => onSelect(entry.place));
    markerNodes.push({ node: g, coords, entry });
    svg.appendChild(g);
  }

  if (view === 'globe') {
    svg.appendChild(make('circle', { cx: String(size / 2), cy: String(size / 2), r: String(size / 2 - 10), fill: 'url(#glow)', 'pointer-events': 'none' }));
  }

  el.replaceChildren(svg);

  const redraw = () => {
    sphere.setAttribute('d', path({ type: 'Sphere' }) ?? '');
    graticule.setAttribute('d', path(geoGraticule10()) ?? '');
    for (const { node, f } of countryNodes) node.setAttribute('d', path(f) ?? '');
    for (const { node, coords } of markerNodes) {
      const p = projection(coords);
      // Hide markers rotated to the far side of the globe.
      const visible = p && (view === 'map' || isFrontFacing(coords));
      if (visible && p) {
        node.setAttribute('transform', `translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`);
        node.setAttribute('opacity', '1');
      } else {
        node.setAttribute('opacity', '0');
      }
    }
  };

  const isFrontFacing = (coords: [number, number]) => {
    const r = projection.rotate();
    const [lon, lat] = coords;
    const toRad = Math.PI / 180;
    const c =
      Math.sin(-r[1] * toRad) * Math.sin(lat * toRad) +
      Math.cos(-r[1] * toRad) * Math.cos(lat * toRad) * Math.cos((lon + r[0]) * toRad);
    return c > 0;
  };

  let frame = 0;
  let dragging = false;
  let autoRotate = view === 'globe';
  let last: [number, number] = [0, 0];
  let rotation: [number, number] = [-20, -15];

  if (view === 'globe') {
    projection.rotate([rotation[0], rotation[1]]);
    redraw();

    const onDown = (ev: PointerEvent) => {
      dragging = true;
      autoRotate = false;
      last = [ev.clientX, ev.clientY];
      svg.style.cursor = 'grabbing';
      svg.setPointerCapture(ev.pointerId);
    };
    const onMove = (ev: PointerEvent) => {
      if (!dragging) return;
      const dx = ev.clientX - last[0];
      const dy = ev.clientY - last[1];
      last = [ev.clientX, ev.clientY];
      rotation = [rotation[0] + dx * 0.35, Math.max(-85, Math.min(85, rotation[1] - dy * 0.35))];
      projection.rotate(rotation);
      redraw();
    };
    const onUp = (ev: PointerEvent) => {
      dragging = false;
      svg.style.cursor = 'grab';
      try {
        svg.releasePointerCapture(ev.pointerId);
      } catch {
        /* pointer already released */
      }
    };
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);

    const tick = () => {
      if (autoRotate && !dragging) {
        rotation = [rotation[0] + 0.12, rotation[1]];
        projection.rotate(rotation);
        redraw();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  } else {
    redraw();
  }

  return {
    destroy: () => {
      if (frame) cancelAnimationFrame(frame);
      el.replaceChildren();
    },
  };
}

export const centroidOf = geoCentroid;
