import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const ratingEnum = z.enum(['top-pick', 'recommended', 'conditional', 'skip']);

/* Reviews — individual vendor product reviews
   Route: /reviews/[slug]                                       */
const reviews = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/reviews' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    vendor: z.string(),
    category: z.string(),
    rating: ratingEnum,
    verdictShort: z.string(),
    startingPrice: z.string(),
    topPrice: z.string().optional(),
    freeTrial: z.string().optional(),
    bestFor: z.string(),
    notFor: z.string().optional(),
    teamSize: z.string().optional(),
    trades: z.array(z.string()).default([]),
    tradeSlug: z.string().optional(),
    product: z
      .object({
        slug: z.string().optional(),
        pricingStart: z.string().optional(),
        bestFor: z.string().optional(),
        isAffiliate: z.boolean().optional(),
      })
      .optional(),
    searchTags: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Chris Harper'),
    readTime: z.string().optional(),
    affiliateUrl: z.string(),
    ctaLabel: z.string().optional(),
    heroImage: z.string(),
    heroSubhead: z.string().optional(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    quickFacts: z.array(z.tuple([z.string(), z.string()])).default([]),
    faqs: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
  }),
});

/* Comparisons — head-to-head vendor comparisons
   Route: /compare/[slug]                                       */
const comparisons = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/comparisons' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().default('Field Service'),
    tradeSlug: z.string().optional(),
    vendorA: z.object({
      name: z.string(),
      slug: z.string(),
      rating: ratingEnum.optional(),
      tag: z.string().optional(),
      startingPrice: z.string().optional(),
      affiliateUrl: z.string().optional(),
    }),
    vendorB: z.object({
      name: z.string(),
      slug: z.string(),
      rating: ratingEnum.optional(),
      tag: z.string().optional(),
      startingPrice: z.string().optional(),
      affiliateUrl: z.string().optional(),
    }),
    shortAnswer: z.object({
      aWhen: z.string(),
      bWhen: z.string(),
      nuance: z.string().optional(),
    }),
    atAGlance: z.array(z.tuple([z.string(), z.string(), z.string()])).default([]),
    chooseA: z.array(z.string()).default([]),
    chooseB: z.array(z.string()).default([]),
    products: z.array(z.object({
      name: z.string(),
      slug: z.string().optional(),
      pricingStart: z.string().optional(),
      bestFor: z.string().optional(),
      isAffiliate: z.boolean().optional(),
    })).default([]),
    searchTags: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Chris Harper'),
    readTime: z.string().optional(),
    heroImage: z.string(),
  }),
});

/* Roundups — Best-of category pages
   Route: /best/[slug]                                          */
const roundups = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/roundups' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    categorySlug: z.string().optional(),
    tradeSlug: z.string().optional(),
    searchTags: z.array(z.string()).default([]),
    year: z.number().default(2026),
    heroHeadline: z.string().optional(),
    heroSubhead: z.string().optional(),
    doYouNeed: z.object({
      rule: z.string(),
      ruleCaption: z.string().optional(),
      framingLead: z.string().optional(),
      framingBody: z.string().optional(),
      doBullets: z.array(z.string()).min(1),
      dontBullets: z.array(z.string()).min(1),
    }).optional(),
    ranked: z.array(z.object({
      rank: z.number(),
      name: z.string(),
      slug: z.string().optional(),
      rating: ratingEnum,
      tag: z.string(),
      bestFor: z.string(),
      startingPrice: z.string(),
      pullquote: z.string(),
      body: z.string(),
      pros: z.array(z.string()).default([]),
      cons: z.array(z.string()).default([]),
      affiliateUrl: z.string().optional(),
    })).default([]),
    cutList: z.array(z.object({
      name: z.string(),
      why: z.string(),
    })).default([]),
    products: z.array(z.object({
      name: z.string(),
      slug: z.string().optional(),
      pricingStart: z.string().optional(),
      pricingTop: z.string().optional(),
      freeTrial: z.boolean().optional(),
      bestFor: z.string().optional(),
      isAffiliate: z.boolean().optional(),
    })).default([]),
    bottomLine: z.string().optional(),
    faqs: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Chris Harper'),
    readTime: z.string().optional(),
    heroImage: z.string(),
  }),
});

/* Guides — legacy root-level posts that don't fit cleanly elsewhere
   Route: /[slug]                                                   */
const guides = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    guideType: z.enum(['guide', 'pricing', 'alternatives', 'roundup']),
    category: z.string().optional(),
    hasLegacyHero: z.boolean().default(false),
    searchTags: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Chris Harper'),
    readTime: z.string().optional(),
    heroImage: z.string(),
  }),
});

export const collections = { reviews, comparisons, roundups, guides };
