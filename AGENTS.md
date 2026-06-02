<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Sanity setup

The storefront pulls its catalog from a Sanity project named **Minor Shop**.

- **Project ID**: `enrmb3v3`
- **Dataset**: `production` (public)
- **Manage**: https://www.sanity.io/manage/project/enrmb3v3
- **Embedded Studio**: `/studio` (i.e. http://localhost:3000/studio in dev)

The previous codebase pointed at an unrelated project named `balna`
(`0fetbhwg`) — it is no longer used. The link to Sanity lives entirely in env
vars; no project ID is hardcoded in source.

### First-time setup

1. `cp .env.local.example .env.local`
2. Fill in `NEXT_PUBLIC_SANITY_PROJECT_ID=enrmb3v3` (already the default in the
   committed `.env.local` if you cloned with it).
3. `npm run dev` — the Studio at `/studio` works immediately and lets you
   create your first `brand`, `product`, and `siteSettings` documents.

### Graceful fallback

When `NEXT_PUBLIC_SANITY_PROJECT_ID` is empty the storefront silently uses the
in-memory fixture catalog in `lib/catalog.ts`. Useful for working offline or
running tests without Sanity credentials. See `lib/sanity/products.ts` for the
branching logic.

### Deploying to Vercel

Set these in the Vercel project's **Environment Variables**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `enrmb3v3` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_MINOR_WHATSAPP` | the store's WhatsApp number, digits only |
| `NEXT_PUBLIC_SITE_URL` | the production origin (e.g. `https://minor-shop.example.com`) |
| `SANITY_API_READ_TOKEN` | (optional, server-only) only if you enable preview |
