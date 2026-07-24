import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const forbiddenRatingKeys = ['aggregateRating', 'reviewRating'];
const forbiddenSourceTokens = [
  'schemaRatingValue:',
  'schemaRatingCount:',
  'aggregateRating',
  'reviewRating',
];
const strictPolicy = 'evidence-linked-v1';
const strictPolicyStartDate = '2026-07-24';
const baselinePath = path.join(root, 'scripts/structured-data-legacy-baseline.json');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function walkFiles(directory, predicate) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute, predicate));
    else if (predicate(absolute)) files.push(absolute);
  }
  return files.sort();
}

function relative(absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/');
}

function countToken(source, token) {
  return source.split(token).length - 1;
}

function frontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1] ?? '';
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2
    && ((trimmed.startsWith('"') && trimmed.endsWith('"'))
      || (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function scalar(frontmatterSource, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = frontmatterSource.match(new RegExp(`^${escaped}:\\s*(.*?)\\s*$`, 'm'));
  return match ? unquote(match[1]) : undefined;
}

function topLevelList(frontmatterSource, key) {
  const lines = frontmatterSource.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `${key}:`);
  if (start < 0) return [];

  const values = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\S/.test(line)) break;
    const item = line.match(/^\s{2}-\s+(.*)$/);
    if (item) values.push(unquote(item[1]));
  }
  return values;
}

function extractSourceJsonLdFragments(source) {
  const pattern = /<script\b(?=[^>]*type=["']application\/ld\+json["'])[\s\S]*?(?:<\/script>|\/>)/gi;
  return [...source.matchAll(pattern)].map((match) => match[0]);
}

function extractBuiltJsonLd(html) {
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(pattern)].map((match) => match[1].trim());
}

function ratingCounts(source) {
  return {
    schemaRatingValue: countToken(source, 'schemaRatingValue:'),
    schemaRatingCount: countToken(source, 'schemaRatingCount:'),
    reviewRating: countToken(source, 'reviewRating'),
    aggregateRating: countToken(source, 'aggregateRating'),
  };
}

function hasAnyRating(counts) {
  return Object.values(counts).some((count) => count > 0);
}

function sourceRatingInventory() {
  const records = [];
  const totals = {
    files: 0,
    schemaRatingValue: 0,
    schemaRatingCount: 0,
    reviewRating: 0,
    aggregateRating: 0,
    jsonLdFragments: 0,
  };

  for (const absolute of walkFiles(path.join(root, 'src/content'), (file) => file.endsWith('.mdx'))) {
    const source = fs.readFileSync(absolute, 'utf8');
    const counts = ratingCounts(source);
    if (!hasAnyRating(counts)) continue;

    const scalarLines = source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^(schemaRatingValue|schemaRatingCount):/.test(line));
    const fragmentHashes = extractSourceJsonLdFragments(source)
      .filter((fragment) => forbiddenRatingKeys.some((key) => fragment.includes(key)))
      .map(sha256)
      .sort();

    records.push({
      path: relative(absolute),
      ...counts,
      scalarLines,
      fragmentHashes,
    });
    totals.files += 1;
    totals.schemaRatingValue += counts.schemaRatingValue;
    totals.schemaRatingCount += counts.schemaRatingCount;
    totals.reviewRating += counts.reviewRating;
    totals.aggregateRating += counts.aggregateRating;
    totals.jsonLdFragments += fragmentHashes.length;
  }

  return { digest: sha256(JSON.stringify(records)), totals, records };
}

