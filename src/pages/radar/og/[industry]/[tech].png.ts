import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { techRoutes } from '../../../../data/radar/routes';
import { QUADRANTS, RINGS, MOMENTUM } from '../../../../data/radar/types';
import type { IndustryRadar, Technology } from '../../../../data/radar/types';

export function getStaticPaths() {
  return techRoutes().map(({ industry, tech, slug }) => ({
    params: { industry: industry.slug, tech: slug },
    props: { industry, tech },
  }));
}

const RING_COLOR: Record<string, string> = {
  adopt: '#7c3aed',
  trial: '#06b6d4',
  assess: '#f59e0b',
  hold: '#64748b',
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] as string);

/** Greedy wrap by estimated glyph width — avoids measuring text in a headless renderer. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]$/, '')}…`;
  }
  return lines;
}

export const GET: APIRoute = async ({ props }) => {
  const { industry, tech } = props as { industry: IndustryRadar; tech: Technology };
  const ring = RINGS.find((r) => r.id === tech.ring);
  const quadrant = QUADRANTS.find((q) => q.id === tech.quadrant);
  const momentum = MOMENTUM.find((m) => m.id === tech.momentum);
  const accent = RING_COLOR[tech.ring] ?? '#7c3aed';

  const titleLines = wrap(tech.name, 30, 2);
  const summaryLines = wrap(tech.summary, 62, 3);
  const titleSize = titleLines.length > 1 ? 62 : 72;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0e1220"/>
      <stop offset="60%" stop-color="#0b0e17"/>
      <stop offset="100%" stop-color="#0a1020"/>
    </linearGradient>
    <radialGradient id="glow" cx="12%" cy="0%" r="70%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="55%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#rule)"/>

  <text x="80" y="104" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="600" fill="#94a3b8" letter-spacing="4">EMERGING TECHNOLOGY &amp; INNOVATION RADAR</text>
  <text x="80" y="142" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#22d3ee">${esc(industry.name)}</text>

  <rect x="80" y="178" width="${ring!.label.length * 15 + 46}" height="44" rx="22" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-opacity="0.65"/>
  <text x="${80 + (ring!.label.length * 15 + 46) / 2}" y="207" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="${accent}">${esc(ring!.label.toUpperCase())}</text>

  <text x="${80 + ring!.label.length * 15 + 70}" y="207" font-family="Helvetica, Arial, sans-serif" font-size="21" fill="#94a3b8">${esc(quadrant?.name ?? '')}  ·  ${esc(momentum?.label ?? '')}  ·  ${esc(tech.timeHorizon)}</text>

  ${titleLines
    .map(
      (l, i) =>
        `<text x="80" y="${310 + i * (titleSize + 10)}" font-family="Helvetica, Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff">${esc(l)}</text>`
    )
    .join('\n  ')}

  ${summaryLines
    .map(
      (l, i) =>
        `<text x="80" y="${330 + titleLines.length * (titleSize + 10) + i * 38}" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#94a3b8">${esc(l)}</text>`
    )
    .join('\n  ')}

  <rect x="80" y="536" width="1040" height="1" fill="#ffffff" fill-opacity="0.12"/>
  <text x="80" y="580" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="#ffffff">Shailesh Kumar</text>
  <text x="80" y="608" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#64748b">vantessence.com/radar</text>
  <text x="1120" y="580" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#64748b">${esc(industry.edition.label)}</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
