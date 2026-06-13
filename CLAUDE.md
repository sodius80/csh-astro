# contractorsoftwarehub.com — content conventions

## NO YEARS in slugs OR titles

**Slugs, titles, and heroHeadlines are year-free.** (Chris ruling, 2026-06-12.)

- Correct: file `zoho-invoice-review.mdx`, title `"Zoho Invoice Free Plan Review: Is It Really Free?"`
- Wrong: file `zoho-invoice-review-2026.mdx`, or title `"... Review (2026): ..."`

Why: all content here is evergreen and continuously updated. Freshness is signaled by `updatedDate`, not a year stamp. A year anywhere goes visibly stale and forces annual churn. Do not copy year patterns from older files — those are legacy, pending cleanup.

Exception: if a year is part of a product's official name (e.g. "AutoCAD LT 2026") or the piece is intrinsically about one year, escalate to Chris instead of publishing.

This applies to reviews, comparisons, roundups, and guides. The filename is the slug (no `slug:` frontmatter override unless deliberately preserving a legacy URL). Gatekeeper hard-reds `year_in_slug` and `year_in_title` violations.

## Renaming any published page

If you rename a live page, in the SAME commit you must:
1. Add 301 redirects in `vercel.json` for BOTH `/old-slug` and `/old-slug/` → `/new-slug/`.
2. Update every internal link to it: `grep -rn "old-slug" src/`.

Never delete or repurpose an existing redirect entry — old URLs must keep working forever. Title edits are just frontmatter — no redirects involved.
