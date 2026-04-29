/**
 * Root-level slug mappings.
 * All content renders at root URLs to preserve WordPress URL parity.
 * Category hub pages stay at /reviews/, /compare/, /best/.
 */

/** Maps roundup entry IDs to their root-level URL slug */
const ROUNDUP_ROOT_SLUGS: Record<string, string> = {
  'hvac-software': 'best-hvac-software-small-business',
  'plumbing-software': 'best-plumbing-software-small-business',
  'roofing-software': 'best-roofing-software-contractors',
  'landscaping-software': 'best-landscaping-software-small-business',
  'pest-control-software': 'best-pest-control-software',
  'best-crm-contractors': 'best-crm-for-contractors',
  'best-crm-siding-contractors': 'best-crm-for-siding-contractors',
  'best-cad-software-contractors': 'best-cad-software-contractors',
  'best-estimating-software-small-contractors': 'best-estimating-software-for-small-contractors',
  'best-estimating-software-general-contractors': 'best-estimating-software-general-contractors',
  'best-scheduling-software-contractors': 'best-scheduling-software-contractors',
  'best-software-painting-contractors': 'best-software-for-painting-contractors',
  'best-accounting-software-electrical-contractors': 'best-accounting-software-for-electrical-contractors',
};

export function reviewRootSlug(id: string): string {
  // Prevent double '-review' suffix for IDs that already contain it (e.g. procore-review-2026)
  if (id.includes('-review')) return id;
  return `${id}-review`;
}

export function comparisonRootSlug(id: string): string {
  return id;
}

export function roundupRootSlug(id: string): string {
  return ROUNDUP_ROOT_SLUGS[id] ?? id;
}

export function guideRootSlug(id: string): string {
  return id;
}

/** Reverse lookup: given a root slug, find the roundup ID (if any) */
export function roundupIdFromRootSlug(rootSlug: string): string | undefined {
  for (const [id, slug] of Object.entries(ROUNDUP_ROOT_SLUGS)) {
    if (slug === rootSlug) return id;
  }
  return undefined;
}
