import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/ComparisonPage.astro', import.meta.url), 'utf8');
const requirements = [
  ['Jobber-side value labels', 'data-vendor={d.vendorA.name}'],
  ['Housecall Pro-side value labels', 'data-vendor={d.vendorB.name}'],
  ['tablet two-column layout', '.glance-head { grid-template-columns: 1fr 1fr; }'],
  ['tablet row columns', '.glance-row { grid-template-columns: 1fr 1fr; }'],
  ['phone vendor labels', 'content: attr(data-vendor);'],
];

const missing = requirements.filter(([, marker]) => !source.includes(marker));
if (missing.length) {
  for (const [label] of missing) console.error(`Missing comparison responsive contract: ${label}`);
  process.exit(1);
}

console.log('Comparison responsive contract passed.');
