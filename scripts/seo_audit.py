import os, re, json, math
from pathlib import Path
from urllib.parse import urljoin, urlparse
import html

# =============== CONFIG ===============
DIST_DIR = Path('/Users/chris/csh-astro/dist')
SRC_DIR = Path('/Users/chris/csh-astro/src')
CONTENT_DIR = SRC_DIR / 'content'
SITE = 'https://www.contractorsoftwarehub.com'

# =============== OUTPUT ===============
critical = []
high = []
medium = []
low = []
passed = []

# =============== HELPERS ===============
def add_issue(severity, msg, fix=None):
    entry = f"{msg}" + (f" | FIX: {fix}" if fix else "")
    if severity == 'critical':
        critical.append(entry)
    elif severity == 'high':
        high.append(entry)
    elif severity == 'medium':
        medium.append(entry)
    else:
        low.append(entry)

def add_pass(msg):
    passed.append(msg)

# Resolve a local href to a file path in dist/
def href_to_file(href):
    if href.startswith('http'):
        return None
    # Strip hash/params
    clean = href.split('#')[0].split('?')[0]
    if clean.endswith('/'):
        return DIST_DIR / clean.lstrip('/') / 'index.html'
    else:
        # Maybe a file with extension? dist/ outputs directories, not bare html files, except root files
        if '.' in Path(clean).name:
            return DIST_DIR / clean.lstrip('/')
        else:
            return DIST_DIR / clean.lstrip('/') / 'index.html'

# =============== TEST 1: robots.txt ===============
robots_path = DIST_DIR / 'robots.txt'
if not robots_path.exists():
    add_issue('critical', 'Missing robots.txt in dist/', 'Ensure src/pages/robots.txt.ts builds correctly')
else:
    robots_text = robots_path.read_text()
    if 'Sitemap' in robots_text or 'sitemap' in robots_text:
        add_pass('robots.txt exists and references sitemap')
    else:
        add_issue('high', 'robots.txt exists but does not reference sitemap')

# =============== TEST 2: Sitemap ===============
sitemap_path = DIST_DIR / 'sitemap-index.xml'
if not sitemap_path.exists():
    add_issue('critical', 'Missing sitemap-index.xml')
else:
    add_pass('sitemap-index.xml exists')
    # Count indexed pages
    sitemap_content = sitemap_path.read_text()
    locs = re.findall(r'<loc>([^<]+)</loc>', sitemap_content)
    # Also read referenced sitemaps
    total_urls = 0
    for loc in locs:
        fname = loc.split('/')[-1]
        sp = DIST_DIR / fname
        if sp.exists():
            cnt = sp.read_text()
            urls = re.findall(r'<loc>([^<]+)</loc>', cnt)
            total_urls += len(urls)
    add_pass(f'Sitemap contains {total_urls} URLs')

# =============== TEST 3: Build artifact checks (favicon, manifest) ===============
for fname in ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'site.webmanifest']:
    if (DIST_DIR / fname).exists():
        add_pass(f'{fname} present in dist/')
    else:
        add_issue('high' if fname != 'site.webmanifest' else 'medium', f'Missing {fname} in dist/')

# =============== TEST 4: Per-page SEO scan ===============
html_files = list(DIST_DIR.rglob('*.html'))
add_pass(f'Built {len(html_files)} HTML files')

titles = {}
descriptions = {}
canonicals = {}

