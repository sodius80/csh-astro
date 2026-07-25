import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/ReviewPage.astro', import.meta.url), 'utf8');
const requirements = [
  ['mobile review breakpoint', /@media\s*\(max-width:\s*767px\)/.test(source)],
  [
    'duplicate affiliate rail hidden on phones',
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.sticky-aff\s*\{\s*display:\s*none;\s*\}/.test(source),
  ],
];

const missing = requirements.filter(([, present]) => !present);
if (missing.length) {
  for (const [label] of missing) console.error(`Missing review responsive contract: ${label}`);
  process.exit(1);
}

console.log('Review responsive contract passed.');
