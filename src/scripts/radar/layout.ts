import type { QuadrantId, Ring, Technology } from '../../data/radar/types';

export interface Blip {
  tech: Technology;
  x: number;
  y: number;
}

const RING_BAND: Record<Ring, [number, number]> = {
  adopt: [0.12, 0.34],
  trial: [0.34, 0.57],
  assess: [0.57, 0.8],
  hold: [0.8, 0.97],
};

const QUADRANT_ARC: Record<QuadrantId, [number, number]> = {
  1: [270, 360],
  2: [0, 90],
  3: [90, 180],
  4: [180, 270],
};

// Radial position carries meaning: accelerating blips sit toward the inner edge
// of their ring (closer to promotion), cooling blips toward the outer edge.
const MOMENTUM_DEPTH: Record<Technology['momentum'], number> = {
  accelerating: 0.25,
  new: 0.5,
  steady: 0.55,
  cooling: 0.78,
};

/**
 * Deterministic, collision-free placement: items are spread evenly across their
 * quadrant's arc and offset radially by momentum, so no two blips overlap.
 */
export function layoutBlips(items: Technology[], cx: number, cy: number, radius: number): Blip[] {
  const buckets = new Map<string, Technology[]>();
  for (const tech of items) {
    const key = `${tech.quadrant}-${tech.ring}`;
    const list = buckets.get(key);
    if (list) list.push(tech);
    else buckets.set(key, [tech]);
  }

  const blips: Blip[] = [];
  for (const [key, bucket] of buckets) {
    const [quadrant, ring] = key.split('-') as [string, Ring];
    const [a0, a1] = QUADRANT_ARC[Number(quadrant) as QuadrantId];
    const [r0, r1] = RING_BAND[ring];
    const bandWidth = r1 - r0;

    const pad = 7;
    const span = a1 - a0 - pad * 2;
    const step = span / bucket.length;

    bucket.forEach((tech, i) => {
      const angle = a0 + pad + step * (i + 0.5);
      // Alternate a little either side of the momentum depth so dense buckets
      // stay legible rather than forming a single arc.
      const stagger = bucket.length > 3 ? (i % 2 === 0 ? -0.1 : 0.1) : 0;
      const depth = Math.min(0.88, Math.max(0.12, MOMENTUM_DEPTH[tech.momentum] + stagger));
      const r = (r0 + bandWidth * depth) * radius;
      const rad = (angle * Math.PI) / 180;
      blips.push({ tech, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) });
    });
  }
  return blips;
}

export const ringBandFor = (ring: Ring) => RING_BAND[ring];
export const RING_BANDS = RING_BAND;
