#!/usr/bin/env node
// One-shot content migration: transforms legacy blog/* MDX into
// new reviews/, comparisons/, roundups/ collections.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const legacyDir = path.join(root, 'src/content/_legacy');
const reviewsDir = path.join(root, 'src/content/reviews');
const comparisonsDir = path.join(root, 'src/content/comparisons');
const roundupsDir = path.join(root, 'src/content/roundups');

// Split frontmatter + body
function splitFM(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: '', body: raw };
  return { fm: m[1], body: m[2] };
}

function dumpFM(obj) {
  // Minimal YAML dump (strings, numbers, arrays of strings, simple objects, dates)
  const lines = [];
  const dump = (o, indent) => {
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        if (v.length === 0) {
          lines.push(`${indent}${k}: []`);
          continue;
        }
        lines.push(`${indent}${k}:`);
        for (const item of v) {
          // Detect tuple of primitives → flow style
          if (Array.isArray(item)) {
            const flow = item.map(x => yamlVal(x)).join(', ');
            lines.push(`${indent}  - [${flow}]`);
            continue;
          }
          if (item && typeof item === 'object') {
            const entries = Object.entries(item);
            lines.push(`${indent}  - ${entries[0][0]}: ${yamlVal(entries[0][1])}`);
            for (const [k2, v2] of entries.slice(1)) {
              lines.push(`${indent}    ${k2}: ${yamlVal(v2)}`);
            }
          } else {
            lines.push(`${indent}  - ${yamlVal(item)}`);
          }
        }
        continue;
      }
      if (v && typeof v === 'object' && !(v instanceof Date)) {
        lines.push(`${indent}${k}:`);
        dump(v, indent + '  ');
        continue;
      }
      lines.push(`${indent}${k}: ${yamlVal(v)}`);
    }
  };
  dump(obj, '');
  return `---\n${lines.join('\n')}\n---\n`;
}

