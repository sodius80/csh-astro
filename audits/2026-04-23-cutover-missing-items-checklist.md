# CSH Cutover Missing Items Checklist

Date: 2026-04-23
Project: `~/csh-astro`
Source of truth for legacy coverage: live WordPress sitemaps on `contractorsoftwarehub.com`

## Executive Summary

Current Astro content inventory:
- Reviews: **3**
- Comparisons: **3**
- Roundups: **13**
- Total content entries: **19**

Current WordPress post inventory:
- Reviews: **11**
- Comparisons: **7**
- Pricing: **3**
- Alternatives: **5**
- Roundups/other: **17**
- Total WP posts: **43**

## Cutover Blockers (Exact)

### 1. Missing review pages in Astro
These exist in WordPress but do **not** exist in `src/content/reviews/`:

- [ ] `acculynx-review` → target route should be `/reviews/acculynx/`
- [ ] `buildertrend-review` → target route should be `/reviews/buildertrend/`
- [ ] `buildxact-review` → target route should be `/reviews/buildxact/`
- [ ] `fieldedge-review` → target route should be `/reviews/fieldedge/`
- [ ] `jobnimbus-review` → target route should be `/reviews/jobnimbus/`
- [ ] `knowify-review` → target route should be `/reviews/knowify/`
- [ ] `service-fusion-review` → target route should be `/reviews/service-fusion/`
- [ ] `workiz-review` → target route should be `/reviews/workiz/`

### 2. Missing comparison pages in Astro
These exist in WordPress but do **not** exist in `src/content/comparisons/`:

- [ ] `acculynx-vs-jobnimbus` → `/compare/acculynx-vs-jobnimbus/`
- [ ] `fieldedge-vs-servicetitan` → `/compare/fieldedge-vs-servicetitan/`
- [ ] `housecall-pro-vs-servicetitan` → `/compare/housecall-pro-vs-servicetitan/`
- [ ] `jobber-vs-workiz` → `/compare/jobber-vs-workiz/`

### 3. Missing pricing pages in Astro
These exist in WordPress and have **no Astro equivalent yet**:

- [ ] `housecall-pro-pricing`
- [ ] `jobber-pricing-is-it-worth-it`
- [ ] `servicetitan-pricing`

### 4. Missing alternatives pages in Astro
These exist in WordPress and have **no Astro equivalent yet**:

- [ ] `followup-crm-alternatives`
- [ ] `housecall-pro-alternatives`
- [ ] `jobber-alternatives`
- [ ] `jobber-alternatives-landscaping-companies`
- [ ] `servicetitan-alternatives`

### 5. Missing roundup / functional pages in Astro
These WordPress posts do not have a clear Astro counterpart yet:

- [ ] `best-software-for-electrical-contractors`
- [ ] `best-proposal-software-for-contractors`
- [ ] `best-landscape-design-software-small-business`
- [ ] `best-time-tracking-software-for-small-contractor-businesses-2026`

### 6. Missing static pages / routes in Astro
These exist in WordPress `page-sitemap.xml` but do not currently exist as Astro pages:

- [ ] `privacy-policy`
- [ ] `terms-of-service`
- [ ] `best-contractor-software`

## Discovery / Data-Layer Blockers

### 7. Finder is under-reporting site coverage
`/finder/` currently exposes only the 3 dedicated review pages because `src/lib/content.ts` depends on roundup frontmatter `ranked`, but every current roundup has an empty `ranked` array.

All 13 current roundup files need structured data filled in:

- [ ] `best-accounting-software-electrical-contractors.mdx`
- [ ] `best-cad-software-contractors.mdx`
- [ ] `best-crm-contractors.mdx`
- [ ] `best-crm-siding-contractors.mdx`
- [ ] `best-estimating-software-general-contractors.mdx`
- [ ] `best-estimating-software-small-contractors.mdx`
- [ ] `best-scheduling-software-contractors.mdx`
- [ ] `best-software-painting-contractors.mdx`
- [ ] `hvac-software.mdx`
- [ ] `landscaping-software.mdx`
- [ ] `pest-control-software.mdx`
- [ ] `plumbing-software.mdx`
- [ ] `roofing-software.mdx`

For every roundup above, structured frontmatter is currently effectively missing:
- [ ] `ranked`
- [ ] `products`
- [ ] `faqs`

## Existing WordPress Posts That **Are** Represented in Astro

These do not need fresh migration, but most do need redirects because the Astro route differs from the WP slug.

### Reviews already represented
- [x] `jobber-review` → `/reviews/jobber/`
- [x] `housecall-pro-review` → `/reviews/housecall-pro/`
- [x] `servicetitan-review` → `/reviews/servicetitan/`

