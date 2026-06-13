# contractorsoftwarehub.com — content conventions

## URL slugs: NEVER put a year in a slug

**Slugs are year-free. Years belong in titles only.** (Chris ruling, 2026-06-12.)

- Correct: file `zoho-invoice-review.mdx`, title `"Zoho Invoice Free Plan Review (2026): Is It Really Free?"`
- Wrong: file `zoho-invoice-review-2026.mdx`

Why: all content here is evergreen and continuously updated. The title year is bumped annually (one-line edit, good for CTR). A year in the URL either goes visibly stale or forces a redirect migration every January. Do not copy the year-suffix pattern from older files — those are legacy slugs awaiting migration (see `~/.hermes/solo/project-plans/year-free-slug-migration-2026-06-12.md`).

This applies to reviews, comparisons, roundups, and guides. The filename is the slug (no `slug:` frontmatter override unless deliberately preserving a legacy URL).

## Renaming any published page

If you rename a live page, in the SAME commit you must:
1. Add 301 redirects in `vercel.json` for BOTH `/old-slug` and `/old-slug/` → `/new-slug/`.
2. Update every internal link to it: `grep -rn "old-slug" src/`.

Never delete or repurpose an existing redirect entry — old URLs must keep working forever.
