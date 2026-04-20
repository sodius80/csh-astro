import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Schema for blog posts
const blogCollection = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/blog' }),
  schema: z.object({
    // Basic SEO
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    
    // Hero Section
    hero: z.object({
      eyebrow: z.string().default('Software Review'),
      subtitle: z.string().optional(),
      cta_url: z.string().default('/'),
      cta_text: z.string().default('Learn More →'),
      pricing: z.string().optional(),
      best_for: z.string().optional(),
      disclosure_override: z.string().optional(), // If specific disclosure is needed
    }).optional().default({}),

    // Product Data for the Finder
    trade_slug: z.string(), // e.g., "pest-control"
    products: z.array(
      z.object({
        name: z.string(),
        slug: z.string(),
        pricing_start: z.string().optional(),
        pricing_top: z.string().optional(),
        free_trial: z.boolean().default(false),
        best_for: z.string(),
        rating: z.number().optional(),
        is_affiliate: z.boolean().default(false),
      })
    ).optional().default([]),
  }),
});

export const collections = {
  'blog': blogCollection,
};