for html_file in html_files:
    rel = html_file.relative_to(DIST_DIR)
    text = html_file.read_text(encoding='utf-8')
    
    # Title
    title_match = re.search(r'<title>(.*?)</title>', text, re.IGNORECASE | re.DOTALL)
    if not title_match:
        add_issue('critical', f'{rel}: missing <title>', 'Add title tag in layout or page component')
    else:
        t = title_match.group(1).strip()
        if not t:
            add_issue('critical', f'{rel}: empty <title>')
        else:
            titles.setdefault(t, []).append(str(rel))
    
    # Meta description
    desc_match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)["\']', text, re.IGNORECASE) or \
                  re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']description["\']', text, re.IGNORECASE)
    if not desc_match:
        add_issue('high', f'{rel}: missing meta description')
    else:
        d = desc_match.group(1).strip()
        if len(d) < 50:
            add_issue('high', f'{rel}: meta description too short ({len(d)} chars)', 'Write a descriptive 120-160 char description')
        elif len(d) > 170:
            add_issue('medium', f'{rel}: meta description possibly truncated ({len(d)} chars)')
        descriptions.setdefault(d, []).append(str(rel))
    
    # Canonical
    can_match = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', text, re.IGNORECASE) or \
                re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', text, re.IGNORECASE)
    if not can_match:
        add_issue('high', f'{rel}: missing canonical link', 'Add <link rel="canonical"> in BaseLayout')
    else:
        c = can_match.group(1)
        canonicals.setdefault(c, []).append(str(rel))
        # Check for trailing slash consistency
        if c.endswith('/') and not str(rel).endswith('index.html'):
            pass  # fine
        elif not c.endswith('/') and str(rel).endswith('index.html'):
            pass  # possible mismatch, but not critical
    
    # OG tags
    missing_og = []
    for prop in ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']:
        if not re.search(rf'<meta[^>]+property=["\']{prop}["\']', text, re.IGNORECASE):
            missing_og.append(prop)
    if missing_og:
        add_issue('high', f'{rel}: missing Open Graph tags: {", ".join(missing_og)}')
    
    # Twitter card
    if not re.search(r'<meta[^>]+name=["\']twitter:card["\']', text, re.IGNORECASE):
        add_issue('medium', f'{rel}: missing twitter:card meta')
    
    # Viewport
    if not re.search(r'<meta[^>]+name=["\']viewport["\']', text, re.IGNORECASE):
        add_issue('high', f'{rel}: missing viewport meta')
    
    # H1
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', text, re.IGNORECASE | re.DOTALL)
    if len(h1s) == 0:
        add_issue('critical', f'{rel}: missing H1 tag', 'Add <h1> in page component')
    elif len(h1s) > 1:
        add_issue('medium', f'{rel}: multiple H1 tags ({len(h1s)})')
    else:
        h1_text = re.sub(r'<[^>]+>', '', h1s[0]).strip()
        if not h1_text:
            add_issue('critical', f'{rel}: empty H1 tag')
    
    # Images missing alt
    imgs = re.findall(r'<img[^>]+>', text, re.IGNORECASE)
    for img in imgs:
        if 'alt=' not in img.lower():
            # Skip decorative images or icons if they have aria-hidden
            if 'aria-hidden' not in img.lower():
                add_issue('medium', f'{rel}: <img> missing alt attribute')
                break  # one per page is enough for report
        else:
            alt_val = re.search(r'alt=["\']([^"\']*)["\']', img, re.IGNORECASE)
            if alt_val and not alt_val.group(1).strip():
                pass  # empty alt is okay for decorative, skip flag

    # Placeholder text
    low_text = text.lower()
    for ph in ['lorem ipsum', 'coming soon', 'placeholder', 'todo', 'fixme', 'xxx', '????']:
        if ph in low_text:
            add_issue('critical', f'{rel}: possible placeholder text detected: "{ph}"')

    # Stale year in title vs filename
    fname = str(rel).replace('index.html', '').strip('/')
    year_in_fname = re.search(r'(20\d{2})', fname)
    if title_match:
        title_text = title_match.group(1)
        year_in_title = re.search(r'(20\d{2})', title_text)
        if year_in_fname and year_in_title:
            if year_in_fname.group(1) != year_in_title.group(1):
                add_issue('high', f'{rel}: year in title ({year_in_title.group(1)}) does not match slug year ({year_in_fname.group(1)})')

# Duplicate titles
for t, files in titles.items():
    if len(files) > 1:
        add_issue('high', f'Duplicate title "{t}" on {len(files)} pages: {", ".join(files[:3])}')

# =============== TEST 5: Broken internal links ===============
print("\n" + "="*60)
print("Scanning internal links...")

internal_hrefs = set()
for html_file in html_files:
    text = html_file.read_text(encoding='utf-8')
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', text)
    for href in hrefs:
        if href.startswith('http') and not href.startswith(SITE):
            continue  # external
        if href.startswith('#') or href.startswith('mailto:') or href.startswith('tel:'):
            continue
        if href.startswith('https://www.contractorsoftwarehub.com'):
            href = href[len('https://www.contractorsoftwarehub.com'):]
        if href.startswith('http'):
            continue  # other external
        internal_hrefs.add((href, str(html_file.relative_to(DIST_DIR))))

broken_links = []
for href, src_page in internal_hrefs:
    # Determine expected file path
    clean = href.split('#')[0].split('?')[0]
    if clean == '' or clean == '/':
        continue  # root
    if clean.endswith('/'):
        expected = DIST_DIR / clean.lstrip('/') / 'index.html'
    elif '.' in Path(clean).name:
        expected = DIST_DIR / clean.lstrip('/')
    else:
        expected = DIST_DIR / clean.lstrip('/') / 'index.html'
    if not expected.exists():
        broken_links.append((href, src_page))

