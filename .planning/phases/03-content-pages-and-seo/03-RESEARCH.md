# Phase 3: Content Pages & SEO - Research

**Researched:** 2026-02-11
**Domain:** Next.js 15 Content Pages, SEO Implementation, Semantic HTML
**Confidence:** HIGH

## Summary

Phase 3 implements three content pages (Home, Who, What) with complete content from the architecture document, proper SEO metadata, semantic HTML structure, active navigation state, and cross-linking between pages. The foundation (Phase 1) and navigation (Phase 2) are already complete, so this phase focuses on: (1) creating page routes, (2) implementing content verbatim from architecture docs, (3) adding unique metadata per page, (4) applying typography from the style guide, (5) implementing active navigation state with greyed-out pills, and (6) adding cross-links between Who and What pages.

The technical stack is already in place (Next.js 15 App Router, Inter font optimization, Tailwind CSS v4). The primary challenges are: (1) implementing active navigation state using usePathname() in the client-side header component, (2) ensuring semantic HTML structure meets SEO-02 requirements, (3) applying correct typography scale from style guide (48px/64px headings, 18px/20px body text), and (4) implementing per-page metadata using Next.js Metadata API.

**Primary recommendation:** Create static page routes at `/`, `/who`, and `/what` using Server Components with unique Metadata exports. Use usePathname() in the existing Header component to apply greyed-out styling (`opacity-50 cursor-default`) to navigation pills matching current route. All content comes verbatim from `/Users/shantam/continua/docs/web-architecture.md`. Use semantic HTML (`<main>`, `<section>`, `<h1>`-`<h3>`) for SEO. Apply style guide typography: 48px→64px headings, 18px→20px body text.

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | App Router with Metadata API | Built-in SEO optimization, static generation, per-page metadata export, semantic HTML support |
| React | 19.x | Server/Client Components | Already in use, Server Components default for static content pages |
| TypeScript | 5.x | Type safety | Already in use, provides type checking for Metadata objects |
| Tailwind CSS | v4 | Styling system | Already in use, style guide tokens configured in Phase 1 |
| next/font/google | Built-in | Inter font optimization | Already configured in Phase 1, prevents layout shift (SEO-04) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| usePathname hook | Built-in Next.js 15 | Client-side route detection | Mark navigation pills as active/greyed out based on current route |
| next/link | Built-in Next.js 15 | Client-side navigation | Cross-links between Who/What pages |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js Metadata API | react-helmet or next-seo | Deprecated - Next.js 15 has native Metadata API, no external libraries needed |
| Static page routes | Dynamic routes with generateStaticParams | Unnecessary complexity - only three static pages, no dynamic segments needed |
| usePathname() | Server-side headers() | Cannot detect route in Server Components for navigation styling, usePathname() is correct pattern |

**Installation:**

No additional packages needed. All required libraries already installed in Phase 1 and Phase 2.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (exists, has Inter font)
│   ├── page.tsx                # Home page route (exists, needs content update)
│   ├── who/
│   │   └── page.tsx            # Who page route (CREATE)
│   └── what/
│       └── page.tsx            # What page route (CREATE)
│
├── components/
│   └── layout/
│       └── Header.tsx          # Fixed header (exists, needs active state logic)
└── docs/
    └── web-architecture.md     # Source of truth for all page content
```

**Phase 3 creates:** `app/who/page.tsx`, `app/what/page.tsx`, and updates `app/page.tsx` and `components/layout/Header.tsx`.

### Pattern 1: Per-Page Metadata Export

**What:** Each page exports a unique `metadata` object with title and description. Next.js automatically generates `<title>` and `<meta>` tags in `<head>`.

**When to use:** Every page route in the app (required for SEO-01).

**Example:**

```typescript
// app/who/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Who is Continua For? | Continua',
  description: 'Continua helps individuals, couples, families, and teams understand personality patterns across different contexts.',
}

export default function WhoPage() {
  return <main>{/* Content */}</main>
}
```

**Source:** [Next.js generateMetadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

**Why this works:** Next.js merges page metadata with layout metadata. Pages define unique `title` and `description`, layout provides shared metadata like `metadataBase` and OpenGraph defaults.

### Pattern 2: Semantic HTML Structure

**What:** Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<h1>`-`<h3>`) instead of generic `<div>` tags. Required for SEO-02.

**When to use:** All page routes (Home, Who, What).

**Example:**

```typescript
// app/who/page.tsx
export default function WhoPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-8">
        Who is Continua For?
      </h1>

      <section className="space-y-8">
        <div>
          <h2 className="text-[24px] font-bold mb-3">
            For Individuals
          </h2>
          <p className="text-[18px] md:text-[20px]">
            {/* Content */}
          </p>
        </div>

        <div>
          <h2 className="text-[24px] font-bold mb-3">
            For Couples
          </h2>
          <p className="text-[18px] md:text-[20px]">
            {/* Content */}
          </p>
        </div>
      </section>
    </main>
  )
}
```

