# Stack Research

**Domain:** Informational/marketing website with Next.js 15
**Researched:** 2026-02-11
**Confidence:** HIGH

## Recommended Stack

### Core Technologies (Already Installed)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x | Full-stack React framework with App Router | Built-in font optimization, metadata API for SEO, static generation, and optimal rendering strategies. Industry standard for React applications in 2026. |
| React | 19.x | UI component library | Latest stable version with improved performance, simplified ref handling (no forwardRef needed), and better async support. |
| TypeScript | 5.x | Type safety and developer experience | Prevents bugs, improves IDE support, and provides excellent integration with Next.js metadata and component APIs. |
| Tailwind CSS | v4 | Utility-first CSS framework | Already configured. V4 offers improved performance, native cascade layers, and excellent glassmorphism support via backdrop utilities. |

### Animation Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | 12.34.0+ | UI animations, page transitions, interactive elements | **PRIMARY CHOICE** for this project. Best for declarative React animations, component enter/exit transitions, and interactive UI elements. React 19 compatible as of v12+. Excellent for dropdown animations, card hover effects, and modal transitions. |
| GSAP | 3.x | Complex timeline animations, scroll-triggered effects | **ALTERNATIVE** for professional-grade scroll animations or complex sequences. Higher performance ceiling but larger API surface. Use if timeline-based animations or pixel-perfect control is required. |

**Recommendation for Continua:** Use **framer-motion 12.34.0+** exclusively. The project needs simple component animations (dropdown menus, modal dialogs, card hovers) which are framer-motion's strength. GSAP is overkill for this use case.

### Dropdown & Modal Components

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dropdown-menu | 2.1.16 | Accessible dropdown menus | **REQUIRED** for header navigation dropdowns. Handles keyboard navigation, focus management, collision detection, and ARIA attributes automatically. |
| @radix-ui/react-dialog | 1.1.15 | Accessible modal dialogs | **REQUIRED** for "Book" form dialogs. Provides focus trapping, screen reader support, ESC key handling, and backdrop click management. |

**Why Radix UI:** Unstyled primitives that solve complex accessibility and interaction patterns. You control the visual design with Tailwind (glassmorphism styling) while Radix handles the behavior. React 19 compatible with latest versions.

**What NOT to use:** Pre-styled UI libraries (MUI, Chakra UI, Ant Design) conflict with custom glassmorphism design and add unnecessary bundle size.

### Font Loading

| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| next/font | Built-in (Next.js 15) | Font optimization and loading | **USE THIS** for Inter font loading. Automatically self-hosts Google Fonts, eliminates layout shift, optimizes for performance, and ensures GDPR compliance by avoiding external font requests. |

**Implementation pattern:**
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})
```

### SEO & Metadata

| Feature | Version | Purpose | Why |
|---------|---------|---------|-----|
| Next.js Metadata API | Built-in (Next.js 15) | SEO optimization, meta tags, Open Graph | **USE THIS** for all meta tags. Type-safe, automatically optimized, supports static and dynamic metadata generation. Critical for informational website discoverability. |
| generateStaticParams | Built-in (Next.js 15) | Static site generation | **USE THIS** for static content pages. Pre-renders all routes at build time for maximum performance and SEO. |

**Implementation pattern:**
```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'Continua - Personality Assessment Platform',
  description: 'Transform conflicts into complementarity...',
  openGraph: {
    title: '...',
    description: '...',
    images: ['/og-image.png'],
  },
}
```

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| next/font | Font optimization | Zero configuration, handles Inter automatically |
| TypeScript | Type checking | Already configured, excellent Next.js integration |
| ESLint | Code quality | Built into Next.js 15, run via `npm run lint` |

## Installation

```bash
# Animation
npm install framer-motion@^12.34.0

# UI Components (Radix)
npm install @radix-ui/react-dropdown-menu@^2.1.16
npm install @radix-ui/react-dialog@^1.1.15

# Font loading - already built into Next.js, no install needed
# SEO/Metadata - already built into Next.js, no install needed
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| framer-motion | GSAP | When you need timeline-based animations, scroll-triggered sequences, or maximum performance for hundreds of simultaneous animations. Not needed for this project. |
| framer-motion | CSS transitions only | Only for extremely simple hover states. Not sufficient for dropdown/modal animations. |
| Radix UI | Headless UI | When you're already using Tailwind and want Tailwind team's components. Both are excellent; Radix has more comprehensive component library. |
| Radix UI | React Aria | When you need Adobe's design system integration or more granular control over component composition. More complex API. |
| next/font | Manual Google Fonts | Never. next/font provides automatic optimization, self-hosting, and zero layout shift. |
| Metadata API | react-helmet | Never for Next.js apps. Metadata API is built-in, type-safe, and optimized for SSR/SSG. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-spring | Physics-based animations are unnecessary for UI components; framer-motion provides better DX for declarative animations | framer-motion |
| anime.js | Not React-specific, requires manual DOM manipulation, harder to integrate with React component lifecycle | framer-motion or GSAP |
| framer-motion v11 or earlier | Not compatible with React 19. Will cause peer dependency errors. | framer-motion v12.34.0+ |
| @radix-ui packages below v2.x for dropdown, v1.1.x for dialog | May have React 19 compatibility issues or missing features | Latest versions specified above |
| Manual `<link>` tags for fonts in `_document.js` | Causes layout shift, no optimization, blocks rendering | next/font/google |
| react-helmet or next-seo | Outdated patterns; Next.js Metadata API supersedes these | Next.js Metadata API |
| UI libraries (MUI, Chakra, Ant Design) | Conflict with custom glassmorphism design, large bundle size, style override complexity | Radix UI + Tailwind CSS |

