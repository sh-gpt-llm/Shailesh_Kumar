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

// Every dependsOn id must exist in that industry, and nothing may depend on itself.
const slugByFile = {
  'tech.ts': 'tech-saas',
  'healthcare.ts': 'healthcare-life-sciences',
  'financial-services.ts': 'financial-services',
  'manufacturing.ts': 'manufacturing-industrial',
  'retail.ts': 'retail-consumer',
};
const idsBySlug = {};
for (const file of files) {
  const source = readFileSync(join(industriesDir, file), 'utf8');
  const ids = new Set();
  for (const m of source.matchAll(/\{ id: (\d+), name: '/g)) ids.add(Number(m[1]));
  idsBySlug[slugByFile[file]] = ids;
}

const augment = readFileSync(join(projectRoot, 'src/data/radar/augment.ts'), 'utf8');

// Brace-matched extraction: entries appear both inline and multi-line, so a
// plain regex over the whole block silently skips the inline ones.
const sliceBlock = (text, openIndex) => {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(openIndex, i + 1);
    }
  }
  return '';
};

const depErrors = [];
let depCount = 0;
let entryCount = 0;
for (const slugMatch of augment.matchAll(/'([a-z-]+)':\s*\{/g)) {
  const slug = slugMatch[1];
  const ids = idsBySlug[slug];
  if (!ids) continue;
  const block = sliceBlock(augment, slugMatch.index + slugMatch[0].length - 1);
  for (const entryMatch of block.matchAll(/(?:^|\n)\s{4}(\d+):\s*\{/g)) {
    const ownerId = Number(entryMatch[1]);
    entryCount++;
    const entry = sliceBlock(block, entryMatch.index + entryMatch[0].length - 1);
    const deps = entry.match(/dependsOn:\s*\[([^\]]*)\]/);
    if (!deps) continue;
    for (const raw of deps[1].split(',')) {
      const id = Number(raw.trim());
      if (!Number.isFinite(id) || raw.trim() === '') continue;
      depCount++;
      if (!ids.has(id)) depErrors.push(`${slug}: technology ${ownerId} depends on unknown id ${id}`);
      if (id === ownerId) depErrors.push(`${slug}: technology ${ownerId} depends on itself`);
    }
    if (!ids.has(ownerId)) depErrors.push(`${slug}: augment declared for unknown technology id ${ownerId}`);
  }
}

if (depErrors.length) {
  console.error(`\n✗ radar: ${depErrors.length} invalid dependency reference(s):`);
  for (const e of depErrors) console.error(`    ${e}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✓ radar: ${aliasCount} aliases, ${entryCount} augmented technologies and ${depCount} dependencies validated against ${technologyNames.size} technologies`
);
