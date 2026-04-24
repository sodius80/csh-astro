# Deployment Checklist

## Local validation
Run:

```bash
npm run validate
```

This does two things:
1. builds the Astro site
2. checks generated HTML for broken internal links and assets

## If Vercel fails
- confirm Node version is compatible with `package.json`
- run `npm run build` locally first
- inspect `src/content.config.ts` for schema mismatches
- check recent MDX frontmatter for missing required fields
- check image paths under `public/images/`

## If a new route is missing
- confirm the collection file lives in the right directory
- confirm the dynamic route page exists
- confirm the content entry passes schema validation