if broken_links:
    for href, src in broken_links[:20]:
        add_issue('critical', f'Broken internal link: href="{href}" from {src}')
    if len(broken_links) > 20:
        add_issue('critical', f'... and {len(broken_links)-20} more broken links')
else:
    add_pass(f'All {len(internal_hrefs)} internal links resolve successfully')

# =============== TEST 6: Source content audit ===============
print("" + "="*60)
print("Scanning source content...")

# Check content collections exist
for col in ['reviews', 'comparisons', 'roundups', 'guides']:
    col_dir = CONTENT_DIR / col
    if col_dir.exists():
        files = list(col_dir.glob('*.mdx'))
        add_pass(f'Content collection "{col}": {len(files)} files')
    else:
        add_issue('medium', f'Content collection "{col}" directory missing')

# Word count check
word_counts = []
if CONTENT_DIR.exists():
    for mdx_file in CONTENT_DIR.rglob('*.mdx'):
        text = mdx_file.read_text(encoding='utf-8')
        # Strip frontmatter
        body = re.sub(r'^---\n.*?\n---\n', '', text, flags=re.DOTALL, count=1)
        # Strip HTML
        clean = re.sub(r'<[^>]+>', ' ', body)
        clean = re.sub(r'[#*|*\[\]\(\)\-_`>]',' ', clean)
        words = [w for w in clean.split() if w.strip()]
        word_counts.append((mdx_file.stem, len(words), str(mdx_file.relative_to(SRC_DIR))))

word_counts.sort(key=lambda x: x[1])
stub_count = 0
thin_count = 0
for slug, wc, path in word_counts:
    if wc < 150:
        stub_count += 1
        add_issue('critical', f'{path}: only {wc} words — stub/wrapper', 'Expand or remove before considering SEO-ready')
    elif wc < 900:
        thin_count += 1
        add_issue('high', f'{path}: only {wc} words — thin for long-form', 'Expand to >1200 words for ranking potential')

# Check affiliate URLs
if CONTENT_DIR.exists():
    for mdx_file in CONTENT_DIR.rglob('*.mdx'):
        text = mdx_file.read_text(encoding='utf-8')
        fm_match = re.match(r'^---\n(.*?)\n---\n', text, re.DOTALL)
        if not fm_match:
            continue
        import yaml
        try:
            data = yaml.safe_load(fm_match.group(1)) or {}
        except Exception:
            continue
        # Check vendorA / vendorB / review affiliateUrl
        for k in ['affiliateUrl', 'vendorA', 'vendorB']:
            v = data.get(k)
            if isinstance(v, dict):
                url = v.get('affiliateUrl', '')
                if url == '':
                    add_issue('high', f'{mdx_file.name}: empty {k}.affiliateUrl')
            elif k == 'affiliateUrl' and isinstance(v, str) and v == '':
                add_issue('high', f'{mdx_file.name}: empty affiliateUrl')
        for item in data.get('ranked', []) + data.get('products', []):
            if isinstance(item, dict) and item.get('affiliateUrl') == '':
                add_issue('high', f'{mdx_file.name}: empty affiliateUrl in {item.get("name", "item")}')

# Stale collection-path links in source
stale_pattern = re.compile(r'href="(/reviews?/|/compare/|/best/)[^"]*"')
stale_issues = []
if CONTENT_DIR.exists():
    for mdx_file in CONTENT_DIR.rglob('*.mdx'):
        text = mdx_file.read_text(encoding='utf-8')
        for i, line in enumerate(text.split('\n'), 1):
            m = stale_pattern.search(line)
            if m:
                stale_issues.append(f'{mdx_file.name}:{i}: {m.group(0)}')
if stale_issues:
    for issue in stale_issues[:10]:
        add_issue('critical', f'Stale collection-path link: {issue}')
    if len(stale_issues) > 10:
        add_issue('critical', f'... and {len(stale_issues)-10} more stale links')

# Dead product references in roundups/comparisons
review_dir = CONTENT_DIR / 'reviews'
if review_dir.exists():
    existing_reviews = {f.stem for f in review_dir.glob('*.mdx')}
    known_redirects = {'jobtread'}  # customize per memory
    valid_slugs = existing_reviews | known_redirects
    for mdx_file in CONTENT_DIR.rglob('*.mdx'):
        text = mdx_file.read_text(encoding='utf-8')
        fm_match = re.match(r'^---\n(.*?)\n---\n', text, re.DOTALL)
        if not fm_match:
            continue
        import yaml
        try:
            data = yaml.safe_load(fm_match.group(1)) or {}
        except Exception:
            continue
        for entry in data.get('ranked', []) + data.get('products', []):
            slug = entry.get('slug', '')
            if slug and slug not in valid_slugs:
                add_issue('critical', f'{mdx_file.name}: dead slug "{slug}" (no review page for "{entry.get("name", "?")}")')

