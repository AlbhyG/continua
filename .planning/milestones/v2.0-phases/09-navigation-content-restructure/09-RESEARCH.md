# Phase 9: Navigation & Content Restructure - Research

**Researched:** 2026-02-16
**Domain:** Next.js navigation restructuring, responsive layout, URL redirects
**Confidence:** HIGH

## Summary

Phase 9 restructures the site navigation from separate "Who" and "What" dropdowns into a combined "Learn" dropdown, adds Coming Soon indicators for future features, creates two new content pages (My Relationships, My Info), implements redirects for old URLs, updates home page copy, and optimizes the layout for tablet and desktop screen sizes.

This phase combines several technical domains: navigation component restructuring (already using Headless UI Menu from Phase 2), Next.js redirect configuration for old URLs, responsive design optimization with Tailwind CSS breakpoints, and content page creation following existing patterns. The technical stack is already in place - no new libraries needed.

The key architectural decisions are: (1) use next.config.js redirects for permanent URL redirects from /who and /what to new pages, (2) implement Coming Soon badges as simple inline elements with visual indicators (text + styling), not disabled menu items, (3) follow the existing content page pattern from /who and /what pages for the new My Relationships and My Info pages, and (4) use Tailwind's md: and lg: breakpoints for tablet and desktop optimizations.

**Primary recommendation:** Restructure navigation by combining Who/What items into a single "Learn" dropdown using existing Headless UI Menu pattern. Add permanent redirects in next.config.js from /who to /my-relationships and /what to /my-info. Create new content pages following existing page structure. Add Coming Soon badges as inline span elements with distinctive styling. Optimize responsive breakpoints using md: (768px) for tablet and lg: (1024px) for desktop layouts.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @headlessui/react | 2.2.9 | Navigation dropdown menus | Already in use since Phase 2, handles accessibility automatically |
| Next.js 15 | 15.x | App Router with redirects and metadata | Already in use, provides next.config.js redirects and built-in SEO |
| React 19 | 19.x | Component framework | Already in use, latest stable version |
| Tailwind CSS | 4.1.18 | Responsive styling system | Already in use, provides breakpoint system (md:, lg:, xl:) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No additional libraries needed | All requirements covered by existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next.config.js redirects | Middleware redirects | Middleware better for dynamic/conditional redirects, config better for simple static redirects (Phase 9 needs simple static) |
| Permanent redirect (308) | Temporary redirect (307) | Permanent passes SEO score, used when URL structure changes permanently (correct for Phase 9) |
| Coming Soon badges | Disabled menu items | Badges communicate "future feature" better than disabled items which imply "unavailable now" |

**Installation:**
```bash
# No new installations needed - all dependencies already in place
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── page.tsx                # Home page (update copy)
│   ├── my-relationships/
│   │   └── page.tsx           # New: relationship-focused content
│   ├── my-info/
│   │   └── page.tsx           # New: self-assessment content
│   ├── who/                   # Redirects to /my-relationships
│   │   └── page.tsx           # Keep temporarily or remove after redirect
│   └── what/                  # Redirects to /my-info
│       └── page.tsx           # Keep temporarily or remove after redirect
├── components/
│   └── layout/
│       └── Header.tsx         # Update: combined Learn dropdown
└── next.config.ts             # Add redirects
```

### Pattern 1: Combined Dropdown Menu Navigation
**What:** Merge Who/What items into single "Learn" dropdown with audience and offering sections
**When to use:** Primary navigation restructure
**Example:**
```typescript
// Source: https://headlessui.com/react/menu
// Current pattern from Phase 2, adapted for Learn dropdown
const learnItems = [
  // Audience section (from Who)
  { href: '/my-relationships', label: 'My Relationships' },
  { href: '/my-info', label: 'My Info' },
  // Offering section (from What) with Coming Soon
  { href: '#', label: 'Add', comingSoon: true },
  { href: '#', label: 'My Projects', comingSoon: true },
  { href: '#', label: 'Take a Test', comingSoon: true },
  { href: '#', label: 'My Results', comingSoon: true },
]

<Menu>
  <MenuButton className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors">
    Learn
  </MenuButton>
  <MenuItems
    anchor="bottom start"
    className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
  >
    {learnItems.map((item) => (
      <MenuItem key={item.label}>
        {({ focus }) => (
          <Link
            href={item.href}
            className={`block px-4 py-2 rounded-lg text-sm ${
              focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
            }`}
          >
            {item.label}
            {item.comingSoon && (
              <span className="ml-2 text-xs text-gray-500">Coming Soon</span>
            )}
          </Link>
        )}
      </MenuItem>
    ))}
  </MenuItems>
</Menu>
```

