import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = join(root, 'dist');

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (full.endsWith('.html')) files.push(full);
  }
  return files;
}

function targetExists(pathname) {
  if (pathname === '/') return existsSync(join(dist, 'index.html'));
  const clean = pathname.replace(/\?.*$/, '').replace(/#.*$/, '');
  const rel = clean.replace(/^\//, '');
  const candidates = [];
  if (/\.[a-zA-Z0-9]+$/.test(clean)) {
    candidates.push(join(dist, rel));
  } else {
    candidates.push(join(dist, rel, 'index.html'));
    candidates.push(join(dist, `${rel}.html`));
    candidates.push(join(dist, rel));
  }
  return candidates.some((candidate) => existsSync(candidate));
}

const broken = [];
const htmlFiles = walk(dist);
const regex = /(href|src)=\"([^\"]+)\"/g;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(regex)) {
    const url = match[2];
    if (!url.startsWith('/')) continue;
    if (url.startsWith('//')) continue;
    if (url.startsWith('/go/')) continue;
    if (!targetExists(url)) {
      broken.push(`${file.replace(root + '/', '')} -> ${url}`);
    }
  }
}

if (broken.length) {
  console.error('Broken internal links/assets found:');
  for (const item of broken) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files. No broken internal links/assets found.`);
