import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/ReviewPage.astro', import.meta.url), 'utf8');
const decisionSource = await readFile(new URL('../src/components/ReviewDecisionPanel.astro', import.meta.url), 'utf8');
const configSource = await readFile(new URL('../src/content.config.ts', import.meta.url), 'utf8');
const requirements = [
  ['mobile review breakpoint', /@media\s*\(max-width:\s*767px\)/.test(source)],
  [
    'duplicate affiliate rail hidden on phones',
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.sticky-aff\s*\{\s*display:\s*none;\s*\}/.test(source),
  ],
  [
    'long mobile review headlines stay inside the viewport',
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.masthead-title\s*\{[\s\S]*?max-width:\s*100%;[\s\S]*?font-size:\s*clamp\(30px,\s*9vw,\s*40px\);[\s\S]*?overflow-wrap:\s*break-word;[\s\S]*?text-wrap:\s*balance;[\s\S]*?\}/.test(source),
  ],
  [
    'quick-decision verdict uses the same content width as its decision boxes',
    /:global\(\.decision\s+\.decision__verdict\)\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;[\s\S]*?\}/.test(source),
  ],
  [
    'editorial intent is the single no-CTA switch',
    source.includes("const isEditorialNoCta = d.commercialIntent === 'none';")
      && !source.includes('noCta'),
  ],
  [
    'non-commercial reviews do not render the sticky product rail',
    /\{showProductCta\s*&&\s*\(\s*<div class="sticky-aff">/.test(source),
  ],
  [
    'decision and bottom-line product CTAs share the same gate',
    source.includes('showCta={showProductCta}')
      && /\{showProductCta\s*&&\s*\(\s*<a href=\{d\.affiliateUrl\} class="btn orange"/.test(source)
      && decisionSource.includes('{showCta && affiliateUrl && ('),
  ],
  [
    'commercial reviews require a URL while editorial reviews may omit one',
    configSource.includes("affiliateUrl: z.string().optional().default('')")
      && configSource.includes("commercialIntent: z.enum(['affiliate', 'sponsored', 'none']).default('affiliate')")
      && configSource.includes("if (review.commercialIntent !== 'none' && !review.affiliateUrl)"),
  ],
];

const missing = requirements.filter(([, present]) => !present);
if (missing.length) {
  for (const [label] of missing) console.error(`Missing review responsive contract: ${label}`);
  process.exit(1);
}

console.log('Review responsive contract passed.');
