const SITE_URL = 'https://contractorsoftwarehub.com';

const pathMap: Record<string, string> = {
  '/best-accounting-software-for-electrical-contractors/': '/best/best-accounting-software-electrical-contractors/',
  '/best-cad-software-contractors/': '/best/best-cad-software-contractors/',
  '/best-contractor-software/': '/best-contractor-software/',
  '/best-crm-for-contractors/': '/best/best-crm-contractors/',
  '/best-estimating-software-for-small-contractors/': '/best/best-estimating-software-small-contractors/',
  '/best-landscape-design-software-small-business/': '/best-landscape-design-software-small-business/',
  '/best-landscaping-software-small-business/': '/best/landscaping-software/',
  '/best-proposal-software-for-contractors/': '/best-proposal-software-for-contractors/',
  '/best-scheduling-software-contractors/': '/best/best-scheduling-software-contractors/',
  '/best-time-tracking-software-for-small-contractor-businesses-2026/': '/best-time-tracking-software-for-small-contractor-businesses-2026/',
  '/buildertrend-review/': `${SITE_URL}/buildertrend-review/`,
  '/buildxact-review/': `${SITE_URL}/buildxact-review/`,
  '/category/estimating-software/': '/best/best-estimating-software-small-contractors/',
  '/category/landscaping-software/': '/categories/landscaping/',
  '/fieldedge-review/': `${SITE_URL}/fieldedge-review/`,
  '/fieldedge-vs-servicetitan/': `${SITE_URL}/fieldedge-vs-servicetitan/`,
  '/go/fieldedge-official-site/': '/go/fieldedge-official-site/',
  '/go/jobber-official-site/': '/go/jobber-official-site/',
  '/go/servicetitan-official-site/': '/go/servicetitan-official-site/',
  '/go/workiz-official-site/': '/go/workiz-official-site/',
  '/housecall-pro-alternatives/': '/housecall-pro-alternatives/',
  '/housecall-pro-pricing/': '/housecall-pro-pricing/',
  '/housecall-pro-review/': '/reviews/housecall-pro/',
  '/housecall-pro-vs-fieldedge/': '/compare/housecall-pro-vs-fieldedge/',
  '/housecall-pro-vs-servicetitan/': `${SITE_URL}/housecall-pro-vs-servicetitan/`,
  '/jobber-alternatives-landscaping-companies/': '/jobber-alternatives-landscaping-companies/',
  '/jobber-alternatives/': '/jobber-alternatives/',
  '/jobber-pricing-is-it-worth-it/': '/jobber-pricing-is-it-worth-it/',
  '/jobber-review/': '/reviews/jobber/',
  '/jobber-vs-housecall-pro/': '/compare/jobber-vs-housecall-pro/',
  '/jobber-vs-workiz/': `${SITE_URL}/jobber-vs-workiz/`,
  '/service-fusion-review/': `${SITE_URL}/service-fusion-review/`,
  '/servicetitan-alternatives/': '/servicetitan-alternatives/',
  '/servicetitan-pricing/': '/servicetitan-pricing/',
  '/servicetitan-review/': '/reviews/servicetitan/',
  '/servicetitan-vs-jobber/': '/compare/servicetitan-vs-jobber/',
  '/workiz-review/': `${SITE_URL}/workiz-review/`,
};

function splitUrl(url: string) {
  const match = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return {
    pathname: match?.[1] ?? url,
    search: match?.[2] ?? '',
    hash: match?.[3] ?? '',
  };
}

function rewriteUrl(url: string): string {
  if (!url) return url;

  const isAbsoluteInternal = url.startsWith(`${SITE_URL}/`);
  const target = isAbsoluteInternal ? url.slice(SITE_URL.length) : url;

  if (!target.startsWith('/')) {
    return url;
  }

  const { pathname, search, hash } = splitUrl(target);

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