### Pattern 2: Permanent URL Redirects
**What:** Redirect old URLs to new content pages with 308 status
**When to use:** When URL structure changes permanently
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
// next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/who',
        destination: '/my-relationships',
        permanent: true, // 308 status - passes SEO score
      },
      {
        source: '/what',
        destination: '/my-info',
        permanent: true,
      },
    ]
  },
}
```

### Pattern 3: Coming Soon Badge Component
**What:** Inline visual indicator for unavailable features
**When to use:** Menu items, buttons, or links for future features
**Example:**
```typescript
// Simple inline badge - no library needed
<span className="inline-flex items-center gap-2">
  Take a Test
  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
    Coming Soon
  </span>
</span>

// Or as accessible button with aria-disabled
<button
  aria-disabled="true"
  className="opacity-50 cursor-default"
>
  Take a Test
  <span className="ml-2 text-xs text-gray-500">Coming Soon</span>
</button>
```

### Pattern 4: Content Page Structure
**What:** Consistent page layout with metadata, heading, sections
**When to use:** All content pages (My Relationships, My Info)
**Example:**
```typescript
// Source: Existing /who and /what pages
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Relationships | Continua',
  description: 'Understand personality patterns in your relationships...'
}

export default function MyRelationshipsPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-8">My Relationships</h1>
      <section className="space-y-8">
        {/* Content sections */}
      </section>
    </main>
  )
}
```

### Pattern 5: Responsive Breakpoint Optimization
**What:** Mobile-first responsive design with tablet (md:) and desktop (lg:) breakpoints
**When to use:** All layouts and text sizing
**Example:**
```typescript
// Source: https://tailwindcss.com/docs/responsive-design
// Existing pattern from current pages
<main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
  <h1 className="text-[48px] md:text-[64px] lg:text-[72px] leading-[1.2] font-bold">
    {/* Mobile: 48px, Tablet: 64px, Desktop: 72px */}
  </h1>
  <div className="text-[18px] md:text-[20px] lg:text-[22px] leading-[1.6]">
    {/* Responsive text sizing */}
  </div>
</main>

// Tailwind breakpoints:
// md: 768px (tablet)
// lg: 1024px (desktop)
// xl: 1280px (large desktop)
```

### Pattern 6: Next.js Metadata API for SEO
**What:** Static metadata exports for title and description
**When to use:** Every page
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | Continua',
  description: 'Clear, keyword-rich description under 160 characters',
}
```

### Anti-Patterns to Avoid
- **Don't use disabled menu items for Coming Soon features** - Disabled items are hard to discover and don't communicate "future availability"
- **Don't implement redirects in middleware for simple static redirects** - next.config.js is simpler and more performant for static URL changes
- **Don't use temporary redirects (307) for permanent URL structure changes** - Permanent redirects (308) pass SEO score to new pages
- **Don't create custom badge components when simple inline elements work** - Avoid over-engineering for simple status indicators
- **Don't skip metadata on content pages** - Every page needs unique title and description for SEO

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL redirects | Custom redirect logic in components | next.config.js redirects | Next.js redirects handle edge cases: query params, hashes, trailing slashes, case sensitivity, locale routing |
| Responsive breakpoints | Custom media queries in CSS | Tailwind breakpoint prefixes (md:, lg:) | Tailwind provides consistent system, better DX, easier maintenance, automatic optimization |
| Dropdown menus | Custom state management | Headless UI Menu (already in use) | Already implemented in Phase 2, handles accessibility automatically |
| SEO metadata | Manual <head> tags | Next.js Metadata API | Server-generated, TypeScript support, automatic deduplication, better SEO |
| Coming Soon badges | Complex component library | Simple inline elements | Over-engineering simple status indicators adds unnecessary complexity |