### Comparisons already represented
- [x] `jobber-vs-housecall-pro` → `/compare/jobber-vs-housecall-pro/`
- [x] `housecall-pro-vs-fieldedge` → `/compare/housecall-pro-vs-fieldedge/`
- [x] `servicetitan-vs-jobber` → `/compare/servicetitan-vs-jobber/`

### Roundups already represented
- [x] `best-pest-control-software` → `/best/pest-control-software/`
- [x] `best-crm-for-siding-contractors` → `/best/best-crm-siding-contractors/`
- [x] `best-cad-software-contractors` → `/best/best-cad-software-contractors/`
- [x] `best-scheduling-software-contractors` → `/best/best-scheduling-software-contractors/`
- [x] `best-crm-for-contractors` → `/best/best-crm-contractors/`
- [x] `best-landscaping-software-small-business` → `/best/landscaping-software/`
- [x] `best-estimating-software-general-contractors` → `/best/best-estimating-software-general-contractors/`
- [x] `best-roofing-software-contractors` → `/best/roofing-software/`
- [x] `best-plumbing-software-small-business` → `/best/plumbing-software/`
- [x] `best-hvac-software-small-business` → `/best/hvac-software/`
- [x] `best-accounting-software-for-electrical-contractors` → `/best/best-accounting-software-electrical-contractors/`
- [x] `best-software-for-painting-contractors` → `/best/best-software-painting-contractors/`
- [x] `best-estimating-software-for-small-contractors` → `/best/best-estimating-software-small-contractors/`

## Redirect Checklist Required Before Cutover

## 8. Redirect file is missing
There is currently **no `vercel.json`** in the Astro project.

That means the following redirect classes still need explicit coverage:

### WordPress slug → Astro route redirects needed

#### Reviews
- [ ] `/jobber-review/` → `/reviews/jobber/`
- [ ] `/housecall-pro-review/` → `/reviews/housecall-pro/`
- [ ] `/servicetitan-review/` → `/reviews/servicetitan/`

#### Comparisons
- [ ] `/jobber-vs-housecall-pro/` → `/compare/jobber-vs-housecall-pro/`
- [ ] `/housecall-pro-vs-fieldedge/` → `/compare/housecall-pro-vs-fieldedge/`
- [ ] `/servicetitan-vs-jobber/` → `/compare/servicetitan-vs-jobber/`

#### Renamed roundups
- [ ] `/best-pest-control-software/` → `/best/pest-control-software/`
- [ ] `/best-crm-for-siding-contractors/` → `/best/best-crm-siding-contractors/`
- [ ] `/best-crm-for-contractors/` → `/best/best-crm-contractors/`
- [ ] `/best-landscaping-software-small-business/` → `/best/landscaping-software/`
- [ ] `/best-roofing-software-contractors/` → `/best/roofing-software/`
- [ ] `/best-plumbing-software-small-business/` → `/best/plumbing-software/`
- [ ] `/best-hvac-software-small-business/` → `/best/hvac-software/`
- [ ] `/best-accounting-software-for-electrical-contractors/` → `/best/best-accounting-software-electrical-contractors/`
- [ ] `/best-software-for-painting-contractors/` → `/best/best-software-painting-contractors/`
- [ ] `/best-estimating-software-for-small-contractors/` → `/best/best-estimating-software-small-contractors/`

### Static page redirects / replacements needed
- [ ] `/best-contractor-software/` → decide: migrate as page, or redirect to `/best/` or `/finder/`
- [ ] `/privacy-policy/` → create page or redirect
- [ ] `/terms-of-service/` → create page or redirect

### Affiliate redirect coverage still needed
The migration workflow expects legacy `/go/...` shortlinks to be mapped in `vercel.json`, but redirect config does not yet exist.
- [ ] inventory current `/go/` links in WP content
- [ ] add non-permanent redirects for `/go/...` paths

## Technical Readiness Notes

### Passed
- [x] `npm run validate`
- [x] local build generates routes successfully
- [x] generated-link check found no broken internal links/assets in current build

### Still missing / unconfirmed
- [ ] redirect config (`vercel.json`)
- [ ] sitemap integration
- [ ] robots handling
- [ ] full WP→Astro parity for reviews/comparisons/pricing/alternatives/functional pages
- [ ] structured roundup discovery data so finder/categories reflect actual coverage

## Recommended Migration Order

### P0
1. Migrate missing reviews
2. Migrate missing comparisons
3. Migrate pricing + alternatives pages
4. Fill `ranked` / `products` frontmatter on all existing roundups

### P1
5. Migrate the 4 missing roundup/functional pages
6. Add missing static/legal pages
7. Add `vercel.json` redirect map

### P2
8. Add sitemap + robots support
9. Re-run cutover parity audit before DNS switch
