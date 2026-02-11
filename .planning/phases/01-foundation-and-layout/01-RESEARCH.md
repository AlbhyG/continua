# Phase 1: Foundation & Layout - Research

**Researched:** 2026-02-11
**Domain:** Next.js 15 App Router + Tailwind CSS v4 Foundation
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for a Next.js 15 informational site with Tailwind CSS v4, including gradient background, fixed header, Inter font loading, and home route. The primary technical challenges are: (1) Tailwind CSS v4's CSS-based configuration requiring all theme setup in the main CSS file, (2) ensuring glassmorphism contrast meets WCAG 2.1 AA requirements, and (3) managing client/server component boundaries correctly from the start.

The stack is already initialized (Next.js 15, React 19, TypeScript 5, Tailwind CSS v4 installed), so implementation focuses on configuration, font optimization via `next/font/google`, and establishing the layout patterns that subsequent phases will build upon.

**Primary recommendation:** Use `next/font/google` for Inter font loading (eliminates layout shift), configure all Tailwind theme tokens via `@theme` directive in `app/globals.css`, test contrast ratios at worst-case gradient position (pink at 100%), and establish server-first component pattern with client boundaries only for header interactivity.

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | React framework with App Router | Built-in font optimization, metadata API, static generation, streaming. Industry standard for React apps in 2026. |
| React | 19.x | UI library | Latest stable with Server Components as default, improved async support, no forwardRef needed. |
| TypeScript | 5.x | Type safety | Prevents runtime bugs, excellent Next.js integration for typed routes and metadata. |
| Tailwind CSS | v4 | Utility-first CSS | CSS-based config via `@theme`, native cascade layers, excellent backdrop-filter support for glassmorphism. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font/google | Built-in | Font optimization | **REQUIRED** for Inter font. Self-hosts fonts at build time, eliminates FOUT/FOIT, zero layout shift. |
| PostCSS | Latest | CSS processing | **REQUIRED** for Tailwind v4. Use `@tailwindcss/postcss` plugin. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind CSS v4 | Tailwind CSS v3.4 | V3 uses JS config, more stable ecosystem but misses v4 performance gains and native CSS features. Only use if browser support policy requires Safari <16.4. |
| next/font | Manual Google Fonts `<link>` | Never acceptable. Causes waterfall loading, layout shift, external requests. |
| Server Components | Client Components everywhere | Loses SSG benefits, larger bundle, slower initial load. Never acceptable for static content. |

**Installation:**

Already installed. Verify versions:
```bash
npm list next react react-dom typescript tailwindcss
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Server Component)
│   │                             # - Inter font loading
│   │                             # - Tailwind globals.css import
│   │                             # - Fixed Header component
│   ├── page.tsx                  # Home page route (Server Component)
│   └── globals.css               # Tailwind v4 with @theme directive
│
├── components/                   # Shared components
│   └── layout/
│       └── Header.tsx            # Fixed header (Client Component)
│
└── public/
    └── logo.png                  # Logo asset (already exists)
```

**Phase 1 only creates:** `app/layout.tsx`, `app/page.tsx` (update existing), `app/globals.css` (update existing), `components/layout/Header.tsx`.

### Pattern 1: Tailwind CSS v4 Configuration

**What:** All theme configuration lives in `app/globals.css` using the `@theme` directive. Custom color tokens use `--color-*` namespace and automatically generate corresponding utility classes.

**When to use:** This is mandatory for Tailwind v4. The `@theme` directive only works in the main CSS entry point processed by Tailwind.

**Example:**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Custom color tokens from style guide */
  --color-foreground: rgb(7, 7, 8);
  --color-accent: rgba(67, 117, 237, 0.92);
  --color-accent-light: rgba(169, 137, 236, 0.92);
  --color-border: rgba(255, 255, 255, 0.3);
  --color-card: rgba(255, 255, 255, 0.77);
}

