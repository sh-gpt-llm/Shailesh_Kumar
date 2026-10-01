// Guards the Compare view: every canonical alias must name a real technology in
// one of the industry datasets, otherwise the cross-industry matrix silently
// loses rows. Runs automatically before each build.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const industriesDir = join(projectRoot, 'src/data/radar/industries');
const files = ['tech.ts', 'healthcare.ts', 'financial-services.ts', 'manufacturing.ts', 'retail.ts'];

const technologyNames = new Set();
for (const file of files) {
  const source = readFileSync(join(industriesDir, file), 'utf8');
  for (const m of source.matchAll(/\{ id: \d+, name: '((?:[^'\\]|\\.)*)'/g)) {
    technologyNames.add(m[1].replace(/\\'/g, "'"));
  }
}

const canonical = readFileSync(join(projectRoot, 'src/data/radar/canonical.ts'), 'utf8');
const unmatched = [];
let aliasCount = 0;
for (const block of canonical.matchAll(/names:\s*\[([\s\S]*?)\]/g)) {
  for (const m of block[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
    const name = m[1].replace(/\\'/g, "'");
    aliasCount++;
    if (!technologyNames.has(name)) unmatched.push(name);
  }
}

if (unmatched.length) {
  console.error(`\n✗ radar: ${unmatched.length} canonical alias(es) do not match any technology:`);
  for (const name of unmatched) console.error(`    ${name}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ radar: ${aliasCount} canonical aliases matched against ${technologyNames.size} technologies`);
