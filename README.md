# Contractor Software Hub — Astro

Independent software coverage for contractors in the trades. Static site built with Astro + MDX.

## Design

This site implements the **v1 Industrial** direction from the `ContractorSoftwareHub` design handoff — rugged editorial with Archivo Black display, Newsreader serif body, kraft paper background, orange accent, and "stamped review" ratings.

## Stack

- [Astro 6](https://astro.build) (static output)
- MDX for long-form content
- Vanilla CSS with design tokens — no Tailwind, no CSS-in-JS
- Vercel for hosting + redirects

## Structure

```
src/
├── components/               Shared Astro components
│   ├── SiteHeader.astro
│   ├── SiteFooter.astro
│   ├── RatingStamp.astro
│   ├── VendorLogo.astro
│   ├── ProsConsGrid.astro
│   ├── DoYouNeedThis.astro
│   ├── RankedEntry.astro
│   ├── FAQAccordion.astro
│   └── RuleLabel.astro
├── content/
│   ├── reviews/              Individual vendor reviews       → /reviews/[slug]
│   ├── comparisons/          Head-to-head comparisons        → /compare/[slug]
│   └── roundups/             Best-of category roundups       → /best/[slug]
├── content.config.ts         Zod schemas for collections
├── layouts/
│   └── BaseLayout.astro      SEO + header + footer wrapper
├── pages/
│   ├── index.astro                 Home
│   ├── reviews/index.astro         All reviews matrix (filterable)
│   ├── reviews/[slug].astro        Single review
│   ├── compare/index.astro         All comparisons
│   ├── compare/[slug].astro        Single comparison
│   ├── best/index.astro            All roundups
│   ├── best/[slug].astro           Single roundup
│   ├── about/index.astro
│   ├── contact/index.astro
│   ├── affiliate-disclosure/index.astro
│   ├── how-we-review/index.astro
│   └── 404.astro
└── styles/
    └── global.css            All design tokens + shared component styles
```

## Routes

| Route | Template |
|---|---|
| `/` | Home |
| `/reviews/` | All Reviews (sortable matrix) |
| `/reviews/[slug]/` | Single vendor review |
| `/compare/` | All comparisons |
| `/compare/[slug]/` | Head-to-head comparison |
| `/best/` | All best-of roundups |
| `/best/[slug]/` | Single category roundup |
| `/about/`, `/contact/`, `/affiliate-disclosure/`, `/how-we-review/` | Static pages |

Redirects from legacy WordPress URLs and the previous `/blog/*` structure are in `vercel.json`.

## Scripts

```bash
npm run dev       # local dev (4321)
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

## Content authoring

All three content collections are MDX with structured frontmatter. See `src/content.config.ts` for the Zod schemas.

- **Reviews** need: vendor, category, rating (top-pick/recommended/conditional/skip), verdictShort, startingPrice, bestFor, trades, affiliateUrl, pros/cons, quickFacts.
- **Comparisons** need: vendorA + vendorB (name/slug/tag/price/url), shortAnswer (aWhen/bWhen/nuance), atAGlance table, chooseA/chooseB bullet lists.
- **Roundups** need: category, heroHeadline/heroSubhead, optional doYouNeed gate (rule + do/don't bullets). The long-form body renders after the rankings.

Add new content by dropping a `.mdx` file into the appropriate folder — the route is generated automatically.

## Design tokens

All tokens live in `src/styles/global.css`:

- `--paper` / `--paper-deep` — kraft/manila backgrounds
- `--ink` / `--ink-2` / `--graphite` — text/border hierarchy
- `--orange` / `--orange-deep` — primary accent (CTAs, Top Pick stamps)
- `--navy` / `--green` / `--red` — conditional / recommended / skip stamps
- `--display` (Archivo Black), `--serif` (Newsreader), `--ui` (Archivo), `--mono` (JetBrains Mono)

## Migration

Content was migrated from the previous `blog/` collection to the three new collections via `scripts/migrate-content.mjs`. That script is a one-shot and can be deleted once the migration is confirmed.