/* Global styles */
body {
  /* Fixed gradient background */
  background: linear-gradient(
    180deg,
    rgba(67, 117, 237, 0.92) 0%,
    rgba(169, 137, 236, 0.92) 35.14%,
    rgb(229, 158, 221) 100%
  );
  background-attachment: fixed;
  min-height: 100vh;
}

/* Ensure text spacing pattern from style guide */
p + p {
  margin-top: 20px;
}

/* Fixed header scroll padding to prevent anchor coverage */
html {
  scroll-padding-top: 80px;
}
```

**Generated utilities:** `bg-foreground`, `text-accent`, `border-border`, `bg-card`, etc. Reference in components via className.

### Pattern 2: Inter Font Loading with next/font

**What:** Import Inter from `next/font/google`, configure with latin subset and weights 400/700, apply to `<html>` element via className.

**When to use:** Always for web fonts in Next.js. Automatic optimization, self-hosting, layout shift prevention.

**Example:**

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

**What happens:** Next.js downloads Inter at build time, hosts as static assets, generates optimized `@font-face` with size-adjust for fallback matching. Zero layout shift, no external requests, instant font loading.

### Pattern 3: Server Component by Default, Client When Needed

**What:** All components are Server Components unless marked with `'use client'` directive. Only the fixed header needs client-side interactivity in Phase 1.

**When to use:** Default pattern for all Next.js 15 apps. Push client boundaries as deep as possible.

**Example:**

```typescript
// app/page.tsx - Server Component (default)
export default function HomePage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20">
      <h1 className="text-[48px] md:text-[64px] font-bold">
        How can we improve the human condition...
      </h1>
      {/* Static content */}
    </main>
  )
}

// components/layout/Header.tsx - Client Component (needs state)
'use client'

export default function Header() {
  // State for dropdowns in later phases
  return (
    <header className="fixed top-0 w-full bg-accent backdrop-blur z-50">
      <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
        <img src="/logo.png" alt="Continua" width={72} height={48} />
        {/* Navigation pills - Phase 2 */}
      </div>
    </header>
  )
}
```

**Why:** Server Components render to HTML at build time (static generation), zero client JavaScript for static content, better SEO, faster initial load. Client boundary only where interactivity is needed.

### Pattern 4: Fixed Header with Backdrop Blur

**What:** Header uses `position: fixed`, `backdrop-blur`, and semi-transparent background for glassmorphism effect. Content area has top padding to clear the header.

**When to use:** For persistent navigation across all pages.

**Example:**

```typescript
// components/layout/Header.tsx
'use client'

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-accent backdrop-blur">
      <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Content */}
      </div>
    </header>
  )
}