function outputRatingInventory() {
  const records = [];
  const totals = { files: 0, reviewRating: 0, aggregateRating: 0, jsonLdFragments: 0 };

  for (const absolute of walkFiles(path.join(root, 'dist'), (file) => file.endsWith('.html'))) {
    const html = fs.readFileSync(absolute, 'utf8');
    const counts = {
      reviewRating: countToken(html, 'reviewRating'),
      aggregateRating: countToken(html, 'aggregateRating'),
    };
    if (!hasAnyRating(counts)) continue;

    const fragmentHashes = extractBuiltJsonLd(html)
      .filter((fragment) => forbiddenRatingKeys.some((key) => fragment.includes(key)))
      .map(sha256)
      .sort();
    records.push({ path: relative(absolute), ...counts, fragmentHashes });
    totals.files += 1;
    totals.reviewRating += counts.reviewRating;
    totals.aggregateRating += counts.aggregateRating;
    totals.jsonLdFragments += fragmentHashes.length;
  }

  return { digest: sha256(JSON.stringify(records)), totals, records };
}

function currentLegacyBaseline() {
  const source = sourceRatingInventory();
  const output = outputRatingInventory();
  return {
    policy: 'Known legacy rating markup is frozen. Any addition, reuse, edit, or removal requires an explicit baseline review.',
    source: { digest: source.digest, totals: source.totals },
    output: { digest: output.digest, totals: output.totals },
  };
}

function typeIncludes(value, expected) {
  return Array.isArray(value) ? value.includes(expected) : value === expected;
}

function collectTypedNodes(value, expected, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectTypedNodes(item, expected, found);
  } else if (value && typeof value === 'object') {
    if (typeIncludes(value['@type'], expected)) found.push(value);
    for (const child of Object.values(value)) collectTypedNodes(child, expected, found);
  }
  return found;
}