**Key insight:** Phase 9 leverages existing patterns from Phases 1-2 (navigation, layout, content pages). The main new technical element is redirect configuration, which Next.js handles natively in next.config.js. No custom solutions needed - all requirements map to existing patterns or built-in Next.js features.

## Common Pitfalls

### Pitfall 1: Redirect Loops
**What goes wrong:** Browser error "Too many redirects" or infinite redirect loop
**Why it happens:** Source and destination paths conflict, or redirect chain creates a loop
**How to avoid:** Keep redirects simple and unidirectional. Test with browser DevTools Network tab to verify single redirect. Never redirect /my-relationships back to /who.
**Warning signs:** Browser "redirect loop detected" error, page never loads, 308 responses cycling

### Pitfall 2: Breaking Existing Links
**What goes wrong:** Internal links still point to old URLs, causing unnecessary redirects
**Why it happens:** Forgot to update Link components when URLs change
**How to avoid:** After adding redirects, grep codebase for old URLs: `grep -r "href=\"/who\"" src/`. Update all internal links to use new URLs directly.
**Warning signs:** Every navigation triggers redirect, slower page transitions, 308 status codes in Network tab

### Pitfall 3: Missing Metadata on New Pages
**What goes wrong:** New pages show default "Continua" title, poor search result snippets
**Why it happens:** Forgot to export metadata object from page.tsx
**How to avoid:** Every new page needs unique metadata export. Copy pattern from existing /who and /what pages. Test by viewing browser tab title.
**Warning signs:** Browser tab shows only "Continua", Google preview shows generic description

### Pitfall 4: Coming Soon Items Still Navigable
**What goes wrong:** User clicks "Take a Test (Coming Soon)" and expects something to happen
**Why it happens:** Coming Soon items use href="#" which scrolls to top, or href is omitted causing click behavior
**How to avoid:** Use disabled button or span with cursor-default. If using link, set href="#" and add onClick={e => e.preventDefault()}.
**Warning signs:** Clicking Coming Soon items causes page scroll or navigation

### Pitfall 5: Inconsistent Mobile/Tablet/Desktop Layouts
**What goes wrong:** Text too large on mobile, too small on desktop, or layout breaks at certain widths
**Why it happens:** Missing or incorrect responsive breakpoints, not testing at tablet width (768px)
**How to avoid:** Follow existing pattern: max-w-[375px] md:max-w-[720px]. Test at 375px (mobile), 768px (tablet), 1024px+ (desktop). Use browser DevTools responsive mode.
**Warning signs:** Horizontal scroll on mobile, too much whitespace on desktop, layout shifts at breakpoints

### Pitfall 6: Old Pages Not Removed After Redirects
**What goes wrong:** Confusion about which files are active, potential for conflicting content
**Why it happens:** Redirects work whether old pages exist or not, so old files left in codebase
**How to avoid:** After confirming redirects work, decide: remove old /who and /what page.tsx files OR keep temporarily with notice. Document decision in code comments.
**Warning signs:** Duplicate content in codebase, uncertainty about which page is canonical

### Pitfall 7: Forgetting z-index for Dropdown
**What goes wrong:** Learn dropdown appears behind other page elements
**Why it happens:** Dropdown needs higher z-index than existing content, but value not updated
**How to avoid:** MenuItems already use z-[100] from Phase 2. Verify this is maintained in restructured navigation. Test by opening dropdown over content.
**Warning signs:** Dropdown partially hidden, appears behind content sections

## Code Examples

Verified patterns from official sources:

### Complete Learn Dropdown with Coming Soon
```typescript
// Source: https://headlessui.com/react/menu + existing Header.tsx pattern
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import Link from 'next/link'

const learnItems = [
  { href: '/my-relationships', label: 'My Relationships', section: 'audience' },
  { href: '/my-info', label: 'My Info', section: 'audience' },
  { href: '#', label: 'Add', section: 'offering', comingSoon: true },
  { href: '#', label: 'My Projects', section: 'offering', comingSoon: true },
  { href: '#', label: 'Take a Test', section: 'offering', comingSoon: true },
  { href: '#', label: 'My Results', section: 'offering', comingSoon: true },
]

<Menu>
  <MenuButton className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors">
    Learn
  </MenuButton>
  <MenuItems
    anchor="bottom start"
    className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
  >
    {learnItems.map((item) => (
      <MenuItem key={item.label} disabled={item.comingSoon}>
        {({ focus }) => (
          item.comingSoon ? (
            <span className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm cursor-default opacity-60`}>
              {item.label}
              <span className="text-xs text-gray-500">Coming Soon</span>
            </span>
          ) : (
            <Link
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm ${
                focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          )
        )}
      </MenuItem>
    ))}
  </MenuItems>