// app/page.tsx
export default function HomePage() {
  return (
    <main className="pt-20"> {/* 80px header height = py-3 + content + margin */}
      {/* Page content */}
    </main>
  )
}
```

**Considerations:** `backdrop-blur` is GPU-intensive on mobile (addressed in Phase 3 with responsive optimizations). Safari requires `-webkit-backdrop-filter` prefix (Tailwind handles this automatically).

### Anti-Patterns to Avoid

- **Using `tailwind.config.js` for configuration:** Tailwind v4 uses CSS-based config. Delete `tailwind.config.js` if it exists. All theme tokens go in `@theme` directive in main CSS.

- **Splitting `@theme` across multiple CSS files:** The `@theme` directive only works in the entry CSS file that Tailwind processes directly. Don't use `@import` to split theme configuration.

- **Adding `'use client'` to root layout or pages:** Converts everything to client-side, loses static generation benefits. Only mark components that need interactivity (header in Phase 1).

- **Using Google Fonts `<link>` or `@import`:** Causes waterfall loading and layout shift. Always use `next/font/google`.

- **Forgetting `background-attachment: fixed` for gradient:** Without this, gradient scrolls with content instead of staying stationary as specified in style guide.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading optimization | Custom font loader, manual `@font-face` declarations | `next/font/google` | Handles self-hosting, subsetting, size-adjust for fallback matching, preloading. Complex to replicate correctly. |
| CSS variable theme system | Manual CSS variables with utility class generation | Tailwind v4 `@theme` directive | Automatically generates utility classes from theme variables, handles responsive variants, maintains consistency. |
| Layout shift prevention | Manual font metrics calculation | `next/font` with `display: 'swap'` | Calculates optimal size-adjust values automatically, ensures fallback font matches final font dimensions. |
| Static site generation | Manual HTML generation, custom build scripts | Next.js App Router static rendering | Handles incremental builds, automatic code splitting, optimized output, metadata generation. |

**Key insight:** Next.js 15 and Tailwind v4 have mature solutions for font optimization and theme configuration. Custom implementations miss edge cases (font subsetting, size-adjust calculation, responsive variants) and create maintenance burden.

## Common Pitfalls

### Pitfall 1: Glassmorphism Accessibility Failures

**What goes wrong:** Semi-transparent card backgrounds (`rgba(255, 255, 255, 0.77)`) fail WCAG 2.1 AA contrast requirements (4.5:1 for body text). Text readability varies as background gradient shifts beneath the transparent layer. Users with low vision cannot read content reliably.

**Why it happens:** Designers prioritize aesthetics over accessibility. Testing only occurs at optimal gradient positions (blue top) not worst-case (pink bottom). Browser tools don't account for gradient backgrounds in contrast calculations.

**How to avoid:**
- Test all text contrast against the **darkest** gradient stop: pink `rgb(229, 158, 221)` at 100%
- Use WebAIM Contrast Checker to verify text color `rgb(7, 7, 8)` on simulated background
- For critical content (navigation, CTAs), use solid white `#ffffff` instead of transparent backgrounds
- Add semi-opaque overlays behind text blocks if needed to guarantee minimum contrast
- Run automated accessibility checks with axe-core or Lighthouse in CI

**Warning signs:**
- Text that looks fine at page top (blue gradient) but hard to read at bottom (pink gradient)
- Lighthouse accessibility score below 90
- Text disappears when users adjust screen brightness

**Verification:** Use WebAIM Contrast Checker with foreground `rgb(7, 7, 8)` and background `rgb(229, 158, 221)`. Must achieve 4.5:1 or higher for normal text, 3:1 for large text (24px+). If failing, increase background opacity or add semi-opaque layer.

### Pitfall 2: Tailwind CSS v4 Configuration Confusion

**What goes wrong:** Developers try to configure Tailwind using `tailwind.config.js` (v3 approach) or put `@theme` directives in imported CSS files. Configuration silently fails. Custom colors don't apply. IDE shows "Unknown at rule @theme" errors.

**Why it happens:** Tailwind v4 fundamentally changed from JavaScript to CSS-based configuration. The `@theme` directive only works in the main entry CSS file. Most tutorials still show v3 patterns. IDE support is incomplete.

**How to avoid:**
- Put **all** `@theme` configuration in `app/globals.css` (the main CSS file imported in root layout)
- Don't use `@import` to split theme configuration across multiple files
- Delete `tailwind.config.js` if it exists from scaffolding
- Configure VS Code to recognize Tailwind directives: add `"*.css": "tailwindcss"` to CSS language associations
- Use `:root` CSS variables for values that don't need utility classes
- Reference official Tailwind v4 docs, not v3 docs or old blog posts

**Warning signs:**
- Custom colors defined in `@theme` not working
- IDE showing red squiggles under `@theme`
- Configuration working locally but failing in CI/build
- Utilities not generating for custom theme values

**Verification:** After adding custom colors to `@theme`, run dev server and verify utilities work: `className="bg-accent"` should apply the blue accent color. Check browser DevTools to see generated CSS variables.

### Pitfall 3: Inter Font Loading Performance Issues

**What goes wrong:** Loading Inter from Google Fonts via `@font-face` pointing to `fonts.gstatic.com` creates waterfall: HTML loads → CSS loads → font URLs discovered → fonts download. Users see invisible text (FOIT) or fallback fonts that shift layout (FOUT). Core Web Vitals suffer, particularly CLS.

