import type { APIRoute } from 'astro';

const SITE = 'https://contractorsoftwarehub.com';
const SITEMAP_PATH = '/sitemap-index.xml';

export const GET: APIRoute = () => {
  const body = [`User-agent: *`, `Allow: /`, `Sitemap: ${SITE}${SITEMAP_PATH}`].join('\n');

  return new Response(`${body}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
