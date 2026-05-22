#!/usr/bin/env node
/**
 * CSH MDX Lint — fast frontmatter + JSON-LD validation
 * Run: node scripts/lint-mdx.mjs
 * Exit code: 0 = clean, 1 = errors found
 *
 * Checks:
 *   - YAML frontmatter is parseable
 *   - Required fields exist per collection type
 *   - JSON-LD in comparison bodies is structurally valid
 *   - Common schema pitfalls (missing schemaRatingValue, etc.)
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src/content');

// ─── Collection config (mirrors content.config.ts Zod schemas) ───

const COLLECTIONS = {
  reviews: {
    dir: join(CONTENT, 'reviews'),
    required: [
      'title', 'description', 'vendor', 'category', 'rating',
      'verdictShort', 'startingPrice', 'bestFor', 'pubDate',
      'author', 'affiliateUrl', 'heroImage',
    ],
    seoFields: ['schemaRatingValue', 'schemaRatingCount', 'schemaReviewBody'],
    ratingValues: ['top-pick', 'recommended', 'conditional', 'skip'],
    faqShape: { q: 'string', a: 'string' },
  },
  comparisons: {
    dir: join(CONTENT, 'comparisons'),
    required: [
      'title', 'description', 'category', 'vendorA', 'vendorB',
      'shortAnswer', 'pubDate', 'author', 'heroImage',
    ],
    vendorSubFields: ['name', 'slug'],
    shortAnswerSubFields: ['aWhen', 'bWhen'],
  },
  roundups: {
    dir: join(CONTENT, 'roundups'),
    required: [
      'title', 'description', 'category', 'pubDate', 'author',
      'heroImage',
    ],
    rankedFields: ['name', 'rating', 'tag', 'bestFor', 'startingPrice', 'pullquote', 'body'],
    ratingValues: ['top-pick', 'recommended', 'conditional', 'skip'],
  },
  guides: {
    dir: join(CONTENT, 'guides'),
    required: [
      'title', 'description', 'guideType', 'pubDate', 'author', 'heroImage',
    ],
    guideTypes: ['guide', 'pricing', 'alternatives', 'roundup'],
    searchTags: ['searchTags'],
  },
};

// ─── Helpers ───

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { ok: false, error: 'No frontmatter block found' };
  const yamlText = match[1];
  try {
    const parsed = yaml.load(yamlText);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Frontmatter YAML did not parse to an object' };
    }
    return { ok: true, data: parsed, yaml: yamlText };
  } catch (e) {
    return { ok: false, error: `YAML parse error: ${e.message}` };
  }
}

function validateField(val, name) {
  if (val === undefined || val === null || val === '') {
    return `Missing required field: ${name}`;
  }
  return null;
}

function extractJsonLdBlocks(body) {
  const blocks = [];
  // Matches: <script type="application/ld+json">{JSON.stringify({...})}</script>
  const regex = /<script\s+type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

function validateJsonLdStructure(rawJs, filename) {
  const errors = [];

  // This is JavaScript code (JSON.stringify({...})), not raw JSON.
  // We can't really execute it. Let's check structural things:
  // 1. It contains JSON.stringify
  if (!rawJs.includes('JSON.stringify') && !rawJs.includes('JSON.parse')) {
    errors.push('Unexpected content — expected JSON.stringify(...) or similar');
  }

  // 2. Check for Astro template holes (${...} references)
  // These are fine — they get filled at build time.
  const astroRefs = rawJs.match(/\$\{[\s\S]*?\}/g);
  if (astroRefs && astroRefs.length > 5) {
    // Heavy dynamic content might indicate incomplete schema
    // This is just informational
  }

  // 3. Count @context and @type occurrences
  const contextCount = (rawJs.match(/"@context"/g) || []).length +
                       (rawJs.match(/'@context'/g) || []).length;
  if (contextCount === 0) {
    errors.push('No @context found in any JSON-LD block');
  }

  const typeCount = (rawJs.match(/"@type"/g) || []).length +
                    (rawJs.match(/'@type'/g) || []).length;
  if (typeCount < 3) {
    errors.push(`Only ${typeCount} @type declarations — expected ≥3 (BreadcrumbList, FAOPage, Review)`);
  }

  // 4. Check for expected schema types
  const hasBreadcrumb = rawJs.includes('BreadcrumbList');
  const hasFAQ = rawJs.includes('FAQPage');
  const hasReview = rawJs.includes('Review');

  if (!hasBreadcrumb) errors.push('Missing BreadcrumbList schema type');
  if (!hasFAQ) errors.push('Missing FAQPage schema type');
  if (!hasReview) errors.push('Missing Review schema type');

  // 5. Check FAQ structure — JSON-LD keys are quoted: "mainEntity":
  const hasMainEntity = /"mainEntity"\s*[:[]/.test(rawJs) || /mainEntity\s*:/.test(rawJs);
  if (hasFAQ && !hasMainEntity) {
    errors.push('FAQPage schema has no mainEntity — FAQ questions won\'t appear in rich results');
  }

  return errors;
}

function validateJsonLdValues(body, frontmatter) {
  // For comparisons with inline JSON.stringify({...}) in template expressions,
  // we try a different approach: look for the Review schema and cross-check
  // with frontmatter values
  const warnings = [];

  // Check if the review rating in JSON-LD matches frontmatter
  const ratingMatch = body.match(/ratingValue\s*:\s*['"]?([^'",}]+)['"]?/);
  const fmRating = frontmatter.schemaRatingValue;
  if (ratingMatch && fmRating && ratingMatch[1] !== String(fmRating)) {
    // Could be a template variable, so just warn if it's a literal mismatch
    if (!ratingMatch[1].includes('$')) {
      warnings.push(`JSON-LD ratingValue (${ratingMatch[1]}) differs from frontmatter schemaRatingValue (${fmRating})`);
    }
  }

  return warnings;
}

// ─── Main ───

let totalErrors = 0;
let totalWarnings = 0;
const results = [];

for (const [collection, config] of Object.entries(COLLECTIONS)) {
  if (!existsSync(config.dir)) continue;

  const files = readdirSync(config.dir).filter(f => f.endsWith('.mdx')).sort();

  for (const file of files) {
    const filepath = join(config.dir, file);
    const content = readFileSync(filepath, 'utf-8');
    const fileErrors = [];
    const fileWarnings = [];

    // 1. Parse frontmatter
    const fm = parseFrontmatter(content);
    if (!fm.ok) {
      fileErrors.push(fm.error);
      totalErrors++;
      results.push({ file, collection, errors: fileErrors, warnings: fileWarnings });
      continue;
    }

    const d = fm.data;

    // 2. Check required fields
    for (const field of config.required) {
      const err = validateField(d[field], field);
      if (err) fileErrors.push(err);
    }

    // 3. Review-specific checks
    if (collection === 'reviews') {
      // Rating enum
      if (d.rating && !config.ratingValues.includes(d.rating)) {
        fileErrors.push(`Invalid rating "${d.rating}". Must be one of: ${config.ratingValues.join(', ')}`);
      }
      // SEO schema fields
      for (const seo of config.seoFields) {
        if (d[seo] === undefined || d[seo] === null) {
          fileWarnings.push(`Missing SEO field: ${seo} — Google rich snippets may not show`);
        }
      }
      // FAQ shape
      if (d.faqs && Array.isArray(d.faqs)) {
        d.faqs.forEach((faq, i) => {
          if (!faq.q) fileErrors.push(`FAQ #${i + 1} missing question (q)`);
          if (!faq.a) fileErrors.push(`FAQ #${i + 1} missing answer (a)`);
        });
      }
      // Affiliate URL
      if (!d.affiliateUrl || d.affiliateUrl === '') {
        fileWarnings.push('Missing affiliateUrl — review has no CTA link');
      }
    }

    // 4. Comparison-specific checks
    if (collection === 'comparisons') {
      // Vendor subfields
      for (const prefix of ['vendorA', 'vendorB']) {
        const v = d[prefix];
        if (v && typeof v === 'object') {
          for (const sub of config.vendorSubFields) {
            if (!v[sub]) fileErrors.push(`${prefix}.${sub} is required`);
          }
        }
      }
      // shortAnswer subfields
      if (d.shortAnswer && typeof d.shortAnswer === 'object') {
        for (const sub of config.shortAnswerSubFields) {
          if (!d.shortAnswer[sub]) fileErrors.push(`shortAnswer.${sub} is required`);
        }
      }

      // JSON-LD validation — schema is now auto-generated by ComparisonPage.astro component
      // so we skip the body check. All 29 comparisons get schema via BaseLayout.
      // (The inline JSON-LD blocks were removed as they duplicated the component output.)
    }

    // 5. Roundup-specific checks
    if (collection === 'roundups') {
      if (d.ranked && Array.isArray(d.ranked)) {
        d.ranked.forEach((entry, i) => {
          for (const rf of config.rankedFields) {
            if (entry[rf] === undefined || entry[rf] === null || entry[rf] === '') {
              fileErrors.push(`Ranked entry #${i + 1} ("${entry.name || 'unnamed'}") missing ${rf}`);
            }
          }
        });
      } else {
        fileErrors.push('Missing or non-array "ranked" field — roundup must list ranked entries');
      }
    }

    // 6. Guide-specific checks
    if (collection === 'guides') {
      if (d.guideType && !config.guideTypes.includes(d.guideType)) {
        fileErrors.push(`Invalid guideType "${d.guideType}". Must be one of: ${config.guideTypes.join(', ')}`);
      }
      if (d.searchTags && Array.isArray(d.searchTags) && d.searchTags.length === 0) {
        fileWarnings.push('searchTags is empty — no SEO tagging');
      }
    }

    // Collect results
    if (fileErrors.length > 0 || fileWarnings.length > 0) {
      totalErrors += fileErrors.length;
      totalWarnings += fileWarnings.length;
      results.push({ file, collection, errors: fileErrors, warnings: fileWarnings });
    }
  }
}

// ─── Report ───

results.sort((a, b) => {
  const order = ['reviews', 'comparisons', 'roundups', 'guides'];
  return order.indexOf(a.collection) - order.indexOf(b.collection) || a.file.localeCompare(b.file);
});

let currentCollection = '';
for (const r of results) {
  if (r.collection !== currentCollection) {
    currentCollection = r.collection;
    console.log(`\n\x1b[1m${currentCollection.toUpperCase()}\x1b[0m`);
  }
  if (r.errors.length > 0) {
    console.log(`  \x1b[31m✗ ${r.file}\x1b[0m`);
    r.errors.forEach(e => console.log(`      ${e}`));
  }
  if (r.warnings.length > 0) {
    console.log(`  \x1b[33m⚠ ${r.file}\x1b[0m`);
    r.warnings.forEach(w => console.log(`      ${w}`));
  }
}

const totalFiles = Object.values(COLLECTIONS).reduce((sum, c) =>
  sum + (existsSync(c.dir) ? readdirSync(c.dir).filter(f => f.endsWith('.mdx')).length : 0), 0);

console.log(`\n\x1b[1m─── Summary ───\x1b[0m`);
console.log(`  ${totalFiles} files checked`);
console.log(`  ${results.length} files with issues`);
console.log(`  ${totalErrors} errors  ${totalWarnings} warnings`);
if (totalErrors === 0 && totalWarnings === 0) {
  console.log(`  \x1b[32m✓ All clean!\x1b[0m`);
}

process.exit(totalErrors > 0 ? 1 : 0);
