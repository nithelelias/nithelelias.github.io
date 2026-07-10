---
name: nextjs
description: Use when the user is working on a Next.js project or asking about Next.js features like App Router, Pages Router, Server Components, API routes, middleware, Image component, Link component, getServerSideProps, getStaticProps, ISR, SSG, SSR, or next.config.js. Use ONLY for Next.js-specific tasks.
---

# Next.js Skill

## Project detection

- Look for `next.config.js`, `next.config.mjs`, or `next.config.ts`
- Check `package.json` for `next` dependency
- App Router projects have `app/` directory; Pages Router have `pages/` or `src/pages/`

## Key conventions

### App Router (recommended)
- Files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`
- Routes defined by folder structure under `app/`
- Dynamic routes: `[slug]`, catch-all: `[...slug]`, optional catch-all: `[[...slug]]`
- Route groups: `(group)` — parenthesized folders don't affect URL
- Private folders: `_folder` — excluded from routing
- Layouts wrap child routes and persist across navigation
- `loading.tsx` provides automatic Suspense boundaries
- `error.tsx` catches runtime errors per segment
- Colocate `page.tsx` and `layout.tsx` at the same level

### Server vs Client Components
- Default: Server Components (no `"use client"` directive)
- Add `"use client"` at top of file for interactivity, browser APIs, or React hooks
- Server Components can import Client Components; not the reverse
- Server Components can be async and fetch data directly

### Data fetching
- Server Components: fetch directly with `fetch()` or DB calls
- Route Handlers (`app/api/*/route.ts`): export named functions `GET`, `POST`, `PUT`, `DELETE`
- Client-side: use SWR or React Query
- `generateStaticParams` for dynamic static generation
- `revalidatePath()` / `revalidateTag()` for ISR

### Styling
- CSS Modules: `*.module.css` (default)
- Tailwind CSS: popular choice, configure via `tailwind.config.js`
- Global CSS: only in root `layout.tsx` (App Router)
- CSS-in-JS: supported but not recommended for App Router

### Image optimization
- Use `next/image` component
- Config required in `next.config.js` for external domains
- Automatic WebP/AVIF, responsive sizes, lazy loading

### Metadata and SEO
- Export `metadata` object or `generateMetadata` function from `page.tsx` or `layout.tsx`
- Use `Metadata` type from `next/metadata`
- `generateMetadata` for dynamic metadata

### Middleware
- File: `middleware.ts` at project root (or `src/`)
- Runs before request completes
- Can rewrite, redirect, set headers, modify response
- Use `NextRequest` and `NextResponse`

### Internationalization (i18n)
- No built-in i18n routing in App Router — implement via `[locale]` segment
- Pages Router has built-in `i18n` config in `next.config.js`

## Common patterns

### Dynamic route with params (App Router)
```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  // fetch data using slug
  return <article>...</article>;
}
```

### Route Handler
```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ users: [] });
}
```

### Client Component
```tsx
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Middleware
```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Configuration (`next.config.js` / `next.config.mjs` / `next.config.ts`)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.example.com' }],
  },
  redirects: async () => [{ source: '/old', destination: '/new', permanent: true }],
  rewrites: async () => [{ source: '/api/:path*', destination: 'https://api.example.com/:path*' }],
};

module.exports = nextConfig;
```

## Common CLI commands

```bash
npx create-next-app@latest    # scaffold new project
npm run dev                    # start dev server (default port 3000)
npm run build                 # production build
npm run start                 # start production server
npm run lint                   # ESLint check
```

## Gotchas

- Do not use `"use client"` in layout.tsx unless absolutely necessary (breaks streaming)
- `params` and `searchParams` in App Router are Promises — must `await`
- Client Components cannot be async
- Dynamic route segments are not available in `generateMetadata` params directly — use the `params` prop
- Only one `loading.tsx` per route segment
- Middleware cannot use Node.js APIs (Edge Runtime)
