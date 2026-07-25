import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/ComparisonPage.astro', import.meta.url), 'utf8');
const globalStyles = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const requirements = [
  ['Jobber-side value labels', 'data-vendor={d.vendorA.name}'],
  ['Housecall Pro-side value labels', 'data-vendor={d.vendorB.name}'],
  ['tablet two-column layout', '.glance-head { grid-template-columns: 1fr 1fr; }'],
  ['tablet row columns', '.glance-row { grid-template-columns: 1fr 1fr; }'],
  ['phone vendor labels', 'content: attr(data-vendor);'],
  ['phone comparison-title sizing', 'font-size: clamp(36px, 10.5vw, 42px);'],
  ['phone comparison-title wrapping', 'overflow-wrap: anywhere;'],
];
const missing = requirements.filter(([, marker]) => !source.includes(marker));
if (!/@media \(max-width: 640px\)\s*\{[\s\S]*?\.prose table\s*\{[^}]*overflow-x:\s*auto;/.test(globalStyles)) {
  missing.push(['phone prose-table containment and scrolling', 'mobile .prose table overflow-x:auto']);
}
if (missing.length) {
  for (const [label] of missing) console.error(`Missing comparison responsive contract: ${label}`);
  process.exit(1);
}

console.log('Comparison responsive contract passed.');