function yamlVal(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  if (/[:#{}|>&*!,\[\]'"\n]/.test(s) || /^\s|\s$/.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}

// ---------- REVIEW MIGRATIONS ----------
const reviewMap = {
  'jobber-review': {
    slug: 'jobber',
    vendor: 'Jobber',
    category: 'Field Service',
    rating: 'top-pick',
    verdictShort: 'The default field service tool for small service operations — buy it.',
    startingPrice: '$49/mo',
    topPrice: '$299/mo',
    freeTrial: '14 days',
    bestFor: '1-10 techs',
    notFor: 'GCs doing project-based remodels, or shops whose revenue is service agreements',
    teamSize: '1-10 techs',
    trades: ['HVAC', 'Plumbing', 'Electrical', 'Landscaping'],
    readTime: '14 min',
    affiliateUrl: 'https://go.getjobber.com/wtuf58h3dc5t',
    ctaLabel: 'Try Jobber Free',
    heroImage: '/images/jobber-review.jpg',
    pros: [
      'Quote-to-invoice speed is consistently praised',
      'Mobile app reliable offline',
      'Client hub self-serve scheduling changes customer behavior',
      'Onboarding time is measured in days, not months',
    ],
    cons: [
      'Reporting is thin — margin tracking requires Excel export',
      'Service agreement management is weak',
      'Pricing jumps between Core and Connect tiers are steep',
      'Card-not-present fees above Stripe direct',
    ],
    quickFacts: [
      ['Starting price', '$49/mo'],
      ['Top plan', '$299/mo'],
      ['Free trial', '14 days'],
      ['Best team size', '1-10 techs'],
      ['Mobile app', 'iOS + Android'],
      ['QuickBooks', 'Yes · 2-way sync'],
      ['Implementation', '~2 weeks'],
      ['Our rating', 'TOP PICK'],
    ],
  },
  'housecall-pro-review': {
    slug: 'housecall-pro',
    vendor: 'Housecall Pro',
    category: 'Field Service',
    rating: 'recommended',
    verdictShort: 'The best entry point for residential home service contractors.',
    startingPrice: '$59/mo',
    topPrice: '$299/mo',
    freeTrial: '14 days',
    bestFor: '1-10 techs',
    notFor: 'Large commercial ops, or shops needing deep job costing',
    teamSize: '1-15 techs',
    trades: ['HVAC', 'Plumbing', 'Cleaning', 'Electrical'],
    readTime: '12 min',
    affiliateUrl: 'https://housecallpro.partnerlinks.io/l1lt3au6la8b',
    ctaLabel: 'Try Housecall Pro Free',
    heroImage: '/images/housecall-pro-review.jpg',
    pros: [
      'Clean, simple interface — contractors productive in days',
      'Best-in-class customer booking and automated notifications',
      'Mobile app widely praised',
      'Strong marketing tools baked in',
    ],
    cons: [
      'Job costing is a known gap',
      'Reporting is basic — live dashboards thin',
      'Price jumps quickly as team grows past 5',
      'Less depth than Jobber at comparable tier',
    ],
    quickFacts: [
      ['Starting price', '$59/mo'],
      ['Top plan', '$299/mo'],
      ['Free trial', '14 days'],
      ['Best team size', '1-15 techs'],
      ['Mobile app', 'iOS + Android · excellent'],
      ['QuickBooks', 'Yes · 2-way sync'],
      ['Online booking', 'Included on all plans'],
      ['Our rating', 'RECOMMENDED'],
    ],
  },
  'servicetitan-review': {
    slug: 'servicetitan',
    vendor: 'ServiceTitan',
    category: 'Field Service',
    rating: 'conditional',
    verdictShort: 'Enterprise-grade — only worth it at 10+ techs with the budget to match.',
    startingPrice: '$400+/mo',
    freeTrial: 'Demo only',
    bestFor: '10+ techs, $1.5M+ revenue',
    notFor: 'Shops under 10 techs, or anyone who wants pricing transparency',
    teamSize: '15+ techs',
    trades: ['HVAC', 'Plumbing', 'Electrical'],
    readTime: '15 min',
    affiliateUrl: 'https://www.servicetitan.com/',
    ctaLabel: 'Request ServiceTitan Demo',
    heroImage: '/images/servicetitan-review.jpg',
    pros: [
      'Category-leading dispatch and reporting',
      'Strong flat-rate pricing tools',
      'Best-in-class job costing',
      'Broad integration ecosystem',
    ],
    cons: [
      'No public pricing — demo gate',
      '6-12 month implementation is the norm',
      'Year-one cost in the tens of thousands, not thousands',
      'Overkill for most small residential shops',
    ],
    quickFacts: [
      ['Starting price', '$400+/mo'],
      ['Public pricing', 'No · demo required'],
      ['Free trial', 'None'],
      ['Best team size', '15+ techs'],
      ['Implementation', '6-12 weeks'],
      ['QuickBooks', 'Yes · deep integration'],
      ['Year-1 total (10 techs)', '~$14,000+'],
      ['Our rating', 'CONDITIONAL'],
    ],
  },
};

// ---------- COMPARISON MIGRATIONS ----------
const comparisonMap = {
  'jobber-vs-housecall-pro': {
    vendorA: { name: 'Jobber', slug: 'jobber', tag: 'TOP PICK · DEFAULT', startingPrice: '$49/mo', affiliateUrl: 'https://go.getjobber.com/wtuf58h3dc5t' },
    vendorB: { name: 'Housecall Pro', slug: 'housecall-pro', tag: 'RECOMMENDED · ENTRY', startingPrice: '$59/mo', affiliateUrl: 'https://housecallpro.partnerlinks.io/l1lt3au6la8b' },
    category: 'Field Service',
    shortAnswer: {
      aWhen: '3-15 techs · scaling an operation',
      bWhen: '1-5 techs · starting out',
      nuance: 'Both are credible for residential service contractors. The dividing line is usually team size and how much reporting depth you need.',
    },
    atAGlance: [
      ['Starting price', '$49/mo', '$59/mo'],
      ['Free trial', '14 days', '14 days'],
      ['Best team size', '1-10 techs', '1-15 techs'],
      ['Implementation', '~2 weeks', '~1-2 weeks'],
      ['Client hub / online booking', 'Yes', 'Yes'],
      ['Marketing tools', 'Light', 'Strong'],
      ['Job costing', 'Thin', 'Thin'],
      ['Mobile app', 'Excellent', 'Excellent'],
      ['Our rating', 'TOP PICK', 'RECOMMENDED'],
    ],
    chooseA: [
      "You're scaling past 5 techs and need deeper scheduling",
      "Your team is 3-15 technicians on residential service",
      "Quote-to-invoice speed is the pain you're solving",
      "You want Jobber-tier reliability and ecosystem",
      "You need solid QuickBooks 2-way sync",
      "You'll use client hub self-serve scheduling",
    ],
    chooseB: [
      "You're solo or 1-5 techs just starting out",
      "Customer-facing booking and marketing matter most",
      "You want the cleanest UI of the two for a new hire",
      "Automated customer notifications are a top-3 need",
      "You're okay trading reporting depth for simplicity",
      "You want marketing tooling built in, not an add-on",
    ],
  },
  'housecall-pro-vs-fieldedge': {
    vendorA: { name: 'Housecall Pro', slug: 'housecall-pro', tag: 'RECOMMENDED · EASIER', startingPrice: '$59/mo', affiliateUrl: 'https://housecallpro.partnerlinks.io/l1lt3au6la8b' },
    vendorB: { name: 'FieldEdge', slug: 'fieldedge', tag: 'SPECIALIST · AGREEMENTS', startingPrice: '$125/mo' },
    category: 'Field Service',
    shortAnswer: {
      aWhen: 'Most small residential shops · price-conscious',
      bWhen: 'HVAC/plumbing with service agreements at core',
      nuance: 'Housecall Pro is the easier, cheaper default. FieldEdge makes sense when flat-rate pricing, QuickBooks desktop depth, and recurring service-agreement workflows matter more than transparency or speed-to-setup.',
    },
    atAGlance: [
      ['Starting price', '$59/mo', '$125/mo (reported)'],
      ['Pricing transparency', 'Published', 'Demo only'],
      ['Best team size', '1-15 techs', '5-25 techs'],
      ['Service agreements', 'Thin', 'Strong'],
      ['Flat-rate pricing', 'Good', 'Best-in-class'],
      ['QuickBooks integration', 'Online (2-way)', 'Desktop + Online (deep)'],
      ['Mobile app', 'Excellent', 'Solid'],
      ['Implementation', '~1-2 weeks', '4-6 weeks'],
      ['Our rating', 'RECOMMENDED', 'RECOMMENDED'],
    ],
    chooseA: [
      'Residential service contractor, price-conscious',
      'You value clean UI and fast setup over depth',
      'Marketing tools and online booking are important',
      "You don't rely on recurring service agreements",
      'Small team (1-10) where simplicity pays',
      "You're on QuickBooks Online, not Desktop",
    ],
    chooseB: [
      'HVAC or plumbing shop where agreements drive revenue',
      'Flat-rate pricing workflow is central to your operation',
      'You run QuickBooks Desktop and need deep sync',
      'Team size 5-25 with dedicated office staff',
      "You'll trade UI polish for operational depth",
      'Commercial or maintenance contract work is meaningful',
    ],
  },
  'servicetitan-vs-jobber': {
    vendorA: { name: 'ServiceTitan', slug: 'servicetitan', tag: 'CONDITIONAL · 15+', startingPrice: '$400+/mo' },
    vendorB: { name: 'Jobber', slug: 'jobber', tag: 'TOP PICK · DEFAULT', startingPrice: '$49/mo', affiliateUrl: 'https://go.getjobber.com/wtuf58h3dc5t' },
    category: 'Field Service',
    shortAnswer: {
      aWhen: '15+ techs · commercial · multi-location',
      bWhen: 'Under 15 techs · under $3M revenue',
      nuance: "Edge case: if you're 10-20 techs planning to double in 18 months, ServiceTitan is worth the implementation pain. If you're stable at the same size, Jobber is the answer until growth forces the switch.",
    },
    atAGlance: [
      ['Starting price', '$400+/mo', '$49/mo'],
      ['Pricing transparency', 'Demo only', 'Published tiers'],
      ['Free trial', 'None', '14 days'],
      ['Best team size', '20+ techs', '1-10 techs'],
      ['Implementation', '6-12 weeks', '~2 weeks'],
      ['Reporting depth', 'Category-leading', 'Basic · export needed'],
      ['Service agreements', 'Strong', 'Weak'],
      ['Commercial / multi-location', 'Yes', 'No'],
      ['Year-1 total (10 techs)', '~$14,000+', '~$2,028'],
      ['Our rating', 'CONDITIONAL', 'TOP PICK'],
    ],
    chooseA: [
      '15+ techs already, or growing past 20 within a year',
      'HVAC shop moving into commercial maintenance contracts',
      'Per-tech KPI tracking and attribution is central',
      'You run multiple locations sharing a dispatch center',
      'Dedicated admin/dispatch roles (not the owner)',
      "You'll trade 6 months of pain for category-leading capability",
    ],
    chooseB: [
      "Your team is under 15 techs and you don't expect to double this year",
      'Residential service work — not commercial contracts',
      'Quote-to-invoice friction is the pain, not reporting',
      'You want to be running productively in 2 weeks, not 2 months',
      'Revenue under $3M and the $49-$199 ceiling matters',
      'Your ops manager is still answering phones',
    ],
  },
};

// ---------- ROUNDUP MIGRATIONS ----------
// Each entry: category + doYouNeed (optional) content.
// The deep body prose carries the ranked picks in narrative form —
// we don't duplicate into structured `ranked` to avoid content divergence.
const roundupMap = {
  'landscaping-software': {
    category: 'Landscaping',
    year: 2026,
    heroHeadline: 'Landscaping software.\nThe tools that actually work.',
    heroSubhead: "Six tools compared across one-crew, mid-sized, and commercial landscaping operations. Each one is right for a specific team size and profile — we'll tell you which.",
    heroImage: '/images/landscaping-hero.jpg',
    doYouNeed: {
      rule: 'Software becomes worth paying for roughly when the time it saves exceeds the time it costs to set up — within 90 days.',
      ruleCaption: "Under that threshold, it's usually operator discipline, not tooling.",
      doBullets: [
        "Crews are showing up to the wrong site because schedules live in three group texts",
        "You're re-entering accepted quotes into QuickBooks by hand every Friday night",
        "Clients keep asking for route updates you can't give them without calling the driver",
        "Payroll is taking longer than a day because timecards come in by text",
        "You're turning down work because you can't track one more job on paper",
      ],
      dontBullets: [
        "You're solo or a one-crew operation and most jobs are repeat maintenance routes",
        "Customers approve quotes with a text message and a handshake — no paper trail",
        "Your main problem is pricing accuracy, not scheduling or client communication",
        "You've tried Jobber or similar before and stopped using it within 60 days",
        "Your bookkeeper is already handling invoicing in QuickBooks without friction",
      ],
    },
  },
  'hvac-software': {
    category: 'HVAC',
    year: 2026,
    heroHeadline: 'HVAC software.\nSeven options that hold up.',
    heroSubhead: 'HVAC-specific software picks for small service shops — scheduling, dispatch, invoicing, and maintenance-plan tracking. Ranked and profiled by team size.',
    heroImage: '/images/hvac-hero.jpg',
    doYouNeed: {
      rule: "If your techs are calling the office to confirm a job address, software is overdue. If your techs already know tomorrow's route without asking, software can wait.",
      doBullets: [
        'Dispatch is eating more than an hour a day of someone senior',
        'Customer callbacks for service agreement renewals are slipping',
        "You're losing flat-rate pricing consistency across techs",
        'Techs are reaching for paper forms that should be in a tablet',
        "You're doing maintenance contracts on a spreadsheet and they're drifting",
      ],
      dontBullets: [
        'Solo operator on fewer than 10 active customers a week',
        'All agreements live in one spreadsheet and you actually open it every week',
        'Calls come in directly to your cell and you dispatch yourself',
        "You've tried FSM software before and stopped within 2 months",
        "Your tech team is two people and they're in the truck together",
      ],
    },
  },
  'plumbing-software': {
    category: 'Plumbing',
    year: 2026,
    heroHeadline: 'Plumbing software.\nFive options that work.',
    heroSubhead: 'Plumbing-specific platforms compared — scheduling, dispatch, estimates, invoicing, and the mobile experience that matters in crawl spaces.',
    heroImage: '/images/plumbing-hero.jpg',
  },
  'roofing-software': {
    category: 'Roofing',
    year: 2026,
    heroHeadline: 'Roofing software.\nFive compared.',
    heroSubhead: 'Roofing-specific tools compared — measurement, estimating, insurance restoration workflow, and crew scheduling.',
    heroImage: '/images/roofing-hero.jpg',
  },
  'pest-control-software': {
    category: 'Pest Control',
    year: 2026,
    heroHeadline: 'Pest control software.\nFive that hold up.',
    heroSubhead: 'Scheduling, routing, IPM log tracking, compliance, and recurring services. Compared across five platforms built for PCOs.',
    heroImage: '/images/pest-control-hero.jpeg',
  },
  'best-crm-contractors': {
    category: 'CRM',
    year: 2026,
    heroHeadline: 'Best CRM<br/>for contractors.',
    heroSubhead: 'CRM tools that understand contractors — lead tracking, follow-up automation, and customer management without enterprise bloat.',
    heroImage: '/images/crm-contractors-hero.jpg',
  },
  'best-scheduling-software-contractors': {
    category: 'Scheduling',
    year: 2026,
    heroHeadline: 'Best scheduling<br/>software for contractors.',
    heroSubhead: 'Calendar, dispatch, and crew scheduling tools compared across small, mid, and large contractor operations.',
    heroImage: '/images/scheduling-software-hero.jpg',
  },
  'best-cad-software-contractors': {
    category: 'CAD & Design',
    year: 2026,
    heroHeadline: 'Best CAD software\nfor contractors.',
    heroSubhead: 'From simple 2D drafting to full BIM — what works for small residential shops versus commercial general contractors.',
    heroImage: '/images/cad-software-hero.jpg',
  },
  'best-estimating-software-general-contractors': {
    category: 'Estimating (GC)',
    year: 2026,
    heroHeadline: 'Best estimating software\nfor general contractors.',
    heroSubhead: 'Five estimating tools compared — takeoff, bid management, integrations, and pricing for GCs running commercial and large residential work.',
    heroImage: '/images/estimating-gc-hero.jpg',
  },
  'best-estimating-software-small-contractors': {
    category: 'Estimating (Small)',
    year: 2026,
    heroHeadline: 'Best estimating software\nfor small contractors.',
    heroSubhead: 'Estimating tools built for sub-$1M shops and solo operators — compared by price, learning curve, and what contractors actually use.',
    heroImage: '/images/estimating-small-hero.jpg',
  },
  'best-accounting-software-electrical-contractors': {
    category: 'Accounting',
    year: 2026,
    heroHeadline: 'Best accounting software\nfor electrical contractors.',
    heroSubhead: 'Accounting tools that handle the realities of electrical contracting — job costing, progress billing, compliance, and the pain of prevailing wage.',
    heroImage: '/images/electrical-accounting-hero.jpg',
  },
  'best-crm-siding-contractors': {
    category: 'Siding CRM',
    year: 2026,
    heroHeadline: 'Best CRM for<br/>siding contractors.',
    heroSubhead: 'CRM tools for siding and exterior contractors, including insurance restoration specialists running storm and claims work.',
    heroImage: '/images/siding-crm-hero.jpg',
  },
  'best-software-painting-contractors': {
    category: 'Painting',
    year: 2026,
    heroHeadline: 'Best software for<br/>painting contractors.',
    heroSubhead: 'Software options built for painting businesses — estimating, scheduling, invoicing, and mobile color workflows.',
    heroImage: '/images/painting-contractors-hero.jpg',
  },
};

// ---------- EXEC ----------
function clean(body) {
  // Remove the first `<figure>...<img .../><br /></figure>` block since
  // hero image is now handled via frontmatter + template
  body = body.replace(/^\s*<figure[^>]*>\s*<img[^>]*\/?>\s*(<br\s*\/?>\s*)?<\/figure>\s*/i, '');
  return body.trimStart();
}

// Helpers to copy shared metadata
function baseFM(entry, extra = {}) {
  return {
    title: entry.title,
    description: entry.description,
    pubDate: new Date(entry.pubDate),
    updatedDate: entry.updatedDate ? new Date(entry.updatedDate) : undefined,
    author: 'Chris Harper',
    ...extra,
  };
}

function readLegacy(name) {
  const file = path.join(legacyDir, `${name}.mdx`);
  const raw = fs.readFileSync(file, 'utf8');
  const { fm, body } = splitFM(raw);
  const data = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^(title|description|pubDate|updatedDate):\s*"?([^"]*)"?$/);
    if (m) data[m[1]] = m[2];
  }
  return { data, body };
}

