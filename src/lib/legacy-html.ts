const SITE_URL = 'https://www.contractorsoftwarehub.com';
const LEGACY_NON_WWW_URL = 'https://contractorsoftwarehub.com';

/**
 * Maps legacy WordPress URLs to their current root-level Astro URLs.
 * Since we now preserve WordPress URL structure, most mappings are identity.
 * This handles any remaining normalization needed for migrated content.
 */
const pathMap: Record<string, string> = {
  // Roundups — map to root URLs
  '/best-accounting-software-for-electrical-contractors/': '/best-accounting-software-for-electrical-contractors/',
  '/best-cad-software-contractors/': '/best-cad-software-contractors/',
  '/best-contractor-software/': '/best-contractor-software/',
  '/best-crm-for-contractors/': '/best-crm-for-contractors/',
  '/best-crm-for-siding-contractors/': '/best-crm-for-siding-contractors/',
  '/best-estimating-software-for-small-contractors/': '/best-estimating-software-for-small-contractors/',
  '/best-estimating-software-general-contractors/': '/best-estimating-software-general-contractors/',
  '/best-hvac-software-small-business/': '/best-hvac-software-small-business/',
  '/best-landscape-design-software-small-business/': '/best-landscape-design-software-small-business/',
  '/best-landscaping-software-small-business/': '/best-landscaping-software-small-business/',
  '/best-pest-control-software/': '/best-pest-control-software/',
  '/best-plumbing-software-small-business/': '/best-plumbing-software-small-business/',
  '/best-proposal-software-for-contractors/': '/best-proposal-software-for-contractors/',
  '/best-roofing-software-contractors/': '/best-roofing-software-contractors/',
  '/best-scheduling-software-contractors/': '/best-scheduling-software-contractors/',
  '/best-software-for-painting-contractors/': '/best-software-for-painting-contractors/',
  '/best-time-tracking-software-for-small-contractor-businesses-2026/': '/best-time-tracking-software-for-small-contractor-businesses-2026/',

  // Reviews — map to root URLs
  '/acculynx-review/': '/acculynx-review/',
  '/buildertrend-review/': '/buildertrend-review/',
  '/buildxact-review/': '/buildxact-review/',
  '/fieldedge-review/': '/fieldedge-review/',
  '/housecall-pro-review/': '/housecall-pro-review/',
  '/jobber-review/': '/jobber-review/',
  '/jobnimbus-review/': '/jobnimbus-review/',
  '/knowify-review/': '/knowify-review/',
  '/service-fusion-review/': '/service-fusion-review/',
  '/servicetitan-review/': '/servicetitan-review/',
  '/workiz-review/': '/workiz-review/',

  // Comparisons — map to root URLs
  '/acculynx-vs-jobnimbus/': '/acculynx-vs-jobnimbus/',
  '/fieldedge-vs-servicetitan/': '/fieldedge-vs-servicetitan/',
  '/housecall-pro-vs-fieldedge/': '/housecall-pro-vs-fieldedge/',
  '/housecall-pro-vs-servicetitan/': '/housecall-pro-vs-servicetitan/',
  '/jobber-vs-housecall-pro/': '/jobber-vs-housecall-pro/',
  '/jobber-vs-workiz/': '/jobber-vs-workiz/',
  '/servicetitan-vs-jobber/': '/servicetitan-vs-jobber/',

  // Guides / pricing / alternatives
  '/followup-crm-alternatives/': '/followup-crm-alternatives/',
  '/housecall-pro-alternatives/': '/housecall-pro-alternatives/',
  '/housecall-pro-pricing/': '/housecall-pro-pricing/',
  '/jobber-alternatives-landscaping-companies/': '/jobber-alternatives-landscaping-companies/',
  '/jobber-alternatives/': '/jobber-alternatives/',
  '/jobber-pricing-is-it-worth-it/': '/jobber-pricing-is-it-worth-it/',
  '/servicetitan-alternatives/': '/servicetitan-alternatives/',
  '/servicetitan-pricing/': '/servicetitan-pricing/',

  // Old Astro category URLs → redirect to root URLs (in case legacy content references them)
  '/reviews/acculynx/': '/acculynx-review/',
  '/reviews/buildertrend/': '/buildertrend-review/',
  '/reviews/buildxact/': '/buildxact-review/',
  '/reviews/fieldedge/': '/fieldedge-review/',
  '/reviews/housecall-pro/': '/housecall-pro-review/',
  '/reviews/jobber/': '/jobber-review/',
  '/reviews/jobnimbus/': '/jobnimbus-review/',
  '/reviews/knowify/': '/knowify-review/',
  '/reviews/service-fusion/': '/service-fusion-review/',
  '/reviews/servicetitan/': '/servicetitan-review/',
  '/reviews/workiz/': '/workiz-review/',
  '/compare/acculynx-vs-jobnimbus/': '/acculynx-vs-jobnimbus/',
  '/compare/fieldedge-vs-servicetitan/': '/fieldedge-vs-sicetitan/',
  '/compare/housecall-pro-vs-fieldedge/': '/housecall-pro-vs-fieldedge/',
  '/compare/housecall-pro-vs-servicetitan/': '/housecall-pro-vs-servicetitan/',
  '/compare/jobber-vs-housecall-pro/': '/jobber-vs-housecall-pro/',
  '/compare/jobber-vs-workiz/': '/jobber-vs-workiz/',
  '/compare/servicetitan-vs-jobber/': '/servicetitan-vs-jobber/',
  '/best/hvac-software/': '/best-hvac-software-small-business/',
  '/best/plumbing-software/': '/best-plumbing-software-small-business/',
  '/best/roofing-software/': '/best-roofing-software-contractors/',
  '/best/landscaping-software/': '/best-landscaping-software-small-business/',
  '/best/pest-control-software/': '/best-pest-control-software/',
  '/best/best-crm-contractors/': '/best-crm-for-contractors/',
  '/best/best-crm-siding-contractors/': '/best-crm-for-siding-contractors/',
  '/best/best-cad-software-contractors/': '/best-cad-software-contractors/',
  '/best/best-estimating-software-small-contractors/': '/best-estimating-software-for-small-contractors/',
  '/best/best-estimating-software-general-contractors/': '/best-estimating-software-general-contractors/',
  '/best/best-scheduling-software-contractors/': '/best-scheduling-software-contractors/',
  '/best/best-software-painting-contractors/': '/best-software-for-painting-contractors/',
  '/best/best-accounting-software-electrical-contractors/': '/best-accounting-software-for-electrical-contractors/',

  // Category pages
  '/category/estimating-software/': '/best-estimating-software-for-small-contractors/',
  '/category/landscaping-software/': '/categories/landscaping/',

  // Affiliate redirects (keep as-is)
  '/go/arborgold-official-site/': '/go/arborgold-official-site/',
  '/go/fieldedge-official-site/': '/go/fieldedge-official-site/',
  '/go/jobber-official-site/': '/go/jobber-official-site/',
  '/go/servicetitan-official-site/': '/go/servicetitan-official-site/',
  '/go/workiz-official-site/': '/go/workiz-official-site/',
};