function findForbiddenKeys(value, trail = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenKeys(item, `${trail}[${index}]`, found));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const nextTrail = `${trail}.${key}`;
      if (forbiddenRatingKeys.includes(key)) found.push(nextTrail);
      findForbiddenKeys(child, nextTrail, found);
    }
  }
  return found;
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function visibleText(html) {
  return decodeHtml(html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
}

function formatVisibleDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function roundupRootSlugs() {
  const slugFile = path.join(root, 'src/lib/slugs.ts');
  if (!fs.existsSync(slugFile)) return {};
  const source = fs.readFileSync(slugFile, 'utf8');
  const block = source.match(/ROUNDUP_ROOT_SLUGS[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? '';
  return Object.fromEntries([...block.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)].map((match) => [match[1], match[2]]));
}

function outputSlug(collection, id, roundupMappings) {
  if (collection === 'reviews') return id.includes('-review') || id.includes('-vs-') ? id : `${id}-review`;
  if (collection === 'roundups') return roundupMappings[id] ?? id;
  return id;
}

function jsonLdObjects(html, sourcePath) {
  const objects = [];
  for (const [index, raw] of extractBuiltJsonLd(html).entries()) {
    try {
      objects.push(JSON.parse(raw));
    } catch (error) {
      failures.push(`${sourcePath} generated invalid JSON-LD block ${index + 1}: ${error.message}`);
    }
  }
  return objects;
}

function noteNames(notes) {
  if (!notes || typeof notes !== 'object' || !Array.isArray(notes.itemListElement)) return [];
  return notes.itemListElement.map((item) => item?.name).filter((name) => typeof name === 'string');
}

function validateExactField(sourcePath, object, property, expected) {
  if (expected === undefined) {
    if (object[property] !== undefined) failures.push(`${sourcePath} guessed ${property}; omit it unless frontmatter supplies verified evidence.`);
  } else if (object[property] !== expected) {
    failures.push(`${sourcePath} emitted ${property}=${JSON.stringify(object[property])}; expected explicit frontmatter value ${JSON.stringify(expected)}.`);
  }
}

function validateStrictArticle(absolute, roundupMappings) {
  const sourcePath = relative(absolute);
  const collection = sourcePath.split('/')[2];
  const id = path.basename(absolute, '.mdx');
  const source = fs.readFileSync(absolute, 'utf8');
  const fm = frontmatter(source);
  const counts = ratingCounts(source);
  for (const [token, count] of Object.entries(counts)) {
    if (count > 0) failures.push(`${sourcePath} uses ${token}; ${strictPolicy} articles must keep third-party scores in visible, linked copy only.`);
  }

  const slug = outputSlug(collection, id, roundupMappings);
  const outputPath = path.join(root, 'dist', slug, 'index.html');
  if (!fs.existsSync(outputPath)) {
    failures.push(`${sourcePath} has ${strictPolicy} but generated output dist/${slug}/index.html is missing.`);
    return;
  }

  const html = fs.readFileSync(outputPath, 'utf8');
  const schemas = jsonLdObjects(html, sourcePath);
  const forbidden = schemas.flatMap((schema) => findForbiddenKeys(schema));
  if (forbidden.length > 0) failures.push(`${sourcePath} generated forbidden rating schema at ${forbidden.join(', ')}.`);

  const pubDate = scalar(fm, 'pubDate');
  const modifiedDate = scalar(fm, 'updatedDate') ?? pubDate;
  const pageText = visibleText(html);
  if (modifiedDate && !pageText.includes(`Updated ${formatVisibleDate(modifiedDate)}`)) {
    failures.push(`${sourcePath} visible Updated date does not match frontmatter ${modifiedDate}.`);
  }

  if (collection === 'reviews') {
    const reviews = schemas.flatMap((schema) => collectTypedNodes(schema, 'Review'));
    if (reviews.length !== 1) {
      failures.push(`${sourcePath} must generate exactly one Review schema; found ${reviews.length}.`);
      return;
    }
    const review = reviews[0];
    if (pubDate && review.datePublished !== pubDate) failures.push(`${sourcePath} Review datePublished must equal ${pubDate}.`);
    if (modifiedDate && review.dateModified !== modifiedDate) failures.push(`${sourcePath} Review dateModified must equal ${modifiedDate}.`);

    const software = review.itemReviewed;
    if (!software || !typeIncludes(software['@type'], 'SoftwareApplication')) {
      failures.push(`${sourcePath} Review must identify one SoftwareApplication in itemReviewed.`);
      return;
    }
    validateExactField(sourcePath, software, 'url', scalar(fm, 'schemaProductUrl'));
    validateExactField(sourcePath, software, 'applicationSubCategory', scalar(fm, 'schemaApplicationSubCategory'));
    validateExactField(sourcePath, software, 'operatingSystem', scalar(fm, 'schemaOperatingSystem'));
    const pricingUrl = scalar(fm, 'schemaPricingUrl');
    if (pricingUrl === undefined) {
      if (software.offers?.url !== undefined) failures.push(`${sourcePath} guessed an offers URL without schemaPricingUrl evidence.`);
    } else if (software.offers?.url !== pricingUrl) {
      failures.push(`${sourcePath} offers URL does not match explicit schemaPricingUrl ${pricingUrl}.`);
    }

    const expectedPros = topLevelList(fm, 'pros');
    const expectedCons = topLevelList(fm, 'cons');
    const actualPros = noteNames(review.positiveNotes);
    const actualCons = noteNames(review.negativeNotes);
    if (JSON.stringify(actualPros) !== JSON.stringify(expectedPros)) failures.push(`${sourcePath} positiveNotes must exactly mirror the visible pros list.`);
    if (JSON.stringify(actualCons) !== JSON.stringify(expectedCons)) failures.push(`${sourcePath} negativeNotes must exactly mirror the visible cons list.`);
  } else if (collection === 'comparisons') {
    const reviews = schemas.flatMap((schema) => collectTypedNodes(schema, 'Review'));
    const articles = schemas.flatMap((schema) => collectTypedNodes(schema, 'Article'));
    if (reviews.length > 0) failures.push(`${sourcePath} is a comparison and must not generate Review schema.`);
    if (articles.length !== 1) {
      failures.push(`${sourcePath} must generate exactly one Article schema; found ${articles.length}.`);
      return;
    }
    const article = articles[0];
    if (pubDate && article.datePublished !== pubDate) failures.push(`${sourcePath} Article datePublished must equal ${pubDate}.`);
    if (modifiedDate && article.dateModified !== modifiedDate) failures.push(`${sourcePath} Article dateModified must equal ${modifiedDate}.`);
    if (!Array.isArray(article.about) || article.about.length !== 2 || article.about.some((item) => !typeIncludes(item?.['@type'], 'SoftwareApplication'))) {
      failures.push(`${sourcePath} comparison Article must describe exactly two SoftwareApplication subjects.`);
    }
    for (const subject of article.about ?? []) {
      for (const guessed of ['operatingSystem', 'applicationSubCategory', 'aggregateRating', 'reviewRating']) {
        if (subject?.[guessed] !== undefined) failures.push(`${sourcePath} comparison subject ${subject.name ?? '(unknown)'} must not guess ${guessed}.`);
      }
    }
  } else {
    const dated = schemas.flatMap((schema) => collectTypedNodes(schema, 'Article'))[0];
    if (modifiedDate && dated?.dateModified !== modifiedDate) failures.push(`${sourcePath} structured dateModified must equal ${modifiedDate}.`);
  }
}

const templateFiles = [
  'src/components/ReviewPage.astro',
  'src/components/ComparisonPage.astro',
];

for (const relativePath of templateFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const forbidden of forbiddenRatingKeys) {
    if (source.includes(forbidden)) failures.push(`${relativePath} must not auto-generate ${forbidden}.`);
  }
  if (/"(?:operatingSystem|applicationSubCategory)"\s*:\s*["'`]/.test(source)) {
    failures.push(`${relativePath} must not hard-code product platform or subcategory metadata.`);
  }
}

const currentBaseline = currentLegacyBaseline();
if (process.argv.includes('--print-baseline')) {
  console.log(JSON.stringify(currentBaseline, null, 2));
  process.exit(0);
}

if (!fs.existsSync(baselinePath)) {
  failures.push('Missing scripts/structured-data-legacy-baseline.json; create it from an explicitly reviewed `npm run check:schema -- --print-baseline` result.');
} else {
  const expectedBaseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  if (expectedBaseline.source?.digest !== currentBaseline.source.digest) {
    failures.push(`Legacy source rating inventory changed. Expected ${expectedBaseline.source?.digest}, received ${currentBaseline.source.digest}. Ratings may not be added, copied, edited, or removed silently.`);
  }
  if (expectedBaseline.output?.digest !== currentBaseline.output.digest) {
    failures.push(`Generated rating-schema inventory changed. Expected ${expectedBaseline.output?.digest}, received ${currentBaseline.output.digest}. No page may gain or alter rating markup silently.`);
  }
}

const roundupMappings = roundupRootSlugs();
for (const absolute of walkFiles(path.join(root, 'src/content'), (file) => file.endsWith('.mdx'))) {
  const source = fs.readFileSync(absolute, 'utf8');
  const fm = frontmatter(source);
  const policy = scalar(fm, 'schemaPolicy');
  const newestEditorialDate = [scalar(fm, 'pubDate'), scalar(fm, 'updatedDate')]
    .filter(Boolean)
    .sort()
    .at(-1);
  if (newestEditorialDate >= strictPolicyStartDate && policy !== strictPolicy) {
    failures.push(`${relative(absolute)} is new or refreshed on ${newestEditorialDate} and must declare schemaPolicy: ${strictPolicy}.`);
  }
  if (policy === strictPolicy) validateStrictArticle(absolute, roundupMappings);
}

if (failures.length > 0) {
  console.error('\nStructured-data contract failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Structured-data contract passed. Legacy rating markup remains frozen at ${currentBaseline.output.totals.files} generated pages; ${strictPolicy} pages emit no rating schema.`);
