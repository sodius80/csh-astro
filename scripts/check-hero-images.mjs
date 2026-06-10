/**
 * CSH Hero Image Quality Check
 * Run before every deployment to catch:
 * - Missing hero image files
 * - Empty/tiny files (likely broken)
 * - Files with suspiciously small dimensions
 *
 * Usage: node scripts/check-hero-images.mjs
 * Exit code: 0 = all good, 1 = issues found
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src/content');
const IMAGES_DIR = join(ROOT, 'public/images');

const REQUIRED_MIN_SIZE = 1024; // 1KB minimum for a real image
const SUSPICIOUS_DIMS = ['1x1', '0x0', '72x72']; // These come from DPI, not actual dims — but flagged anyway

function findAllMdxFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findAllMdxFiles(full));
      } else if (entry.name.endsWith('.mdx')) {
        results.push(full);
      }
    }
  } catch {}
  return results;
}

function extractFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)/);
    if (m) {
      data[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    }
  }
  return data;
}

function getImageDimensions(filepath) {
  try {
    const output = execSync(`file "${filepath}"`, { encoding: 'utf8', timeout: 3000 });
    // Check JPEG: "1536x1024, components"
    const jpeg = output.match(/(\d+)x(\d+), components/);
    if (jpeg) return `${jpeg[1]}x${jpeg[2]}`;
    // Check PNG: "1536 x 1024,"
    const png = output.match(/(\d+) x (\d+),/);
    if (png) return `${png[1]}x${png[2]}`;
    return 'unknown';
  } catch {
    return 'error';
  }
}

function main() {
  const mdxFiles = findAllMdxFiles(CONTENT_DIR);
  let errors = 0;
  let warnings = 0;

  console.log(`\n🔍 Checking hero images across ${mdxFiles.length} content files...\n`);

  for (const filepath of mdxFiles) {
    const content = readFileSync(filepath, 'utf-8');
    const fm = extractFrontmatter(content);
    const hero = fm.heroImage;

    if (!hero) {
      const rel = filepath.replace(ROOT + '/', '');
      console.log(`  ❌ MISSING: ${rel} — no heroImage in frontmatter`);
      errors++;
      continue;
    }

    if (hero.startsWith('http')) {
      const rel = filepath.replace(ROOT + '/', '');
      console.log(`  ⚠️  EXTERNAL: ${rel} — heroImage is a URL (${hero.substring(0, 60)}...)`);
      warnings++;
      continue;
    }

    // Resolve relative path
    const imgName = hero.replace(/^\/images\//, '');
    const imgPath = join(IMAGES_DIR, imgName);

    if (!existsSync(imgPath)) {
      const rel = filepath.replace(ROOT + '/', '');
      console.log(`  ❌ MISSING FILE: ${rel} — ${hero} (file not found at ${imgPath})`);
      errors++;
      continue;
    }

    const stats = statSync(imgPath);
    if (stats.size < REQUIRED_MIN_SIZE) {
      const rel = filepath.replace(ROOT + '/', '');
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`  ⚠️  TINY FILE: ${rel} — ${hero} (${sizeKB} KB — possible placeholder)`);
      warnings++;
    }

    // Check dimensions
    const dims = getImageDimensions(imgPath);
    if (SUSPICIOUS_DIMS.includes(dims)) {
      const rel = filepath.replace(ROOT + '/', '');
      console.log(`  ⚠️  SUSPICIOUS DIMS: ${rel} — ${hero} (${dims})`);
      warnings++;
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`  ${mdxFiles.length} files checked`);
  console.log(`  ${errors} errors, ${warnings} warnings`);

  if (errors > 0) {
    console.log(`\n❌ ${errors} blocking issue(s) — fix before deploying.\n`);
    process.exit(1);
  }

  if (warnings > 0) {
    console.log(`\n⚠️  ${warnings} warning(s) — review before deploying.\n`);
    process.exit(0);
  }

  console.log(`\n✅ All hero images look good.\n`);
}

main();