**Why it happens:** Developers use familiar Google Fonts approach without understanding `next/font/google` optimization. Font subsetting isn't applied, so users download entire font family including unused glyphs.

**How to avoid:**
- Use `next/font/google` to import Inter: `import { Inter } from 'next/font/google'`
- This automatically: downloads fonts at build time, self-hosts them (no external requests), generates optimal `@font-face` declarations, subsets to needed characters
- Apply `display: 'swap'` to ensure text is visible during loading
- Use variable fonts (Inter is available as variable font) for better performance
- Specify only needed weights (400, 700) to reduce file size
- Specify subset: `subsets: ['latin']` for Latin-only text

**Warning signs:**
- Flash of invisible text (FOIT) on page load
- Flash of unstyled text (FOUT) with layout shift
- Poor CLS scores in Lighthouse (<0.1 target)
- Fonts loading slowly on throttled connections
- Multiple font requests in Network tab instead of self-hosted fonts

**Verification:** Run Lighthouse audit. CLS should be <0.1. Check Network tab: fonts should load from same domain as HTML, not fonts.gstatic.com. No layout shift should occur when fonts load.

### Pitfall 4: Client/Server Component Boundary Violations

**What goes wrong:** Developers add `'use client'` at the top of page components to fix a single interactivity issue, converting entire page and all imports into client components. Eliminates performance benefits, increases bundle size, breaks static generation.

**Why it happens:** The distinction between server and client rendering is conceptually confusing. Developers see error about `window` or `useState` and reflexively add `'use client'` to nearest file without understanding boundary implications.

**How to avoid:**
- Follow "server by default" principle - all components are Server Components unless explicitly marked
- Push `'use client'` as deep in component tree as possible (e.g., only mark interactive button, not entire page)
- In Phase 1, only the Header needs `'use client'` (for dropdown state in later phases)
- Home page content is entirely static - keep as Server Component
- Document which components are client vs server

**Warning signs:**
- JavaScript bundle size grows unexpectedly large
- Build warnings about "use client" in unexpected places
- Static generation stops working
- TypeScript type inference breaking across boundaries

**Verification:** Run `npm run build` and check `.next/static/chunks` size. For Phase 1 (minimal client JS), bundle should be <50KB. Check build output for static generation (○ symbol) vs dynamic rendering.

### Pitfall 5: Fixed Gradient Background Performance on Mobile

**What goes wrong:** The fixed gradient (`background-attachment: fixed`) causes scroll jank on mobile devices, particularly iOS Safari. Browser must recalculate background position for every frame during scrolling.

**Why it happens:** iOS Safari has known issues with `background-attachment: fixed` for performance reasons. Low-end Android devices also struggle with fixed backgrounds during scroll.

**How to avoid:**
- Test scroll performance on mid-range Android devices and iOS Safari (not just desktop Chrome)
- Consider using static gradient (remove `background-attachment: fixed`) on mobile via media query
- Alternative: Create gradient as absolutely positioned element instead of background property
- Profile with Chrome DevTools Performance tab looking for paint operations during scroll
- Monitor Core Web Vitals, particularly INP (Interaction to Next Paint)

**Warning signs:**
- Scrolling feels janky or stuttery on mobile
- Frame rate drops below 30fps during scroll
- High paint times in DevTools performance profile
- Mobile users reporting sluggishness while desktop users report no issues

**Verification:** Test on real mobile devices. Scroll should be smooth (50+ fps). If issues occur, implement fallback for mobile using `@media (hover: none)` to detect touch devices.

### Pitfall 6: Missing Metadata Configuration

**What goes wrong:** Pages use default Next.js metadata ("Create Next App"). Missing unique title and description tags. Search engines index generic content. Social media shares show no preview.

**Why it happens:** Developers focus on visual implementation and skip metadata setup. Next.js doesn't enforce metadata requirements.

