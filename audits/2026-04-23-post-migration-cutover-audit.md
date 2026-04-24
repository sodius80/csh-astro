# CSH Post-Migration Cutover Audit

Date: 2026-04-23
Workspace: `~/csh-astro`
Source parity baseline: live WordPress sitemaps on `contractorsoftwarehub.com`

## Final Status

The migration is now materially complete for current live WordPress coverage.

### Local Astro inventory
- Reviews: **11**
- Comparisons: **7**
- Roundups: **13**
- Guides (legacy root-level pricing/alternatives/functional pages): **13**
- Total content entries: **44**

### Current WordPress inventory
- Posts in `post-sitemap.xml`: **43** (after excluding `/wp-content/uploads/` image URLs)
- Pages in `page-sitemap.xml`: **8** including homepage

### Coverage result
- Missing WP post slugs in Astro representation: **0**
- Missing WP page slugs in Astro representation: **0**

## What was migrated

### Reviews now present
- `/reviews/acculynx/`
- `/reviews/buildertrend/`
- `/reviews/buildxact/`
- `/reviews/fieldedge/`
- `/reviews/housecall-pro/`
- `/reviews/jobber/`
- `/reviews/jobnimbus/`
- `/reviews/knowify/`
- `/reviews/service-fusion/`
- `/reviews/servicetitan/`
- `/reviews/workiz/`

### Comparisons now present
- `/compare/acculynx-vs-jobnimbus/`
- `/compare/fieldedge-vs-servicetitan/`
- `/compare/housecall-pro-vs-fieldedge/`
- `/compare/housecall-pro-vs-servicetitan/`
- `/compare/jobber-vs-housecall-pro/`
- `/compare/jobber-vs-workiz/`
- `/compare/servicetitan-vs-jobber/`

### Legacy root-level guides now present
- `/housecall-pro-pricing/`
- `/jobber-pricing-is-it-worth-it/`
- `/servicetitan-pricing/`
- `/followup-crm-alternatives/`
- `/housecall-pro-alternatives/`
- `/jobber-alternatives/`
- `/jobber-alternatives-landscaping-companies/`
- `/servicetitan-alternatives/`
- `/best-software-for-electrical-contractors/`
- `/best-proposal-software-for-contractors/`
- `/best-landscape-design-software-small-business/`
- `/best-time-tracking-software-for-small-contractor-businesses-2026/`
- `/best-contractor-software/`

### Static/legal pages now present
- `/privacy-policy/`
- `/terms-of-service/`

## Discovery / UX improvements completed

### Roundup structured data backfilled
All 13 roundup files now include structured frontmatter data for discovery surfaces.

Backfilled totals:
- `ranked[]`: **63** items
- `products[]`: **63** items
- `faqs[]`: **33** items

### Finder coverage after backfill
- Finder entries: **85**
  - reviews: 11
  - roundup-derived software entries: 61
  - guides: 13

This resolves the prior problem where the finder effectively surfaced only 3 tools.

## Cutover assets added

### Redirects
`vercel.json` now includes:
- legacy WP review/comparison/renamed-roundup redirects
- legacy `/go/...` affiliate redirects

Summary:
- permanent legacy content redirect entries: **62** (slash + no-slash variants)
- non-permanent `/go/...` redirect entries: **11**

### SEO assets
- sitemap integration enabled via `@astrojs/sitemap`
- `site` configured in `astro.config.mjs`
- `robots.txt` route added with sitemap reference

## Validation

Latest verification run:
- `npm run validate` ✅ passed
- Astro build output: **74 pages**
- generated-link check: **no broken internal links/assets found**
- sitemap generated: `dist/sitemap-index.xml`
- local preview smoke checks returned `200 OK` for `/`, `/reviews/acculynx/`, `/compare/acculynx-vs-jobnimbus/`, `/best-proposal-software-for-contractors/`, `/robots.txt`, and `/sitemap-index.xml`

## Remaining soft follow-ups (not blockers)
These are polish items, not cutover blockers:
- Review category normalization if you want fewer category variants in `/categories/`
- Decide whether guides should be promoted more aggressively in nav/homepage sections beyond finder/recent coverage
- Optional image localization if you want every migrated hero image copied into `/public/images/` instead of using source URLs from WP media for some migrated entries

## Cutover Recommendation

From a content-parity and technical-validation perspective, the Astro site is now in a state where DNS cutover can be planned.

Recommended next operational step:
1. preview production deployment on Vercel
2. smoke-test representative URLs
3. confirm DNS/domain cutover window
4. switch traffic
