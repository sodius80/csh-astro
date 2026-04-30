import yaml, re
from pathlib import Path

fixes = {
    'acculynx-vs-jobnimbus.mdx': {
        'vendorA': {'affiliateUrl': '/go/acculynx-official-site/'},
        'vendorB': {'affiliateUrl': '/go/jobnimbus-official-site/'},
    },
    'buildxact-vs-joist-2026.mdx': {
        'vendorA': {'affiliateUrl': '/go/buildxact-official-site/'},
        'vendorB': {'affiliateUrl': 'https://www.joist.com'},
    },
    'fieldedge-vs-servicetitan.mdx': {
        'vendorA': {'affiliateUrl': '/go/fieldedge-official-site/'},
    },
    'housecall-pro-vs-fieldedge.mdx': {
        'vendorB': {'affiliateUrl': '/go/fieldedge-official-site/'},
    },
    'jobber-vs-workiz.mdx': {
        'vendorB': {'affiliateUrl': '/go/workiz-official-site/'},
    },
    'jobtread-vs-buildertrend-2026.mdx': {
        'vendorA': {'affiliateUrl': 'https://www.jobtread.com'},
        'vendorB': {'affiliateUrl': 'https://www.buildertrend.com'},
    },
    'joist-vs-clear-estimates-2026.mdx': {
        'vendorA': {'affiliateUrl': 'https://www.joist.com'},
        'vendorB': {'affiliateUrl': 'https://www.clearestimates.com'},
    },
    'zuper-vs-acculynx-2026.mdx': {
        'vendorA': {'affiliateUrl': 'https://www.zuper.co'},
        'vendorB': {'affiliateUrl': '/go/acculynx-official-site/'},
    },
}

for fname, vendor_fixes in fixes.items():
    f = Path('src/content/comparisons') / fname
    if not f.exists():
        print(f'SKIP: {fname} (not found)')
        continue
    text = f.read_text()
    fm_match = re.match(r'^(---\n.*?)\n(---\n)', text, re.DOTALL)
    if not fm_match:
        print(f'SKIP: {fname} (no frontmatter)')
        continue

    fm_raw = fm_match.group(1) + '\n' + fm_match.group(2)
    body = text[fm_match.end():]

    # Parse YAML
    data = yaml.safe_load(fm_match.group(1).replace('---\n', '', 1) + '\n')
    if not data:
        continue

    changed = False
    for vendor_key, updates in vendor_fixes.items():
        v = data.get(vendor_key)
        if isinstance(v, dict):
            for attr, val in updates.items():
                if v.get(attr, '') == '' and val:
                    v[attr] = val
                    changed = True

    if changed:
        # Serialize back preserving style (ruamel.yaml would be better but yaml.SafeDumper is ok)
        new_fm = '---\n' + yaml.safe_dump(data, sort_keys=False, default_flow_style=False) + '---\n'
        f.write_text(new_fm + body)
        print(f'UPDATED: {fname}')
    else:
        print(f'UNCHANGED: {fname}')

# Also fix the remaining reviews with empty affiliateUrl
review_generic = {
    'arborgold-review-2026.mdx': 'https://www.arborgold.com',
    'arbostar-review-2026.mdx': 'https://arbostar.com',
    'exayard-2026.mdx': 'https://www.exayard.com',
}

for fname, url in review_generic.items():
    f = Path('src/content/reviews') / fname
    if not f.exists():
        continue
    text = f.read_text()
    fm_match = re.match(r'^(---\n.*?)\n(---\n)', text, re.DOTALL)
    if not fm_match:
        continue
    data = yaml.safe_load(fm_match.group(1).replace('---\n', '', 1) + '\n')
    if data and data.get('affiliateUrl', '') == '' and url:
        data['affiliateUrl'] = url
        body = text[fm_match.end():]
        new_fm = '---\n' + yaml.safe_dump(data, sort_keys=False, default_flow_style=False) + '---\n'
        f.write_text(new_fm + body)
        print(f'UPDATED REVIEW: {fname}')
