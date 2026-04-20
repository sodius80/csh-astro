# Contractor Software Hub (CSH) - Astro

The new AI-native content engine for ContractorSoftwareHub.com.

## 🚀 Why Astro?
- **Speed:** Blazing fast static site generation.
- **AI-Native:** AI writes simple MDX files → commits to GitHub → Vercel auto-deploys.
- **Zero Maintenance:** No databases, no WordPress updates, no PHP hacks.
- **Interactive:** "Islands" architecture allows for interactive widgets like the "Software Finder".

## 🛠 Tech Stack
- **Framework:** Astro v6
- **Styling:** Tailwind CSS v4
- **Content:** MDX (Markdown + JSX)
- **Hosting:** Vercel (Free tier)
- **CI/CD:** GitHub Actions (Auto-deploy on push)

## 📁 Project Structure
```text
csh-astro/
├── src/
│   ├── content/             # <--- The AI writes here
│   │   └── blog/
│   │       └── pest-control-software.mdx
│   ├── components/
│   │   ├── ReviewHero.astro     # <--- Dark blue header component
│   │   └── ProductCard.astro    # <--- Product layout
│   ├── layouts/
│   │   ├── Layout.astro         # <--- Base HTML shell
│   │   └── ArticleLayout.astro  # <--- Wraps all articles
│   ├── pages/
│   │   └── blog/[...slug].astro # <--- Dynamic route for articles
│   └── content.config.ts        # <--- Schema definition
├── public/                  # <--- Static assets (images, favicon)
└── astro.config.mjs         # <--- Configuration
```

## 📝 How to Add a New Article
1. Create a new `.mdx` file in `src/content/blog/` (e.g., `solar-software.mdx`).
2. Add the frontmatter at the top (title, description, hero data, etc.).
3. Write the article content in Markdown.
4. Commit and push to GitHub. Vercel will build and deploy automatically.

## 🏗 Running Locally
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📦 Content Schema
Defined in `src/content.config.ts`. Ensures every article has:
- `title`, `description`, `pubDate`
- `hero` data (eyebrow, subtitle, CTA, pricing, etc.)
- `trade_slug` and `products` array for the Software Finder widget.

## 🎨 Components
- **ReviewHero:** Automatically generates the dark blue hero header from frontmatter data.
- **ProductCard:** Consistent layout for product reviews.
- **PricingTable:** Auto-generated from product data.
- **Software Finder:** (Planned) Interactive widget to recommend tools based on trade/size/budget.

---
*Built for AI-driven content creation. Zero friction.*
