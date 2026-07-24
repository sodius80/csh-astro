import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const templateFiles = [
  'src/components/ReviewPage.astro',
  'src/components/ComparisonPage.astro',
];

for (const relativePath of templateFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const forbidden of ['aggregateRating', 'reviewRating']) {
    if (source.includes(forbidden)) {
      failures.push(`${relativePath} must not auto-generate ${forbidden}.`);
    }
  }
}

const reviewsDir = path.join(root, 'src/content/reviews');
for (const filename of fs.readdirSync(reviewsDir).filter((name) => name.endsWith('.mdx'))) {
  const relativePath = `src/content/reviews/${filename}`;
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  if (!/^decision:/m.test(source)) continue;

  for (const forbidden of ['schemaRatingValue:', 'schemaRatingCount:', 'aggregateRating', 'reviewRating']) {
    if (source.includes(forbidden)) {
      failures.push(`${relativePath} uses ${forbidden}; modern reviews must keep external scores in visible, linked copy only.`);
    }
  }
}

const tapOutput = path.join(root, 'dist/tap-inspect-review/index.html');
const tapSource = fs.readFileSync(path.join(root, 'src/content/reviews/tap-inspect-review.mdx'), 'utf8');
if (tapSource.includes('schemaOperatingSystem: "iOS, iPadOS"') && fs.existsSync(tapOutput)) {
  const html = fs.readFileSync(tapOutput, 'utf8');
  if (html.includes('aggregateRating')) failures.push('Tap Inspect output still contains aggregateRating.');
  if (html.includes('reviewRating')) failures.push('Tap Inspect output still contains an invisible numeric reviewRating.');
  if (!html.includes('"operatingSystem":"iOS, iPadOS"')) {
    failures.push('Tap Inspect output must identify iOS and iPadOS as its operating systems.');
  }
  if (!html.includes('Updated Jul 24, 2026')) {
    failures.push('Tap Inspect visible update date is not synchronized to Jul 24, 2026.');
  }
}

if (failures.length > 0) {
  console.error('\nStructured-data contract failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Structured-data template contract passed.');