</Menu>
```

### next.config.ts with Permanent Redirects
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/who',
        destination: '/my-relationships',
        permanent: true, // 308 status code - permanent redirect
      },
      {
        source: '/what',
        destination: '/my-info',
        permanent: true, // 308 status code - permanent redirect
      },
    ]
  },
};

export default nextConfig;
```

### My Relationships Content Page
```typescript
// Source: Existing /who page pattern
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Relationships | Continua',
  description: 'Understand personality patterns in your relationships and transform conflicts into complementarity.'
}

export default function MyRelationshipsPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-8">My Relationships</h1>
      <section className="space-y-8">
        <div>
          <h2 className="text-[24px] font-bold mb-3">Understanding Your Relationships</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Relationship friction often comes from misunderstood personality differences.
            When you can see exactly where personalities align and diverge, those
            differences stop feeling like incompatibility and start looking like
            complementarity.
          </p>
        </div>
        {/* Additional sections */}
      </section>
    </main>
  );
}
```

### My Info Content Page
```typescript
// Source: Existing /what page pattern
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Info | Continua',
  description: 'Understand your personality patterns across different contexts with personalized assessments and insights.'
}

export default function MyInfoPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-8">My Info</h1>
      <section className="space-y-8">
        <div>
          <h2 className="text-[24px] font-bold mb-3">Your Personality Profile</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Your personality isn't static — it shifts based on context, relationships,
            and circumstances. Continua helps you see these patterns and understand
            yourself across different situations.
          </p>
        </div>
        {/* Additional sections */}
      </section>
    </main>
  );
}
```

### Updated Home Page Copy
```typescript
// Source: Existing page.tsx pattern
export default function Home() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[48px] md:text-[64px] leading-[1.2] font-bold mb-6">
        The Personality Continua
      </h1>
      {/* Existing content sections unchanged */}
    </main>
  );
}
```