## Stack Patterns by Variant

**For static informational pages (Home, Who, What):**
- Use static `export const metadata` for SEO
- Use `generateStaticParams` if creating pages from data (not needed for this project - all pages are known at build time)
- Render with SSG (Static Site Generation) - Next.js default for pages without dynamic data

**For animated UI elements:**
- Use framer-motion `<motion.div>` components for cards, buttons, dropdowns
- Use `AnimatePresence` for modal enter/exit transitions
- Use `layout` prop for layout animations when dropdowns open

**For dropdown menus:**
- Use `@radix-ui/react-dropdown-menu` for behavior
- Style with Tailwind classes for glassmorphism (bg-white/95, backdrop-blur-lg, etc.)
- Wrap in framer-motion for smooth open/close animations

**For modal dialogs:**
- Use `@radix-ui/react-dialog` for behavior and accessibility
- Style with Tailwind for glassmorphism overlay and content
- Wrap in framer-motion `AnimatePresence` for enter/exit animations

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| framer-motion@12.34.0+ | React@19.x | v12+ required for React 19 support |
| @radix-ui/react-dropdown-menu@2.1.16 | React@19.x | Fully compatible with latest React 19 |
| @radix-ui/react-dialog@1.1.15 | React@19.x | Fully compatible with latest React 19 |
| @radix-ui/react-dropdown-menu@2.1.16 | @radix-ui/react-dialog@1.1.15 | Share internal dependencies; keep versions in sync to avoid conflicts |
| next/font | Next.js@15.x | Built-in, no version conflicts |
| Tailwind CSS v4 | Next.js@15.x | Already configured in project |

**Critical:** When using multiple @radix-ui packages, version mismatches can break dropdown/dialog interactions due to shared internal dependencies (@radix-ui/react-dismissable-layer, @radix-ui/react-focus-scope). Install all Radix packages together and keep them updated together.

## Sources

### Animation Libraries
- [NPM: framer-motion](https://www.npmjs.com/package/framer-motion) - Latest version: 12.34.0
- [Framer Motion upgrade guide for React 19](https://motion.dev/docs/react-upgrade-guide)
- [LogRocket: Comparing React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/)
- [Syncfusion: Top React animation libraries 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)
- [Comparing GSAP vs Framer Motion](https://blog.logrocket.com/best-react-animation-libraries/)

### Dropdown & Modal Components
- [Radix UI Primitives documentation](https://www.radix-ui.com/primitives) - HIGH confidence (official docs)
- [NPM: @radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu) - Version 2.1.16
- [NPM: @radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog) - Version 1.1.15
- [React 19 compatibility for Radix UI](https://github.com/radix-ui/primitives/issues/3295) - Confirmed compatible
- [Builder.io: Best React UI libraries 2026](https://www.builder.io/blog/react-component-libraries-2026)

### Font Loading & Optimization
- [Next.js: Font Optimization documentation](https://nextjs.org/docs/app/getting-started/fonts) - HIGH confidence (official docs)
- [Next.js: Optimizing fonts tutorial](https://nextjs.org/learn/dashboard-app/optimizing-fonts-images) - HIGH confidence (official docs)
- [Contentful: Next.js fonts guide](https://www.contentful.com/blog/next-js-fonts/)

### SEO & Metadata
- [Next.js: generateMetadata documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - HIGH confidence (official docs)
- [Next.js: generateStaticParams documentation](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) - HIGH confidence (official docs)
- [Digital Applied: Next.js 15 SEO guide](https://www.digitalapplied.com/blog/nextjs-seo-guide)
- [Medium: Complete guide to SEO in Next.js 15](https://medium.com/@thomasaugot/the-complete-guide-to-seo-optimization-in-next-js-15-1bdb118cffd7)

### Glassmorphism with Tailwind
- [FlyOnUI: Glassmorphism with Tailwind CSS](https://flyonui.com/blog/glassmorphism-with-tailwind-css/)
- [Epic Web Dev: Creating glassmorphism effects](https://www.epicweb.dev/tips/creating-glassmorphism-effects-with-tailwind-css)

### React 19 Compatibility
- [GitHub: framer-motion React 19 compatibility](https://github.com/motiondivision/motion/issues/2668) - Resolved in v12+
- [GitHub: Radix UI React 19 compatibility](https://github.com/radix-ui/primitives/issues/3295) - Resolved
- [shadcn/ui: Next.js 15 + React 19 guide](https://ui.shadcn.com/docs/react-19)

---
*Stack research for: Continua informational website*
*Researched: 2026-02-11*
*Confidence: HIGH - All versions verified via official documentation and npm registry, React 19 compatibility confirmed*
