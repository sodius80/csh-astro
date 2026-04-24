# Complete CSH Cutover Migration Plan

> **For Hermes:** Use subagent-driven-development to execute this migration in batches with validation after each slice.

**Goal:** Fully migrate missing ContractorSoftwareHub WordPress content and cutover assets into the Astro site so the site can replace WordPress without losing coverage, URLs, or discovery depth.

**Architecture:** Keep structured review/comparison content in existing Astro collections, add a generic guide pathway for pricing/alternatives/functional legacy slugs that do not cleanly fit the current collections, backfill roundup structured data for discovery surfaces, and add redirects/SEO assets needed for production cutover.

**Tech Stack:** Astro, MDX, TypeScript content collections, Vercel redirects, WordPress REST API JSON exports, Python/terminal automation.

---

### Task 1: Materialize migration source data
**Objective:** Freeze all missing WordPress source content into local raw JSON files so migration work is deterministic.

**Files:**
- Existing: `~/csh-astro/migration/raw/posts/*.json`
- Existing: `~/csh-astro/migration/raw/pages/*.json`
- Existing: `~/csh-astro/migration/raw/summary.json`

**Verification:** Confirm raw JSON exists for all missing posts/pages except any intentionally unresolved item.

### Task 2: Migrate missing review pages
**Objective:** Add missing vendor reviews to `src/content/reviews/` using the existing review schema.

**Files:**
- Create: `src/content/reviews/acculynx.mdx`
- Create: `src/content/reviews/buildertrend.mdx`
- Create: `src/content/reviews/buildxact.mdx`
- Create: `src/content/reviews/fieldedge.mdx`
- Create: `src/content/reviews/jobnimbus.mdx`
- Create: `src/content/reviews/knowify.mdx`
- Create: `src/content/reviews/service-fusion.mdx`
- Create: `src/content/reviews/workiz.mdx`

**Verification:** `npm run validate` still passes and `/reviews/` count increases appropriately.

### Task 3: Migrate missing comparison pages
**Objective:** Add missing comparisons to `src/content/comparisons/` using the existing comparison schema.

**Files:**
- Create: `src/content/comparisons/acculynx-vs-jobnimbus.mdx`
- Create: `src/content/comparisons/fieldedge-vs-servicetitan.mdx`
- Create: `src/content/comparisons/housecall-pro-vs-servicetitan.mdx`
- Create: `src/content/comparisons/jobber-vs-workiz.mdx`

**Verification:** `npm run validate` still passes and `/compare/` count increases appropriately.

### Task 4: Add legacy guide route + collection for pricing/alternatives/functional posts
**Objective:** Support root-level legacy slugs that do not fit current review/comparison/roundup collections.

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/guides/*.mdx`
- Create: `src/pages/[slug].astro`

**Guide slugs to create:**
- `housecall-pro-pricing`
- `jobber-pricing-is-it-worth-it`
- `servicetitan-pricing`
- `followup-crm-alternatives`
- `housecall-pro-alternatives`
- `jobber-alternatives`
- `jobber-alternatives-landscaping-companies`
- `servicetitan-alternatives`
- `best-software-for-electrical-contractors`
- `best-proposal-software-for-contractors`
- `best-landscape-design-software-small-business`
- `best-time-tracking-software-for-small-contractor-businesses-2026`
- `best-contractor-software`

**Verification:** `npm run validate` passes and the generated `dist/` contains each root-level slug.

### Task 5: Add missing legal/static pages
**Objective:** Replace WordPress-only pages required before cutover.

**Files:**
- Create: `src/pages/privacy-policy/index.astro`
- Create: `src/pages/terms-of-service/index.astro`

**Verification:** Routes build successfully and metadata is present.

### Task 6: Backfill roundup structured discovery data
**Objective:** Fill `ranked`, `products`, and `faqs` frontmatter for all existing roundups so finder/category discovery exposes the full software base.

**Files:**
- Modify all files under `src/content/roundups/*.mdx`
- Verify `src/lib/content.ts` consumers (`finder`, category pages, home counts) reflect the expanded data.

**Verification:** `/finder/` no longer shows only 3 software entries.

### Task 7: Add cutover redirects and SEO assets
**Objective:** Preserve legacy URL equity and production crawlability.

**Files:**
- Create: `vercel.json`
- Modify: `astro.config.mjs` (sitemap integration if chosen)
- Add robots handling if needed

**Redirect coverage:**
- WP review slugs to `/reviews/.../`
- WP comparison slugs to `/compare/.../`
- Renamed roundup slugs to `/best/.../`
- `/go/...` affiliate paths to outbound destinations

**Verification:** `npm run validate` passes and redirect file covers the legacy mappings.

### Task 8: Final cutover audit
**Objective:** Confirm the migration is materially complete and identify any residual blockers.

**Files:**
- Update: `audits/2026-04-23-cutover-missing-items-checklist.md`

**Verification:**
- `npm run validate`
- inventory recount vs WP
- check generated route coverage for migrated slugs
- summarize any remaining unresolved items explicitly
