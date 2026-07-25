import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/RoundupPage.astro', import.meta.url), 'utf8');
const mobileBlock = source.match(/@media \(max-width: 767px\)\s*\{[\s\S]*?<\/style>/)?.[0] ?? '';
const requirements = [
  ['phone roundup-title containment', 'max-width: 100%;'],
  ['phone roundup-title sizing', 'font-size: clamp(34px, 11vw, 44px);'],
  ['phone roundup-title wrapping', 'overflow-wrap: break-word;'],
  ['phone roundup masthead inset', '.masthead, .section-pad, .hero-img-section, .bottom-line { padding-left: 20px; padding-right: 20px; }'],
];

const missing = requirements.filter(([, marker]) => !mobileBlock.includes(marker));
if (missing.length) {
  for (const [label] of missing) console.error(`Missing roundup responsive contract: ${label}`);
  process.exit(1);
}

console.log('Roundup responsive contract passed.');