// Reviews
for (const [legacyName, meta] of Object.entries(reviewMap)) {
  const { data, body } = readLegacy(legacyName);
  const fm = {
    title: data.title,
    description: data.description,
    vendor: meta.vendor,
    category: meta.category,
    rating: meta.rating,
    verdictShort: meta.verdictShort,
    startingPrice: meta.startingPrice,
    topPrice: meta.topPrice,
    freeTrial: meta.freeTrial,
    bestFor: meta.bestFor,
    notFor: meta.notFor,
    teamSize: meta.teamSize,
    trades: meta.trades,
    pubDate: new Date(data.pubDate),
    updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
    author: 'Chris Harper',
    readTime: meta.readTime,
    affiliateUrl: meta.affiliateUrl,
    ctaLabel: meta.ctaLabel,
    heroImage: meta.heroImage,
    pros: meta.pros,
    cons: meta.cons,
    quickFacts: meta.quickFacts,
  };
  const out = dumpFM(fm) + '\n' + clean(body);
  fs.writeFileSync(path.join(reviewsDir, `${meta.slug}.mdx`), out);
  console.log(`✓ review · ${meta.slug}`);
}

// Comparisons
for (const [legacyName, meta] of Object.entries(comparisonMap)) {
  const { data, body } = readLegacy(legacyName);
  const fm = {
    title: data.title,
    description: data.description,
    category: meta.category,
    vendorA: meta.vendorA,
    vendorB: meta.vendorB,
    shortAnswer: meta.shortAnswer,
    atAGlance: meta.atAGlance,
    chooseA: meta.chooseA,
    chooseB: meta.chooseB,
    pubDate: new Date(data.pubDate),
    updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
    author: 'Chris Harper',
  };
  const out = dumpFM(fm) + '\n' + clean(body);
  fs.writeFileSync(path.join(comparisonsDir, `${legacyName}.mdx`), out);
  console.log(`✓ comparison · ${legacyName}`);
}

// Roundups
for (const [legacyName, meta] of Object.entries(roundupMap)) {
  const { data, body } = readLegacy(legacyName);
  const fm = {
    title: data.title,
    description: data.description,
    category: meta.category,
    year: meta.year,
    heroHeadline: meta.heroHeadline,
    heroSubhead: meta.heroSubhead,
    heroImage: meta.heroImage,
    doYouNeed: meta.doYouNeed,
    pubDate: new Date(data.pubDate),
    updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
    author: 'Chris Harper',
  };
  const out = dumpFM(fm) + '\n' + clean(body);
  fs.writeFileSync(path.join(roundupsDir, `${legacyName}.mdx`), out);
  console.log(`✓ roundup · ${legacyName}`);
}

console.log('\nDone.');