# Prohibited hype words
banned = ['game-changer','robust','streamline','leverage','cutting-edge','revolutionize','seamless','empower','supercharge','unlock','next-level','best-in-class','world-class','top-notch','state-of-the-art','comprehensive solution','take your business to the next level','whether you\'re a','in today\'s fast-paced world','at the end of the day','it\'s worth noting that','dive deep','deep dive','harness']
if CONTENT_DIR.exists():
    for mdx_file in CONTENT_DIR.rglob('*.mdx'):
        text = mdx_file.read_text(encoding='utf-8').lower()
        for w in banned:
            w_clean = w.replace(' (metaphor)', '').replace("\\'", "'")
            if w_clean in text:
                add_issue('medium', f'{mdx_file.name}: prohibited word "{w}"')
                break  # one per file

# Check for TODO/FIXME in source
if CONTENT_DIR.exists():
    todos = []
    for mdx_file in CONTENT_DIR.rglob('*.mdx'):
        text = mdx_file.read_text(encoding='utf-8')
        for i, line in enumerate(text.split('\n'), 1):
            if 'TODO' in line or 'FIXME' in line:
                todos.append(f'{mdx_file.name}:{i}: {line.strip()}')
    if todos:
        for t in todos[:10]:
            add_issue('critical', f'TODO/FIXME in source: {t}')

# =============== TEST 7: Structured Data (JSON-LD) spot check ===============
for html_file in html_files[:50]:  # spot check first 50
    text = html_file.read_text(encoding='utf-8')
    if 'application/ld+json' in text:
        break
else:
    add_issue('medium', 'No JSON-LD structured data found in first 50 pages. Consider adding Article/Review/Product schema.')

# =============== TEST 8: 404 page ===============
if (DIST_DIR / '404.html').exists():
    add_pass('404.html exists')
else:
    add_issue('high', 'Missing 404.html', 'Ensure src/pages/404.astro builds correctly')

# =============== TEST 9: Production endpoint checks ===============
import urllib.request

def fetch_head(url, timeout=10):
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.headers
    except Exception as e:
        return None, str(e)

def fetch(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        return None, str(e)

print("\n" + "="*60)
print("Production endpoint checks...")

# DNS check
code, txt = fetch(f'{SITE}/')
if code == 200:
    add_pass(f'Homepage returns HTTP 200')
    if '<title>' in txt:
        add_pass('Homepage has <title>')
    else:
        add_issue('critical', 'Homepage missing <title>')
else:
    add_issue('critical', f'Homepage unreachable: HTTP {code}')

# robots.txt live
code, txt = fetch(f'{SITE}/robots.txt')
if code == 200:
    add_pass('Live robots.txt accessible')
else:
    add_issue('critical', f'Live robots.txt inaccessible: HTTP {code}')

# Sitemap live
code, txt = fetch(f'{SITE}/sitemap-index.xml')
if code == 200:
    add_pass('Live sitemap-index.xml accessible')
else:
    add_issue('critical', f'Live sitemap-index.xml inaccessible: HTTP {code}')

# HTTPS redirect
code, txt = fetch(f'http://contractorsoftwarehub.com/')
if code in (301, 302, 307, 308):
    add_pass('HTTP redirects to HTTPS')
else:
    add_issue('high', f'HTTP does not redirect to HTTPS (HTTP {code})')

# Apex vs www consistency
# We'll check canonical consistency after we know the homepage HTML

# =============== REPORT ===============
print("\n" + "="*60)
print("# SEO / Pre-Launch Audit Report — contractorsoftwarehub.com")
print("="*60 + "\n")

print("## ✅ Passing Checks")
for p in passed:
    print(f"  ✅ {p}")

print("\n## ❌ Critical Issues ({})".format(len(critical)))
for i in critical:
    print(f"  ❌ {i}")

print("\n## ⚠️ High Priority Issues ({})".format(len(high)))
for i in high:
    print(f"  ⚠️ {i}")

print("\n## 📋 Medium Priority Issues ({})".format(len(medium)))
for i in medium:
    print(f"  📋 {i}")

print("\n## 🟢 Low Priority / Cosmetic ({})".format(len(low)))
for i in low:
    print(f"  🟢 {i}")

print(f"\n{'='*60}\n")
print(f"Summary: {len(critical)} critical, {len(high)} high, {len(medium)} medium, {len(low)} low")