**How to avoid:**
- Export `metadata` object from `app/layout.tsx` with unique title and description
- Set `metadataBase` for absolute URLs: `metadataBase: new URL('https://continua.com')`
- Add metadata to every page route as pages are created
- Include OpenGraph metadata for social sharing
- Validate with social media preview tools (Twitter Card Validator, Facebook Sharing Debugger)

**Warning signs:**
- Browser tab shows "Create Next App"
- Social media shares show generic or no preview
- Search results display wrong or missing descriptions

**Verification:** View page source and check `<head>` contains unique `<title>` and `<meta name="description">`. Share URL on social media to verify preview appears correctly.

## Code Examples

Verified patterns from official sources:

### Inter Font Loading Pattern

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import './globals.css'

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-inter', // Optional: expose as CSS variable
})

// Configure metadata
export const metadata: Metadata = {
  title: 'Continua - Personality Assessment Platform',
  description: 'Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
```

Source: [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

### Tailwind CSS v4 Configuration Pattern

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Style guide color tokens */
  --color-foreground: rgb(7, 7, 8);
  --color-accent: rgba(67, 117, 237, 0.92);
  --color-accent-light: rgba(169, 137, 236, 0.92);
  --color-border: rgba(255, 255, 255, 0.3);
  --color-card: rgba(255, 255, 255, 0.77);

  /* Max width constraints from style guide */
  --breakpoint-md: 768px;
}

/* Global styles */
body {
  font-family: var(--font-inter), sans-serif;
  font-size: 16px;
  line-height: 1.6em;
  letter-spacing: -0.02em;
  font-weight: 400;
  color: var(--color-foreground);

  /* Fixed gradient background */
  background: linear-gradient(
    180deg,
    rgba(67, 117, 237, 0.92) 0%,
    rgba(169, 137, 236, 0.92) 35.14%,
    rgb(229, 158, 221) 100%
  );
  background-attachment: fixed;
  min-height: 100vh;
}

/* Paragraph spacing pattern */
p + p {
  margin-top: 20px;
}

/* Fixed header scroll padding */
html {
  scroll-padding-top: 80px;
}
```

Source: [Tailwind CSS v4 Theme Configuration](https://tailwindcss.com/docs/theme)

### Fixed Header Component Pattern

```typescript
// components/layout/Header.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-accent backdrop-blur">
      <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo with home link */}
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Continua"
            width={72}
            height={48}
            priority // Preload logo for LCP
          />
        </Link>

        {/* Navigation pills - Phase 2 */}
        <nav className="flex items-center gap-2">
          {/* Placeholder for dropdown menus */}
          <div className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white">
            Who
          </div>
          <div className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white">
            What
          </div>
          <div className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white">
            Sign In
          </div>
        </nav>
      </div>
    </header>
  )
}
```

Source: [Next.js App Router Documentation](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)

### Home Page Component Pattern

```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      {/* Main heading */}
      <h1 className="text-[48px] md:text-[64px] leading-[1.2] font-bold mb-6">
        How can we improve the human condition one person, one couple, one family, and one office at a time?
      </h1>

      {/* Body content */}
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind config in `tailwind.config.js` | CSS-based config with `@theme` directive | Tailwind v4 (Jan 2025) | Better performance, native cascade layers, eliminates JS config file |
| Google Fonts via `<link>` tag | `next/font/google` module | Next.js 13+ (Oct 2022) | Self-hosted fonts, zero layout shift, optimized loading |
| All components as Client Components | Server Components by default, Client when needed | Next.js 13 App Router (Oct 2022), stable in 15 | Smaller bundles, better SEO, faster initial load |
| fetch() cached by default | fetch() uncached by default | Next.js 15 (Oct 2024) | More predictable caching, opt-in for static content |

**Deprecated/outdated:**
- **Tailwind v3 JavaScript config:** No longer the primary approach. V4 uses CSS-based configuration for better performance and native cascade layers.
- **`next/legacy/image`:** Use `next/image` component for automatic optimization.
- **`next-seo` library:** Superseded by Next.js built-in Metadata API.
- **Manual `@font-face` for Google Fonts:** Use `next/font/google` for automatic optimization.

## Open Questions

1. **Contrast ratio validation tooling**
   - What we know: WebAIM Contrast Checker validates static color combinations. WCAG requires 4.5:1 for normal text.
   - What's unclear: How to test contrast with gradient backgrounds that shift beneath transparent layers.
   - Recommendation: Test against worst-case gradient position (pink at 100%). Consider automated testing with axe-core or pa11y in CI. If contrast fails, increase card opacity from 0.77 to 0.85 or add semi-opaque text background.

2. **Mobile gradient performance threshold**
   - What we know: `background-attachment: fixed` causes scroll jank on iOS Safari and low-end Android.
   - What's unclear: Exact device/browser combinations where performance becomes unacceptable.
   - Recommendation: Test on mid-range Android (Samsung Galaxy A series) and older iPhones (iPhone 11). If scroll FPS drops below 50, use static gradient on mobile via `@media (hover: none)` query.

3. **Browser support requirements**
   - What we know: Tailwind v4 requires Safari 16.4+, Chrome 111+, Firefox 128+. `backdrop-filter` requires Safari 18+, Chrome 76+.
   - What's unclear: Whether this aligns with target audience browser usage.
   - Recommendation: Document minimum browser versions in README. If broader support needed, consider Tailwind v3 or add fallbacks for older browsers.

## Sources

### Primary (HIGH confidence)

- [Next.js: Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - Official documentation for next/font
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Official App Router patterns
- [Tailwind CSS: Theme Configuration](https://tailwindcss.com/docs/theme) - Official v4 @theme directive docs
- [Tailwind CSS: Install with Next.js](https://tailwindcss.com/docs/guides/nextjs) - Official integration guide
- [WCAG 2.1: Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - Official accessibility guidelines
- [WebAIM: Contrast Checker](https://webaim.org/resources/contrastchecker/) - Standard contrast testing tool

### Secondary (MEDIUM confidence)

- [Next.js 15 Upgrade Guide](https://prateeksha.com/blog/nextjs-15-upgrade-guide-app-router-caching-migration) - Caching changes
- [Tailwind CSS v4 Migration Guide](https://www.codewithseb.com/blog/tailwind-css-4-whats-new-migration-guide) - v3 to v4 migration
- [Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/) - Accessibility considerations
- [Next-level frosted glass with backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) - CSS backdrop-filter deep dive
- [Troubleshooting background-attachment: fixed Bug in iOS Safari](https://juand89.hashnode.dev/troubleshooting-background-attachment-fixed-bug-in-ios-safari) - Mobile performance issues

### Tertiary (LOW confidence)

- Community blog posts and Medium articles - Useful for discovering issues but require verification against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via official npm registry and documentation
- Architecture patterns: HIGH - Based on official Next.js App Router documentation and established best practices
- Tailwind v4 configuration: HIGH - Verified through official Tailwind CSS v4 documentation
- Font loading: HIGH - Verified through official Next.js documentation and testing
- Glassmorphism accessibility: MEDIUM - Based on accessibility research but requires project-specific testing
- Mobile gradient performance: MEDIUM - Known iOS Safari issue but requires device-specific testing
- Pitfalls: HIGH - Verified through official issue trackers, migration guides, and established documentation

**Research date:** 2026-02-11
**Valid until:** March 2026 (30 days for stable technologies)
**Technologies:** Next.js 15, React 19, TypeScript 5, Tailwind CSS v4

**Prior Research Referenced:**
- `.planning/research/STACK.md` - Animation library recommendations (not needed for Phase 1)
- `.planning/research/ARCHITECTURE.md` - Project structure and component patterns
- `.planning/research/PITFALLS.md` - Comprehensive pitfalls covering all phases

---

*Research complete for Phase 1: Foundation & Layout. Ready for planning.*