**Source:** [Semantic HTML - Fundamentals and Best Practices 2025](https://www.seo-day.de/wiki/on-page-seo/html-optimierung/semantic-html.php?lang=en)

**Semantic element guidelines:**
- **`<main>`**: Wraps primary page content, only one per page
- **`<section>`**: Groups thematically related content
- **`<h1>`**: One per page, primary heading (page title)
- **`<h2>`**: Section headings (For Individuals, For Couples, etc.)
- **`<h3>`**: Sub-section headings (not needed in Phase 3)
- **`<article>`**: Not used - content is not standalone/distributable
- Avoid generic `<div>` for major content structure

### Pattern 3: Style Guide Typography Scale

**What:** Apply exact typography sizes from style guide. Home page uses 48px→64px heading and 18px→20px body text. Who/What pages use 32px page headings, 24px section headings, 18px→20px body text.

**When to use:** All text content (required for HOME-03).

**Example:**

```typescript
// app/page.tsx (Home)
<main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
  {/* Main heading: 48px mobile, 64px at md breakpoint */}
  <h1 className="text-[48px] md:text-[64px] leading-[1.2] font-bold mb-6">
    How can we improve the human condition one person, one couple, one family, and one office at a time?
  </h1>

  {/* Body text: 18px mobile, 20px at md breakpoint */}
  <div className="text-[18px] md:text-[20px] leading-[1.6] space-y-5">
    <p>
      This is not a goal with an end state but, rather, the beginning of a process.
    </p>
  </div>
</main>

// app/who/page.tsx (Who page)
<main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
  {/* Page heading: 32px (consistent across Who/What) */}
  <h1 className="text-[32px] font-bold mb-8">
    Who is Continua For?
  </h1>

  {/* Section headings: 24px */}
  <h2 className="text-[24px] font-bold mb-3">
    For Individuals
  </h2>

  {/* Body text: 18px mobile, 20px at md */}
  <p className="text-[18px] md:text-[20px] leading-[1.6]">
    {/* Content */}
  </p>
</main>
```

**Source:** `/Users/shantam/continua/docs/style-guide.md` (Type Scale section)

**Typography reference from style guide:**
- **48px / 64px at md, Bold**: Home page main heading only
- **32px, Bold**: Page headings (Who page, What page)
- **24px, Bold**: Section headings (For Individuals, Take Assessments, etc.)
- **18px / 20px at md, Normal**: Body text across all pages
- **Base font size**: 16px on `<body>` (already configured in Phase 1)

### Pattern 4: Active Navigation State with usePathname()

**What:** Use `usePathname()` hook in Header component to detect current route. Apply greyed-out styling (`opacity-50 cursor-default`) to navigation pill matching current page. Required for WHO-03, WHAT-03.

**When to use:** Header component (already marked as 'use client').

**Example:**

```typescript
// components/layout/Header.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import Link from 'next/link'

export default function Header() {
  const pathname = usePathname()

  // Check if on Who or What page
  const isWhoPage = pathname === '/who'
  const isWhatPage = pathname === '/what'

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-accent backdrop-blur">
      <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">{/* Logo */}</Link>

        <nav className="flex items-center gap-2">
          {/* Who dropdown - greyed out on /who */}
          <Menu>
            <MenuButton
              disabled={isWhoPage}
              className={`rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors ${
                isWhoPage ? 'opacity-50 cursor-default' : ''
              }`}
            >
              Who
            </MenuButton>
            {!isWhoPage && (
              <MenuItems>{/* Dropdown items */}</MenuItems>
            )}
          </Menu>

          {/* What dropdown - greyed out on /what */}
          <Menu>
            <MenuButton
              disabled={isWhatPage}
              className={`rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors ${
                isWhatPage ? 'opacity-50 cursor-default' : ''
              }`}
            >
              What
            </MenuButton>
            {!isWhatPage && (
              <MenuItems>{/* Dropdown items */}</MenuItems>
            )}
          </Menu>
        </nav>
      </div>
    </header>
  )
}
```

**Source:** [Next.js usePathname Documentation](https://nextjs.org/docs/app/api-reference/functions/use-pathname), [Highlighting Active Links in Next.js 15](https://innosufiyan.hashnode.dev/highlighting-active-links-in-nextjs-15-using-usepathname-and-client-components)

**Key behaviors:**
- `usePathname()` returns current pathname as string (`'/'`, `'/who'`, `'/what'`)
- Only works in Client Components (Header already marked with `'use client'`)
- Apply `opacity-50 cursor-default` to greyed-out pill
- Add `disabled` prop to MenuButton to prevent dropdown opening
- Conditionally render MenuItems only when not disabled (avoid unnecessary dropdown rendering)

### Pattern 5: Cross-Linking Between Pages

**What:** Add links from Who page to What page and vice versa. Architecture document specifies exact cross-link text. Required for WHO-04, WHAT-04.

**When to use:** Bottom of Who page content and bottom of What page content.

**Example:**

```typescript
// app/who/page.tsx (cross-link at end of content)
<p className="text-[18px] md:text-[20px] leading-[1.6] mt-8">
  <em>
    Want to see how it works? Check out{' '}
    <Link
      href="/what"
      className="underline hover:text-accent transition-colors"
    >
      What
    </Link>
    {' '}to learn about taking assessments, viewing results, and exploring your personality coordinates over time.
  </em>
</p>

// app/what/page.tsx (cross-link at end of content)
<p className="text-[18px] md:text-[20px] leading-[1.6] mt-8">
  <em>
    Check out{' '}
    <Link
      href="/who"
      className="underline hover:text-accent transition-colors"
    >
      Who
    </Link>
    {' '}to see how Continua works for individuals, couples, families, and teams.
  </em>
</p>
```

**Source:** `/Users/shantam/continua/docs/web-architecture.md` (Who Page Text and What Page Text sections)

**Architecture document specifies:**
- **Who page**: "*Want to see how it works? Check out What to learn about taking assessments, viewing results, and exploring your personality coordinates over time.*"
- **What page**: "*Check out Who to see how Continua works for individuals, couples, families, and teams.*"

Use `<Link>` component for client-side navigation. Style as inline link with underline and hover color transition.

### Pattern 6: Static Generation at Build Time

**What:** All pages are automatically statically generated by Next.js 15 App Router. No dynamic data fetching, no searchParams, no cookies/headers usage. Result: HTML generated at build time. Required for SEO-03.

**When to use:** Default behavior for Phase 3 pages (no special configuration needed).

**Example:**

```bash
# Build the app
npm run build

# Output shows static generation (○ symbol)
# Route (app)               Size     First Load JS
# ○ /                       142 B          87.5 kB
# ○ /who                    156 B          87.5 kB
# ○ /what                   159 B          87.5 kB
```

**Source:** [Next.js Static Site Generation Documentation](https://devanddeliver.com/blog/frontend/next-js-15-dynamic-routes-and-static-site-generation-ssg)

**How it works:**
- Pages without dynamic data fetching (no `fetch()`, no database queries) are automatically statically generated
- No `generateStaticParams()` needed (only required for dynamic routes like `[slug]`)
- Build output shows `○` symbol for static routes, `λ` for dynamic routes
- Static pages are pure HTML files served from CDN, no server rendering on request

**Verification:** Run `npm run build` and check build output. All three routes (`/`, `/who`, `/what`) should show `○ (Static)` indicator.

### Anti-Patterns to Avoid

- **Don't use dynamic rendering for static content:** Avoid `export const dynamic = 'force-dynamic'` or accessing `cookies()`, `headers()`, `searchParams` in page components. Pages are purely static content.

- **Don't use `<article>` for non-standalone content:** Who/What page sections are not standalone articles (can't be distributed independently). Use `<section>` for thematic grouping instead.

- **Don't deviate from architecture document content:** All content must be verbatim from `/Users/shantam/continua/docs/web-architecture.md`. Don't paraphrase, edit, or "improve" the text.

- **Don't hardcode duplicate navigation logic:** Active state logic lives in Header component only. Don't duplicate usePathname() checks across multiple files.

- **Don't use generic `<div>` for major structure:** `<main>`, `<section>`, `<h1>`-`<h3>` provide semantic meaning for SEO. Only use `<div>` for styling wrappers with no semantic meaning.

- **Don't forget responsive typography:** Use `text-[18px] md:text-[20px]` pattern for body text, `text-[48px] md:text-[64px]` for home heading. Mobile-first approach.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SEO metadata management | Custom `<head>` manipulation, react-helmet | Next.js Metadata API | Built-in type safety, automatic merging across layouts, no hydration issues, no external dependencies |
| Active navigation state | Context API, Redux for pathname tracking | usePathname() hook in Client Component | Next.js provides built-in hook, no state management library needed, automatically updates on navigation |
| Font loading without layout shift | Custom font loading, manual @font-face | next/font/google (already configured) | Prevents CLS automatically with size-adjust, self-hosts fonts at build time, zero external requests |
| Static site generation | Custom build scripts, manual HTML generation | Next.js App Router default behavior | Automatic static optimization, no configuration needed for static pages |
| Semantic HTML validation | Manual HTML structure checking | Browser DevTools accessibility tree | Chrome DevTools > Elements > Accessibility pane shows semantic structure, validates heading hierarchy |

**Key insight:** Next.js 15 App Router makes SEO and static generation the default, not an opt-in feature. Pages without dynamic data are automatically static. Metadata API eliminates need for SEO libraries. usePathname() provides navigation state without client-side routing libraries.

## Common Pitfalls

### Pitfall 1: usePathname() Used in Server Component

**What goes wrong:** Importing and using `usePathname()` in a Server Component causes build error: "usePathname only works in Client Components". Navigation state cannot be detected in Server Components.

**Why it happens:** React hooks (including Next.js hooks like usePathname) only work in Client Components. Server Components have no access to client-side routing state.

**How to avoid:**
- Keep page components (`app/page.tsx`, `app/who/page.tsx`, etc.) as Server Components (no `'use client'`)
- Only use `usePathname()` in Header component, which is already marked with `'use client'` from Phase 2
- Pass navigation state down as props if needed (not required for Phase 3)

**Warning signs:**
- Build error mentioning "usePathname only works in Client Components"
- Error about hooks being called in Server Component

**Verification:** Run `npm run build`. Should build successfully with no hook-related errors. Header component has `'use client'` directive at top of file.

### Pitfall 2: Missing or Duplicate `<h1>` Tags

**What goes wrong:** Multiple `<h1>` tags on same page or no `<h1>` tag. Confuses search engines and screen readers about page hierarchy. Hurts SEO and accessibility.

**Why it happens:** Developers forget heading hierarchy or copy/paste headings without adjusting levels.

**How to avoid:**
- Every page must have exactly one `<h1>` (the main page heading)
- Home page `<h1>`: "How can we improve the human condition..."
- Who page `<h1>`: "Who is Continua For?"
- What page `<h1>`: "What Does Continua Do?"
- Section headings are `<h2>` (For Individuals, Take Assessments, etc.)
- Never skip heading levels (no `<h1>` → `<h3>` without `<h2>` in between)

**Warning signs:**
- Lighthouse SEO audit warning about missing or duplicate `<h1>`
- Screen reader announces multiple level-1 headings
- Axe DevTools flags heading hierarchy issues

**Verification:** Run Lighthouse audit. Check "Best Practices" and "SEO" scores. Inspect page with Chrome DevTools > Elements > Accessibility tree to verify heading hierarchy.

**Source:** [Semantic HTML5 Elements Explained](https://www.freecodecamp.org/news/semantic-html5-elements/)

### Pitfall 3: Metadata Not Exported from Page

**What goes wrong:** Page component doesn't export `metadata` object. Browser tab shows fallback title from root layout. Search results show generic description. SEO suffers.

**Why it happens:** Forgot to add metadata export, typo in export name (`meta` instead of `metadata`), or incorrect type import.

**How to avoid:**
- Every page file must export: `export const metadata: Metadata = { title: '...', description: '...' }`
- Import type: `import type { Metadata } from 'next'`
- Metadata must be exported as named `const`, not default export
- Metadata merges with layout metadata (page metadata takes precedence)

**Warning signs:**
- Browser tab shows root layout title instead of page-specific title
- View page source shows wrong `<title>` or `<meta name="description">`
- Social media preview shows wrong title/description

**Verification:** Build app and check HTML source. Each page should have unique `<title>` and `<meta name="description">` tags. Test by navigating to each page and checking browser tab title.

**Source:** [Next.js Metadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Pitfall 4: Content Doesn't Match Architecture Document

**What goes wrong:** Content on pages differs from architecture document (paraphrased, shortened, or "improved"). Violates requirements HOME-02, WHO-02, WHAT-02 which specify content must be "verbatim" from architecture doc.

**Why it happens:** Developers try to improve readability, fix grammar, or shorten text without realizing requirements specify exact text.

**How to avoid:**
- Copy content directly from `/Users/shantam/continua/docs/web-architecture.md`
- Use exact text, do not edit or paraphrase
- Home page content: Section 3 "Home Page Text" (3 paragraphs)
- Who page content: Section 2.2 "Who Page Text" (4 audience descriptions)
- What page content: Section 2.3 "What Page Text" (3 feature descriptions)
- Cross-links must match exact text from architecture doc

**Warning signs:**
- Reviewing code and content doesn't match source document
- Requirements verification fails because text differs

**Verification:** Side-by-side comparison of rendered page content with architecture document. Use exact match tool or manual review. Every word, punctuation mark, and paragraph break must match.

### Pitfall 5: Typography Scale Inconsistency

**What goes wrong:** Font sizes don't match style guide. Using generic Tailwind sizes like `text-4xl` instead of exact pixel values. Text too small on mobile or too large on desktop. Fails HOME-03 requirement.

**Why it happens:** Developers use Tailwind's default scale instead of custom pixel values from style guide. Forgetting responsive breakpoints for heading/body text.

**How to avoid:**
- Use exact pixel values with bracket syntax: `text-[48px]`, not `text-5xl`
- Apply responsive sizes for home page heading: `text-[48px] md:text-[64px]`
- Apply responsive sizes for body text: `text-[18px] md:text-[20px]`
- Page headings (Who/What): `text-[32px]` (no responsive variant)
- Section headings: `text-[24px]` (no responsive variant)
- Always include line-height: `leading-[1.2]` for headings, `leading-[1.6]` for body

**Warning signs:**
- Text looks too small or too large compared to prototype
- Lighthouse flags text readability issues
- Design review reveals typography inconsistencies

**Verification:** Compare rendered page with style guide specifications. Use browser DevTools computed styles to verify exact pixel values at different breakpoints. Test on mobile (375px) and desktop (720px) widths.

**Source:** `/Users/shantam/continua/docs/style-guide.md` (Type Scale section)

### Pitfall 6: Active Navigation State Not Disabling Dropdown

**What goes wrong:** Navigation pill is visually greyed out but dropdown still opens when clicked. Confusing user experience. User clicks greyed pill and sees dropdown, contradicting visual disabled state.

**Why it happens:** Applied opacity styling but forgot to add `disabled` prop to MenuButton or conditionally render MenuItems.

**How to avoid:**
- Add `disabled={isWhoPage}` prop to Who MenuButton
- Add `disabled={isWhatPage}` prop to What MenuButton
- Conditionally render MenuItems: `{!isWhoPage && <MenuItems>...</MenuItems>}`
- Apply visual disabled state: `${isWhoPage ? 'opacity-50 cursor-default' : ''}`
- Headless UI automatically handles disabled state (no pointer events, no keyboard activation)

**Warning signs:**
- Greyed out pill still opens dropdown on click
- Keyboard navigation still activates disabled dropdown
- User confused by inconsistent behavior

**Verification:** Navigate to `/who` page. Who pill should be greyed out and clicking it should do nothing. Dropdown should not appear. Same for What pill on `/what` page. Test keyboard navigation (Tab + Enter should not open disabled dropdown).

### Pitfall 7: Cross-Links Missing or Incorrect

**What goes wrong:** Cross-links between Who and What pages are missing, point to wrong URL, or use incorrect text. Fails WHO-04, WHAT-04 requirements.

**Why it happens:** Forgot to add cross-link paragraph at bottom of page content, or didn't reference architecture document for exact text.

**How to avoid:**
- Who page must link to What page with exact text: "*Want to see how it works? Check out What to learn about taking assessments, viewing results, and exploring your personality coordinates over time.*"
- What page must link to Who page with exact text: "*Check out Who to see how Continua works for individuals, couples, families, and teams.*"
- Use `<Link href="/what">` and `<Link href="/who">` for navigation
- Style as italic text (`<em>` or `italic` class) with inline underlined link
- Place at bottom of page content (after last section)

**Warning signs:**
- No cross-links at bottom of Who/What pages
- Cross-link text doesn't match architecture document
- Cross-link points to wrong URL

**Verification:** Navigate to Who page, scroll to bottom, verify cross-link text and that it navigates to What page. Repeat for What page cross-link to Who page. Compare text with architecture document Section 2.2 and 2.3.

**Source:** `/Users/shantam/continua/docs/web-architecture.md` (Who Page Text and What Page Text sections)

## Code Examples

Verified patterns from official sources and architecture document:

### Home Page Complete Implementation

```typescript
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Continua - Personality Assessment Platform',
  description: 'Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.',
}

export default function HomePage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      {/* Main heading - 48px mobile, 64px desktop */}
      <h1 className="text-[48px] md:text-[64px] leading-[1.2] font-bold mb-6">
        How can we improve the human condition one person, one couple, one family, and one office at a time?
      </h1>

      {/* Body text - 18px mobile, 20px desktop */}
      <div className="text-[18px] md:text-[20px] leading-[1.6] space-y-5">
        <p>
          This is not a goal with an end state but, rather, the beginning of a process. All personality characteristics function on continua. Most people fall somewhere between the extremes, and even those positions shift depending on context, stress, growth, and intention.
        </p>

        <p>
          The purpose of this exploration is not to define personality in a way that makes more effective business teams or helps people find their perfect mate. The purpose is to give people tools to better relate to their family, friends, and colleagues. To transform conflicts that feel like character incompatibility into recognition of complementary positioning. To replace judgment with curiosity. To move from "why can't you be different?" to "how can we leverage our differences?"
        </p>

        <p>
          We introduce that vision: a way of seeing personality as fluid coordinates across six primary axes — Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, and Reactivity. Together, these six dimensions form a living system — a portrait of human nature in motion.
        </p>
      </div>
    </main>
  )
}
```

**Source:** Content from `/Users/shantam/continua/docs/web-architecture.md` Section 3, Typography from `/Users/shantam/continua/docs/style-guide.md`

### Who Page Complete Implementation

```typescript
// app/who/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Who is Continua For? | Continua',
  description: 'Continua helps individuals, couples, families, and teams understand personality patterns across different contexts.',
}

export default function WhoPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-8">
        Who is Continua For?
      </h1>

      <section className="space-y-8">
        <div>
          <h2 className="text-[24px] font-bold mb-3">
            For Individuals
          </h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Continua helps you see your patterns across different situations and contexts. Maybe you're more conscientious at work than at home, more empathetic with friends than with co-workers. Understanding these shifts gives you real insight into how you operate in the world. You'll identify growth opportunities that matter to you, make better decisions about which environments bring out your best self, and build genuine self-awareness that goes beyond simple personality labels.
          </p>
        </div>

        <div>
          <h2 className="text-[24px] font-bold mb-3">
            For Couples
          </h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Relationship friction often comes from misunderstood personality differences. When you can see exactly where your personalities align and diverge, those differences stop feeling like incompatibility and start looking like complementarity. Continua shows you how your partner's "opposite" traits might actually balance and strengthen your relationship. You'll understand why you react differently to the same situations, communicate more effectively, and access practical tools designed specifically for your unique combination.
          </p>
        </div>

        <div>
          <h2 className="text-[24px] font-bold mb-3">
            For Families
          </h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Every family member brings a different personality profile to the table, and that complexity can create both richness and friction. Continua helps you map the whole ecosystem — see why siblings clash, understand parent-child dynamics, and recognize how everyone's wiring affects the family system. As children grow and circumstances change, you can track how these dynamics shift and adapt accordingly. The goal is helping everyone feel understood rather than judged.
          </p>
        </div>

        <div>
          <h2 className="text-[24px] font-bold mb-3">
            For Teams
          </h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            The best teams aren't made up of similar people — they're balanced across personality dimensions. Continua helps you assess whether your team has the range needed for a specific project, assign roles that match people's natural strengths, and identify gaps before they become problems. Whether you're building a new team or optimizing an existing one, you'll get insights into why certain combinations work and where personality differences might create friction worth planning around.
          </p>
        </div>
      </section>

      {/* Cross-link to What page */}
      <p className="text-[18px] md:text-[20px] leading-[1.6] mt-8 italic">
        Want to see how it works? Check out{' '}
        <Link
          href="/what"
          className="underline hover:text-accent transition-colors"
        >
          What
        </Link>
        {' '}to learn about taking assessments, viewing results, and exploring your personality coordinates over time.
      </p>
    </main>
  )
}
```

**Source:** Content from `/Users/shantam/continua/docs/web-architecture.md` Section 2.2

### What Page Complete Implementation

```typescript
// app/what/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What Does Continua Do? | Continua',
  description: 'Take personality assessments, see your results across contexts, and get personalized tools and actions for growth.',
}

export default function WhatPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-8">
        What Does Continua Do?
      </h1>

      <section className="space-y-8">
        <div>
          <h2 className="text-[24px] font-bold mb-3">
            Take Assessments
          </h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Your personality isn't static — it shifts based on context, relationships, and circumstances. That's why Continua offers hundreds of different assessment variations you can take whenever you want. Maybe you take one at work on a stressful Monday, another at home on a relaxed Sunday evening, and a third while traveling. Each snapshot captures where you are in that moment, and over time, these assessments build a rich picture of your personality patterns. You can tag each one with what you were doing, where you were, and who you were with, so you can start to see the contexts that bring out different aspects of yourself.
          </p>
        </div>

        <div>
          <h2 className="text-[24px] font-bold mb-3">
            See Your Results
          </h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            This is where it gets interesting. All your assessments are collected in one place, and you can view them in whatever way makes sense for what you're exploring. Want to see how your personality shifts over time? Sort by date. Curious whether you're different at home versus at the office? Filter by location. Wondering if certain activities bring out specific traits? Group by what you were doing.
          </p>
          <p className="text-[18px] md:text-[20px] leading-[1.6] mt-4">
            You can also organize results by cohort — look at yourself individually, compare your profile with your partner's, see how your family members' personalities interact, or understand your team's collective strengths and gaps. The visual displays show not just your individual profile, but how groups add up. Does your team cover all the personality bases needed for your project? Are you and your partner complementary across the key dimensions?
          </p>
          <p className="text-[18px] md:text-[20px] leading-[1.6] mt-4">
            Within each dimension, you can input specific goals and get personalized suggestions for how to optimize your approach. The system helps you understand not just where you are, but how to leverage that knowledge for the growth and outcomes you're after.
          </p>
        </div>

        <div>
          <h2 className="text-[24px] font-bold mb-3">
            Tools and Actions
          </h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Understanding your personality is just the starting point — the real value comes from knowing what to do with that information. Within each dimension, you can set specific goals and get personalized recommendations tailored to your unique profile. Whether you're working on individual growth, strengthening a relationship, improving family dynamics, or optimizing team performance, Continua provides actionable strategies based on where you actually are, not where some generic type says you should be. The tools adapt to your specific patterns and contexts, giving you practical next steps that make sense for your situation.
          </p>
        </div>
      </section>

      {/* Cross-link to Who page */}
      <p className="text-[18px] md:text-[20px] leading-[1.6] mt-8 italic">
        Check out{' '}
        <Link
          href="/who"
          className="underline hover:text-accent transition-colors"
        >
          Who
        </Link>
        {' '}to see how Continua works for individuals, couples, families, and teams.
      </p>
    </main>
  )
}
```

**Source:** Content from `/Users/shantam/continua/docs/web-architecture.md` Section 2.3

**Note:** "See Your Results" section has three paragraphs in architecture doc, separated for readability.

### Active Navigation State in Header

```typescript
// components/layout/Header.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'

const whoItems = [
  { href: '/who', label: 'Individuals' },
  { href: '/who', label: 'Couples' },
  { href: '/who', label: 'Families' },
  { href: '/who', label: 'Teams' },
]

const whatItems = [
  { href: '/what', label: 'Take a Test' },
  { href: '/what', label: 'See Results' },
  { href: '/what', label: 'Tools and Actions' },
]

const bookItems = [
  { label: 'Publishers' },
  { label: 'Agents' },
  { label: 'Therapists' },
]

export default function Header() {
  const pathname = usePathname()

  // Check if on Who or What page
  const isWhoPage = pathname === '/who'
  const isWhatPage = pathname === '/what'

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-accent backdrop-blur">
      <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Continua"
            width={72}
            height={48}
            priority
          />
        </Link>

        <nav className="flex items-center gap-2">
          {/* Who dropdown - greyed out on /who */}
          <Menu>
            <MenuButton
              disabled={isWhoPage}
              className={`rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white transition-colors ${
                isWhoPage
                  ? 'opacity-50 cursor-default'
                  : 'hover:bg-white/35'
              }`}
            >
              Who
            </MenuButton>
            {!isWhoPage && (
              <MenuItems
                anchor="bottom start"
                className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
              >
                {whoItems.map((item) => (
                  <MenuItem key={item.label}>
                    {({ focus }) => (
                      <Link
                        href={item.href}
                        className={`block px-4 py-2 rounded-lg text-sm ${
                          focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            )}
          </Menu>

          {/* What dropdown - greyed out on /what */}
          <Menu>
            <MenuButton
              disabled={isWhatPage}
              className={`rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white transition-colors ${
                isWhatPage
                  ? 'opacity-50 cursor-default'
                  : 'hover:bg-white/35'
              }`}
            >
              What
            </MenuButton>
            {!isWhatPage && (
              <MenuItems
                anchor="bottom start"
                className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
              >
                {whatItems.map((item) => (
                  <MenuItem key={item.label}>
                    {({ focus }) => (
                      <Link
                        href={item.href}
                        className={`block px-4 py-2 rounded-lg text-sm ${
                          focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            )}
          </Menu>

          {/* Book dropdown - never greyed out */}
          <Menu>
            <MenuButton className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors">
              Book
            </MenuButton>
            <MenuItems
              anchor="bottom start"
              className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
            >
              {bookItems.map((item) => (
                <MenuItem key={item.label}>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                        focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

          <button
            type="button"
            className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>
  )
}
```

**Source:** [Next.js usePathname Documentation](https://nextjs.org/docs/app/api-reference/functions/use-pathname), [Highlighting Active Links in Next.js 15](https://innosufiyan.hashnode.dev/highlighting-active-links-in-nextjs-15-using-usepathname-and-client-components)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-helmet or next-seo for metadata | Next.js Metadata API | Next.js 13+ (2022) | Built-in type safety, automatic optimization, no external dependencies |
| router.asPath for active navigation | usePathname() hook | Next.js 13+ App Router (2022) | Cleaner API, works with Server/Client boundaries, no router import needed |
| Manual `<Head>` component manipulation | Export metadata object | Next.js 13+ (2022) | Server-side rendering friendly, automatic merging across layouts |
| getStaticProps for static pages | Automatic static optimization | Next.js 9+ (2019), improved in 13+ | No configuration needed, automatic detection of static pages |
| Generic `<div>` for structure | Semantic HTML5 elements | Ongoing best practice | Better SEO, accessibility, and AI crawler understanding |

**Deprecated/outdated:**
- **react-helmet**: Use Next.js Metadata API instead
- **next-seo package**: Superseded by built-in Metadata API
- **router.asPath**: Use usePathname() hook in App Router
- **Pages Router `getStaticProps`**: App Router uses automatic static optimization
- **Manual font loading**: Use next/font/google (already configured)

## Open Questions

1. **Should cross-link styling be more prominent?**
   - What we know: Architecture doc shows cross-links in italic text at bottom of content
   - What's unclear: Whether inline links should have stronger visual treatment
   - Recommendation: Use underline + hover color as shown in code examples. Italic text matches architecture doc formatting. Test user behavior to see if cross-links are discoverable.

2. **Should page metadata include OpenGraph tags for social sharing?**
   - What we know: Basic title and description satisfy SEO-01 requirement
   - What's unclear: Whether social sharing is in scope for v1
   - Recommendation: Add basic OpenGraph tags (title, description, image) in root layout. Page-specific OpenGraph can be added in Phase 4 if social sharing becomes priority.

3. **Should "See Your Results" section use separate divs or single div with multiple paragraphs?**
   - What we know: Architecture doc shows three paragraphs in "See Your Results" section
   - What's unclear: Whether to wrap in single section or separate into sub-sections
   - Recommendation: Use single `<div>` with multiple `<p>` tags (shown in code examples). Content is cohesive single topic, not separate sub-sections.

## Sources

### Primary (HIGH confidence)

- [Next.js: generateMetadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Official Metadata API reference
- [Next.js: usePathname Documentation](https://nextjs.org/docs/app/api-reference/functions/use-pathname) - Official hook documentation
- [Next.js: Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) - Official navigation patterns
- [Next.js: Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - Official font loading documentation
- [W3C: Semantic HTML5 Elements](https://www.w3schools.com/html/html5_semantic_elements.asp) - HTML5 semantic structure
- [Semantic HTML - web.dev](https://web.dev/learn/html/semantic-html) - Google's semantic HTML guide

### Secondary (MEDIUM confidence)

- [The Complete Guide to SEO Optimization in Next.js 15](https://medium.com/@thomasaugot/the-complete-guide-to-seo-optimization-in-next-js-15-1bdb118cffd7) - SEO best practices
- [Highlighting Active Links in Next.js 15](https://innosufiyan.hashnode.dev/highlighting-active-links-in-nextjs-15-using-usepathname-and-client-components) - usePathname() implementation patterns
- [Next.js 15: Dynamic routes and Static Site Generation](https://devanddeliver.com/blog/frontend/next-js-15-dynamic-routes-and-static-site-generation-ssg) - Static generation explanation
- [Semantic HTML5 Elements Explained](https://www.freecodecamp.org/news/semantic-html5-elements/) - Semantic HTML best practices
- [5 Essential Techniques to Eliminate Layout Shifts in Next.js](https://medium.com/@ferhattaher00/5-essential-techniques-to-eliminate-layout-shifts-in-next-js-5f314cb23e4e) - CLS prevention
- [Semantic HTML - Fundamentals and Best Practices 2025](https://www.seo-day.de/wiki/on-page-seo/html-optimierung/semantic-html.php?lang=en) - 2026 semantic HTML guide

### Project-Specific (HIGH confidence)

- `/Users/shantam/continua/docs/web-architecture.md` - Source of truth for all page content, cross-links, and structure
- `/Users/shantam/continua/docs/style-guide.md` - Typography scale, spacing, layout specifications
- `.planning/phases/01-foundation-and-layout/01-RESEARCH.md` - Phase 1 foundation (Inter font, Tailwind setup)
- `.planning/phases/02-interactive-navigation/02-RESEARCH.md` - Phase 2 navigation (Headless UI dropdowns)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js 15 Metadata API and usePathname() are official, stable, documented features. No external dependencies needed.
- Architecture patterns: HIGH - Patterns verified through official Next.js documentation. Content source and typography specifications from project docs.
- Semantic HTML: HIGH - W3C specifications and web.dev guidance are authoritative sources. Clear hierarchy for `<main>`, `<section>`, `<h1>`-`<h3>`.
- Static generation: HIGH - Next.js 15 automatically statically generates pages without dynamic data. No configuration needed.
- Active navigation: HIGH - usePathname() hook is official Next.js API. Pattern verified in multiple sources.
- Typography: HIGH - Exact specifications from project style guide. All sizes, weights, and responsive breakpoints documented.
- Content: HIGH - Architecture document is source of truth, provides exact text for all three pages plus cross-links.

**Research date:** 2026-02-11
**Valid until:** 2026-05-11 (90 days - stable technology, minimal expected churn)
**Technologies:** Next.js 15, React 19, TypeScript 5, Tailwind CSS v4, Headless UI 2.2.9

**Prior Research Referenced:**
- `.planning/phases/01-foundation-and-layout/01-RESEARCH.md` - Inter font loading, Tailwind CSS v4 configuration, Server/Client component boundaries
- `.planning/phases/02-interactive-navigation/02-RESEARCH.md` - Headless UI Menu component, dropdown accessibility, usePathname() usage pattern

---

*Research complete for Phase 3: Content Pages & SEO. Ready for planning.*
