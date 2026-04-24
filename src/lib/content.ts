import type { CollectionEntry } from 'astro:content';

export type ReviewEntry = CollectionEntry<'reviews'>;
export type ComparisonEntry = CollectionEntry<'comparisons'>;
export type RoundupEntry = CollectionEntry<'roundups'>;
export type GuideEntry = CollectionEntry<'guides'>;
export type SiteEntry = ReviewEntry | ComparisonEntry | RoundupEntry | GuideEntry;

export function getEntryDate(entry: SiteEntry): Date {
  return entry.data.updatedDate ?? entry.data.pubDate;
}

export function sortByEntryDate<T extends SiteEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => getEntryDate(b).getTime() - getEntryDate(a).getTime());
}

export function itemKindFromEntry(entry: SiteEntry): 'REVIEW' | 'COMPARISON' | 'BEST OF' | 'GUIDE' {
  if ('vendor' in entry.data) return 'REVIEW';
  if ('vendorA' in entry.data) return 'COMPARISON';
  if ('guideType' in entry.data) return 'GUIDE';
  return 'BEST OF';
}

export function itemUrlFromEntry(entry: SiteEntry): string {
  if ('vendor' in entry.data) return `/reviews/${entry.id}/`;
  if ('vendorA' in entry.data) return `/compare/${entry.id}/`;
  if ('guideType' in entry.data) return `/${entry.id}/`;
  return `/best/${entry.id}/`;
}

export function slugifyCategory(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface CategorySummary {
  title: string;
  slug: string;
  description: string;
  route: string;
  roundups: number;
  reviews: number;
  comparisons: number;
  latestDate: Date;
}

export function buildCategorySummaries(
  reviews: ReviewEntry[],
  roundups: RoundupEntry[],
  comparisons: ComparisonEntry[],
): CategorySummary[] {
  const map = new Map<string, CategorySummary>();

  const ensure = (title: string, date: Date) => {
    const slug = slugifyCategory(title);
    const existing = map.get(slug);
    if (existing) {
      if (date.getTime() > existing.latestDate.getTime()) {
        existing.latestDate = date;
      }
      return existing;
    }

    const created: CategorySummary = {
      title,
      slug,
      description: `${title} software coverage, reviews, comparisons, and roundups.`,
      route: `/categories/${slug}/`,
      roundups: 0,
      reviews: 0,
      comparisons: 0,
      latestDate: date,
    };
    map.set(slug, created);
    return created;
  };

  for (const roundup of roundups) {
    const record = ensure(roundup.data.category, getEntryDate(roundup));
    record.roundups += 1;
    record.description = roundup.data.description;
    record.route = `/best/${roundup.id}/`;
  }

  for (const review of reviews) {
    const record = ensure(review.data.category, getEntryDate(review));
    record.reviews += 1;
  }

  for (const comparison of comparisons) {
    const record = ensure(comparison.data.category, getEntryDate(comparison));
    record.comparisons += 1;
  }

  return [...map.values()].sort((a, b) => b.latestDate.getTime() - a.latestDate.getTime());
}

export interface FinderItem {
  name: string;
  category: string;
  price: string;
  bestFor: string;
  href: string;
  type: 'review' | 'roundup' | 'guide';
  rating?: string;
  tags: string[];
}

export function buildFinderItems(reviews: ReviewEntry[], roundups: RoundupEntry[], guides: GuideEntry[] = []): FinderItem[] {
  const items: FinderItem[] = [];

  for (const review of reviews) {
    items.push({
      name: review.data.vendor,
      category: review.data.category,
      price: review.data.startingPrice,
      bestFor: review.data.bestFor,
      href: `/reviews/${review.id}/`,
      type: 'review',
      rating: review.data.rating,
      tags: [review.data.category, ...review.data.trades, review.data.vendor, review.data.bestFor],
    });
  }

  for (const roundup of roundups) {
    for (const ranked of roundup.data.ranked) {
      items.push({
        name: ranked.name,
        category: roundup.data.category,
        price: ranked.startingPrice,
        bestFor: ranked.bestFor,
        href: ranked.slug ? `/reviews/${ranked.slug}/` : `/best/${roundup.id}/`,
        type: 'roundup',
        rating: ranked.rating,
        tags: [roundup.data.category, ranked.name, ranked.bestFor, ranked.tag],
      });
    }
  }

  for (const guide of guides) {
    items.push({
      name: guide.data.title,
      category: guide.data.category ?? guide.data.guideType,
      price: guide.data.guideType,
      bestFor: guide.data.description,
      href: `/${guide.id}/`,
      type: 'guide',
      tags: [guide.data.title, guide.data.category ?? '', guide.data.guideType, ...guide.data.searchTags],
    });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.name}::${item.category}::${item.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