function splitUrl(url: string) {
  const match = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return {
    pathname: match?.[1] ?? url,
    search: match?.[2] ?? '',
    hash: match?.[3] ?? '',
  };
}

/** Rewrite any wp-content image to a transparent 1x1 PNG so browsers skip layout shift */
function rewriteWpContentImage(pathname: string): string | null {
  if (pathname.startsWith('/wp-content/uploads/')) {
    return '/images/transparent-1x1.png';
  }
  return null;
}

function rewriteUrl(url: string): string {
  if (!url) return url;

  let isAbsoluteInternal = false;
  let target = url;

  if (url.startsWith(`${SITE_URL}/`)) {
    isAbsoluteInternal = true;
    target = url.slice(SITE_URL.length);
  } else if (url.startsWith(`${LEGACY_NON_WWW_URL}/`)) {
    isAbsoluteInternal = true;
    target = url.slice(LEGACY_NON_WWW_URL.length);
  }

  if (!target.startsWith('/')) {
    return url;
  }

  const { pathname, search, hash } = splitUrl(target);

  // Drop any wp-content image to a transparent 1x1 PNG — prevents 403s
  // without touching layout. Old WordPress media does not exist on
  // Astro/Vercel.
  const wpRewrite = rewriteWpContentImage(pathname);
  if (wpRewrite) {
    return `${wpRewrite}${search}${hash}`;
  }

  if (pathname.startsWith('/go/')) {
    return `${pathname}${search}${hash}`;
  }

  const mapped = pathMap[pathname];
  if (mapped) {
    return `${mapped}${search}${hash}`;
  }

  return isAbsoluteInternal ? url : target;
}

export function normalizeLegacyHtml(html: string): string {
  return html.replace(/\b(href|src)=(['"])(.*?)\2/g, (_match, attr, quote, url) => {
    return `${attr}=${quote}${rewriteUrl(url)}${quote}`;
  });
}