### Responsive Layout Pattern
```typescript
// Source: https://tailwindcss.com/docs/responsive-design + existing pages
// Mobile-first approach: base styles apply to mobile, override at larger breakpoints

// Container width
<main className="max-w-[375px] md:max-w-[720px] mx-auto px-6">
  {/* Mobile: 375px max, Tablet+: 720px max */}
</main>

// Typography scaling
<h1 className="text-[48px] md:text-[64px] lg:text-[72px]">
  {/* Mobile: 48px, Tablet: 64px, Desktop: 72px */}
</h1>

<p className="text-[18px] md:text-[20px] leading-[1.6]">
  {/* Mobile: 18px, Tablet+: 20px */}
</p>

// Layout changes
<div className="flex flex-col md:flex-row gap-4">
  {/* Mobile: stacked, Tablet+: side-by-side */}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual <head> tags for SEO | Next.js Metadata API | Next.js 13+ (2022) | Type-safe, server-generated, automatic deduplication |
| 301/302 redirects | 307/308 redirects | HTTP/1.1 spec clarification (2014), Next.js adoption (2020+) | Preserves HTTP method (POST stays POST), more predictable |
| Middleware for all redirects | next.config.js for static redirects | Next.js best practices (ongoing) | Simpler, faster build-time redirects for static paths |
| Custom CSS media queries | Tailwind breakpoint prefixes | Tailwind CSS adoption (2019+) | Consistent system, better DX, mobile-first by default |
| Disabled nav items for unavailable features | Coming Soon badges/indicators | UX best practices evolution (2020+) | Better discoverability, clearer communication of future features |

**Deprecated/outdated:**
- **301/302 status codes for redirects**: Still work but 307/308 are more precise (preserve HTTP method)
- **separate /who and /what pages**: Being replaced with /my-relationships and /my-info (old URLs redirect)
- **next/head component**: Deprecated in App Router, use Metadata API instead
- **Disabled navigation items without explanation**: Poor UX, use Coming Soon indicators instead

## Open Questions

1. **Should old /who and /what page files be deleted or kept?**
   - What we know: Redirects work regardless of whether old pages exist. Next.js handles at routing level.
   - What's unclear: Whether to keep for temporary backwards compatibility or remove completely
   - Recommendation: Keep initially to verify redirects work correctly, then remove in next phase cleanup. Add code comment explaining redirect relationship.

2. **Should Coming Soon items use disabled MenuItem or separate rendering?**
   - What we know: Headless UI supports disabled prop. Can also render as non-interactive span.
   - What's unclear: Which provides better UX and accessibility
   - Recommendation: Use disabled MenuItem with Coming Soon text for consistency. Disabled items are still keyboard-navigable (good for discovery) but don't activate.

3. **Should section dividers be added to Learn dropdown?**
   - What we know: Dropdown has two logical sections (audience items, offering items)
   - What's unclear: Whether visual separator improves or clutters UX at this stage
   - Recommendation: Start without dividers (simpler). Add if user testing shows confusion between sections. Headless UI supports MenuSection if needed.

4. **What content should go on My Relationships vs My Info pages?**
   - What we know: My Relationships is relationship-focused (couples, families, teams). My Info is self-assessment focused (individual personality).
   - What's unclear: Exact content mapping from old Who/What pages
   - Recommendation: My Relationships gets couples/families/teams content from /who. My Info gets individual assessment content from /what. Reframe around user's context (relationships vs self).

5. **Should desktop layouts use larger than 720px max-width?**
   - What we know: Current design uses max-w-[375px] md:max-w-[720px]. Success criteria says "optimized for tablet (768px) and desktop (1024px+)".
   - What's unclear: Whether desktop should go wider than 720px at lg: breakpoint
   - Recommendation: Keep 720px max-width for content readability (standard for prose). Add lg: variations for font sizes and spacing, not container width.

## Sources

### Primary (HIGH confidence)
- [Next.js Redirects Documentation](https://nextjs.org/docs/app/guides/redirecting) - Official Next.js redirect patterns and configuration
- [next.config.js redirects API Reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) - Redirect configuration syntax and options
- [Headless UI Menu Component](https://headlessui.com/react/menu) - Dropdown implementation (already in use)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Breakpoint system and mobile-first approach
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - SEO metadata configuration

### Secondary (MEDIUM confidence)
- [The Complete Guide to SEO Optimization in Next.js 15](https://medium.com/@thomasaugot/the-complete-guide-to-seo-optimization-in-next-js-15-1bdb118cffd7) - SEO best practices for metadata
- [Next.js SEO Optimization Guide (2026 Edition)](https://www.djamware.com/post/nextjs-seo-optimization-guide-2026-edition) - Current SEO approaches
- [Hidden vs. Disabled In UX — Smashing Magazine](https://www.smashingmagazine.com/2024/05/hidden-vs-disabled-ux/) - UX guidance on disabled vs hidden elements
- [Navigation UX Best Practices](https://www.designstudiouiux.com/blog/navigation-ux-design-patterns-types/) - Navigation structure patterns
- [Next.js Redirects: A Developer's Guide](https://focusreactive.com/next-js-redirects/) - Redirect implementation patterns

### Tertiary (LOW confidence - general guidance)
- [React Badge Components](https://www.shadcn.io/ui/badge) - Badge component patterns (not using library, reference for styling ideas)
- [Navigation UX patterns](https://www.parallelhq.com/blog/how-users-move-through-information-or-navigate-pages-of-website) - General navigation UX principles

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use from Phases 1-2. Next.js redirects are built-in, well-documented feature. Tailwind breakpoints are standard.
- Architecture: HIGH - Patterns verified from official Next.js docs (redirects, metadata), existing codebase (Header.tsx, content pages), and official Headless UI docs (dropdown menus). No novel architecture needed.
- Pitfalls: MEDIUM - Redirect pitfalls from Next.js docs and common experience. Responsive design pitfalls from Tailwind docs. Coming Soon UX from industry best practices.

**Research date:** 2026-02-16
**Valid until:** 2026-05-16 (90 days - stable technology stack, Next.js 15 is current stable version)
