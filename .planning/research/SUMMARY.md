# Project Research Summary

**Project:** Continua - Informational/Marketing Website
**Domain:** Static informational website for SaaS personality assessment platform
**Researched:** 2026-02-11
**Confidence:** HIGH

## Executive Summary

Continua is a multi-page informational website built on Next.js 15 App Router with a distinctive glassmorphism design system. Based on research, the optimal approach is to leverage Next.js 15's server-first architecture (Server Components by default), combine Tailwind CSS v4 for styling with Radix UI for accessible interactive components, and use Framer Motion for animations. The site should be fully static-generated for maximum performance and SEO, with client-side interactivity limited to navigation dropdowns and modal dialogs.

The recommended stack is highly standardized: Next.js 15 with React 19, TypeScript, Tailwind CSS v4 (already configured), Radix UI for dropdowns and dialogs, and Framer Motion 12.34.0+ for animations. This combination provides battle-tested patterns for static site generation, excellent performance characteristics, and strong accessibility foundations. The architecture follows Next.js App Router conventions with a server-first approach, keeping most content as Server Components while strategically using Client Components only for interactive UI elements.

The primary risk is accessibility failures from the glassmorphism design — transparency reduces contrast ratios, potentially violating WCAG 2.1 Level AA requirements (mandatory for government compliance by April 2026). Mitigation requires proactive contrast testing, semi-opaque background overlays on text, and potentially solid backgrounds for critical content. Secondary risks include backdrop-blur performance issues on mobile devices and confusion around Next.js 15's server/client component boundaries. Early adoption of accessibility testing, mobile performance profiling, and clear architectural patterns will prevent these from becoming blockers.

## Key Findings

### Recommended Stack

The research identified a mature, well-documented stack with strong React 19 compatibility. Next.js 15 provides built-in font optimization (`next/font`) and a type-safe Metadata API for SEO, eliminating the need for external libraries. Tailwind CSS v4 is already configured and provides native cascade layers and excellent glassmorphism support via backdrop utilities. For interactive components, Radix UI solves complex accessibility patterns (keyboard navigation, focus management, ARIA attributes) while allowing full visual control. Framer Motion 12.34.0+ provides React 19-compatible declarative animations ideal for dropdown, modal, and card interactions.

**Core technologies:**
- **Next.js 15 + React 19 + TypeScript:** Full-stack framework with App Router, built-in optimization, and type safety
- **Tailwind CSS v4:** Already configured, provides glassmorphism utilities and performance optimizations
- **Radix UI (dropdown-menu@2.1.16, dialog@1.1.15):** Accessible primitives for navigation dropdowns and modal forms
- **Framer Motion 12.34.0+:** Declarative animations for component transitions and interactive elements
- **next/font/google:** Built-in Inter font loading with automatic self-hosting and optimization

**Critical version requirements:**
- Framer Motion v12+ required for React 19 compatibility (v11 and earlier will break)
- Radix UI latest versions required for React 19 support
- Tailwind CSS v4 requires Safari 16.4+, Chrome 111+, Firefox 128+ (document browser support policy)

### Expected Features

Research reveals clear feature priorities based on 2026 web standards and SaaS marketing best practices. The MVP should focus on table stakes (mobile navigation, fast load times, WCAG 2.1 AA compliance, clear value proposition, lead capture) and core brand differentiation (glassmorphism design, gradient backgrounds). Advanced features like micro-animations, interactive product demos, and AI Engine Optimization (AEO) should be deferred to post-launch iterations once core functionality is validated.

**Must have (table stakes):**
- Mobile-responsive navigation with sticky header (80%+ of B2B research happens on mobile)
- WCAG 2.1 Level AA compliance (legal requirement, government deadline April 2026)
- Fast page load with Core Web Vitals optimization (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- Clear value proposition and primary CTA above fold (users decide in 3-5 seconds)
- Contact/lead capture mechanism (visual-only dialog forms as specified)
- Basic SEO: semantic HTML, unique meta tags per page, Open Graph images
- Footer with privacy policy and site structure (legal requirement)

**Should have (competitive differentiation):**
- Glassmorphism design system with tested contrast ratios (brand differentiator, accessibility-validated)
- Gradient backgrounds with depth (premium feel appropriate for personality insights)
- Progressive disclosure in navigation (reduces cognitive load, highlights user journey)
- About/Who and What content pages (establishes credibility and explains offering)

**Defer (v2+):**
- Micro-animations on scroll (add polish once performance budget allows)
- Interactive product preview/demo (requires assessment product to be built)
- Pillar-cluster content model for SEO authority (content marketing expansion)
- Dark mode support (UX enhancement, requires design system expansion)
- Exit-intent popup for lead capture optimization
- Blog or resources section (long-tail SEO)

**Anti-features (deliberately avoid):**
- Auto-playing video backgrounds (kills performance, high bounce rates)
- Complex mega menu with images (overwhelming, slow)
- Entry popups (< 2% conversion vs 22% for click-triggered)
- Multi-page "Book" flow (50% abandonment per field)
- Parallax scrolling everywhere (accessibility issues, performance hit)
- Live chat widget (no support team, creates false expectations)

### Architecture Approach

The architecture follows Next.js 15 App Router patterns with a server-first philosophy. All components are Server Components by default, with Client Components explicitly marked with `"use client"` and pushed as deep in the component tree as possible. The root layout wraps all pages with a fixed header that persists across navigation (Next.js partial rendering), while page content swaps as Server Components for optimal SEO and performance. Interactive UI elements (dropdowns, modals) are isolated Client Components using composition patterns to minimize JavaScript bundle size.

**Major components:**
1. **Root Layout (Server Component)** — Handles HTML structure, Inter font loading, gradient background, and wraps all pages. Renders Header as child Client Component via composition.
2. **Header (Client Component)** — Fixed navigation with logo and dropdown menus. Manages dropdown state (open/close) and persists across page navigation due to layout mounting behavior.
3. **Dropdown Components (Client Components)** — Use Radix UI primitives for accessibility, styled with Tailwind glassmorphism. Handle keyboard navigation, focus management, click-outside-to-close.
4. **Page Components (Server Components)** — Static content for Home, Who, What, and Book routes. Pre-rendered at build time for maximum performance and SEO.
5. **Dialog/Modal Components (Client Components)** — Use Radix UI Dialog for accessibility, URL-synced state via search params for shareability, render Publisher/Agent/Therapist forms.

**Key patterns identified:**
- **Server by default, client when needed:** Minimizes JavaScript bundle, improves SEO, accelerates initial load
- **Composition pattern:** Pass Server Components as children to Client Components to maintain rendering benefits
- **Shared layout with state preservation:** Header doesn't re-render on navigation, dropdown state persists
- **Headless UI pattern:** Radix UI handles complex behavior while Tailwind controls visual styling
- **URL-synced modals:** Dialog state in search params enables shareable deep links and natural back-button behavior

### Critical Pitfalls

The research identified 16 pitfalls with clear severity ratings. The most critical are glassmorphism accessibility failures, server/client boundary violations, and backdrop-blur mobile performance collapse — all potentially project-threatening if not addressed early.

1. **Glassmorphism Accessibility Failures** — Semi-transparent cards fail WCAG 2.1 contrast requirements (4.5:1). Text readability varies as background shifts beneath transparent layers. Mitigation: Test all text against darkest gradient color (pink), add semi-opaque overlays, use solid backgrounds for critical content, run automated accessibility checks in CI. Address in Phase 1 (Foundation).

2. **Client/Server Component Boundary Violations** — Developers add `"use client"` too high in the tree, converting entire pages to client-side and eliminating Next.js performance benefits. Mitigation: Follow "server by default" principle, push `"use client"` deep in component tree, use composition pattern, document boundaries clearly. Address in Phase 1 (Foundation) and Phase 2 (Core Components).

3. **Backdrop-Blur Performance Collapse on Mobile** — Multiple `backdrop-blur` effects cause janky scrolling, dropped frames, and battery drain on mid-range Android devices. Mitigation: Reduce blur radius on mobile (blur(3-5px) vs blur(12px)), limit to 2-3 simultaneous effects, respect `prefers-reduced-transparency`, profile on real Android devices. Address in Phase 2 (Core Components) and Phase 3 (Responsive).

4. **Tailwind CSS v4 Configuration Confusion** — `@theme` directive only works in main CSS file (`app/globals.css`), not in imported files. Developers try v3 patterns (`tailwind.config.js`) which silently fail. Mitigation: Consolidate all `@theme` in `globals.css`, don't use `@import` for theme config, delete `tailwind.config.js` if present. Address in Phase 1 (Foundation).

5. **Next.js 15 Caching Behavior Surprises** — Changed defaults from Next.js 14 cause unexpected caching. Static pages may not be cached, or dynamic pages cached incorrectly. Mitigation: Explicitly declare `export const dynamic = 'force-static'` for static pages, test in production builds, add cache validation to CI. Address in Phase 1 (Foundation).

6. **Inter Font Loading Performance Issues** — Using Google Fonts directly causes waterfall loading, FOIT/FOUT, and layout shift. Mitigation: Use `next/font/google` for automatic self-hosting, optimization, and subsetting. Specify `display: 'swap'` and only needed weights (400, 700). Address in Phase 1 (Foundation).

7. **Dropdown and Modal Accessibility Violations** — Custom dropdowns lack ARIA attributes, keyboard navigation, and focus management. Mitigation: Use Radix UI primitives which handle accessibility automatically, or follow WAI-ARIA Menu Button and Dialog patterns explicitly. Test with keyboard and screen reader. Address in Phase 2 (Core Components).

8. **Fixed Header Anchor Link Coverage** — Fixed header covers anchor link targets when users navigate to sections. Mitigation: Add `scroll-padding-top: 80px` to HTML element. Test all internal anchor links. Address in Phase 2 (Core Components).

## Implications for Roadmap

Based on research, the roadmap should follow a clear dependency chain: Foundation → Core Components → Content Pages → Polish. The architecture research identified that Root Layout blocks all other work, while Header blocks navigation implementation. The pitfall research shows that accessibility, performance testing, and configuration patterns must be established early to avoid costly rework.

### Phase 1: Foundation & Design System
**Rationale:** Establishes the architectural foundation and prevents critical pitfalls. Root layout, font loading, Tailwind configuration, and static generation patterns block all subsequent work. Addressing glassmorphism accessibility and Tailwind v4 configuration early prevents systemic issues.

**Delivers:**
- Root layout with Inter font via `next/font/google`
- Tailwind CSS v4 configuration with `@theme` in `globals.css`
- Gradient background styling
- Static generation patterns (`export const dynamic = 'force-static'`)
- Accessibility testing setup (axe-core, contrast checkers)
- Basic page structure (Home page skeleton)

**Addresses features:**
- Fast page load foundation (Core Web Vitals)
- Gradient backgrounds (differentiator)
- Basic SEO setup (semantic HTML)

**Avoids pitfalls:**
- Pitfall 4: Tailwind v4 configuration confusion
- Pitfall 5: Next.js 15 caching behavior
- Pitfall 6: Inter font loading issues
- Pitfall 13: TypeScript errors in development

**Stack elements:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, next/font/google

### Phase 2: Interactive Navigation Components
**Rationale:** Header and navigation components have complex dependencies (accessibility, performance, state management) that need careful implementation. Using Radix UI from the start prevents accessibility rework. Building glassmorphism components here allows for early mobile performance testing.

**Delivers:**
- Logo component
- Fixed Header component (Client Component with glassmorphism)
- Dropdown navigation using Radix UI (`@radix-ui/react-dropdown-menu`)
- Click-outside-to-close behavior
- Mobile-responsive navigation (hamburger vs full navigation)
- Sticky header with scroll behavior
- Anchor link scroll padding fix

**Addresses features:**
- Mobile-responsive navigation (table stakes)
- Sticky header (table stakes)
- Progressive disclosure navigation (differentiator)
- Glassmorphism on header (differentiator)

**Avoids pitfalls:**
- Pitfall 1: Glassmorphism accessibility (test contrast on header)
- Pitfall 2: Client/server boundaries (Header is Client, Logo is Server)
- Pitfall 3: Backdrop-blur mobile performance (test header blur on Android)
- Pitfall 8: Dropdown accessibility (Radix UI handles this)
- Pitfall 9: Fixed header anchor coverage (scroll-padding-top)

**Stack elements:** Radix UI dropdown-menu, Framer Motion (optional for animations)

**Architecture components:** Header, Dropdown, Logo

### Phase 3: Static Content Pages
**Rationale:** With navigation working, content pages can be built as simple Server Components. These pages are independent (can be built in parallel) and establish SEO patterns. Requires navigation to be functional for testing, but has no other blockers.

**Delivers:**
- Home page with value proposition, CTA, social proof
- Who page with Individuals/Couples/Publishers/Agents/Therapists sections
- What page with product explanation
- Book page with audience selection
- Unique metadata per page (Next.js Metadata API)
- Open Graph images
- Privacy policy page
- Footer with site structure and legal links

**Addresses features:**
- Clear value prop above fold (table stakes)
- Primary CTA above fold (table stakes)
- About/Who and What pages (table stakes)
- Social proof (table stakes)
- Footer with privacy policy (table stakes)
- Basic SEO with meta tags (table stakes)

**Avoids pitfalls:**
- Pitfall 1: Glassmorphism contrast on content cards (test text readability)
- Pitfall 10: Missing/incorrect SEO metadata (unique per page)

**Stack elements:** Next.js Metadata API, generateStaticParams

**Architecture components:** Page components (Server Components)

### Phase 4: Dialog Forms & Lead Capture
**Rationale:** Depends on navigation (dropdown triggers) and pages (Book page). Modals are architecturally isolated, so this phase can focus entirely on form UI and accessibility without impacting other work.

**Delivers:**
- Dialog component using Radix UI (`@radix-ui/react-dialog`)
- URL-synced modal state (search params)
- Publisher/Agent/Therapist form components (visual-only, no API)
- Modal enter/exit animations (Framer Motion with AnimatePresence)
- Form accessibility (focus trapping, ESC to close, return focus)
- Mobile-optimized modal layouts

**Addresses features:**
- Contact/lead capture mechanism (table stakes)
- Glassmorphism on modals (differentiator)

**Avoids pitfalls:**
- Pitfall 1: Glassmorphism contrast in modals
- Pitfall 3: Backdrop-blur performance (modals have blur)
- Pitfall 8: Modal accessibility (Radix UI handles this)

**Stack elements:** Radix UI dialog, Framer Motion

**Architecture components:** Dialog, Form components

### Phase 5: Performance Optimization & Polish
**Rationale:** With all features built, this phase focuses on optimization, testing across devices, and adding polish. Addresses remaining performance and accessibility concerns identified in research.

**Delivers:**
- Mobile device testing on mid-range Android (blur performance)
- Core Web Vitals validation and optimization
- Comprehensive accessibility audit (screen reader, keyboard)
- Micro-animations on scroll (if performance budget allows)
- Hover states and transitions
- Dark mode support (optional, if time permits)
- Sitemap generation
- Production deployment configuration

**Addresses features:**
- WCAG 2.1 AA compliance verification (table stakes)
- Fast page load final optimization (table stakes)
- Micro-animations (differentiator, if added)

**Avoids pitfalls:**
- Pitfall 3: Backdrop-blur mobile performance (final validation)
- Pitfall 15: Gradient background performance (mobile testing)

### Phase Ordering Rationale

- **Foundation must come first:** Root layout, font loading, and Tailwind configuration block all visual work. Establishing server/client patterns and accessibility testing early prevents costly rework.

- **Navigation before content:** Header component is needed to test page navigation. Building navigation with Radix UI and proper accessibility patterns prevents having to retrofit later.

- **Content pages in parallel:** Once navigation works, all content pages (Home, Who, What, Book) can be built simultaneously as independent Server Components. This enables parallel work if multiple developers are available.

- **Forms depend on pages:** Book page must exist before dialog forms can be properly tested. URL-synced modals need page context for search params.

- **Optimization last:** Performance testing and polish require completed features. Mobile performance testing of backdrop-blur needs all glassmorphic components built. Accessibility audit needs complete keyboard navigation and forms.

### Research Flags

**Phases needing NO additional research (standard patterns):**
- **Phase 1 (Foundation):** Well-documented Next.js patterns, official docs are comprehensive
- **Phase 2 (Navigation):** Radix UI has complete documentation, WAI-ARIA patterns are standardized
- **Phase 3 (Content):** Static pages with standard SEO patterns
- **Phase 4 (Forms):** Radix UI Dialog and Framer Motion both well-documented
- **Phase 5 (Optimization):** Standard performance testing and accessibility tools

**No phases require `/gsd:research-phase`** — All technical patterns are well-documented and covered in project-level research. Phase-specific challenges (glassmorphism contrast testing, mobile performance profiling) are implementation details, not research gaps.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via official docs and npm registry. React 19 compatibility explicitly confirmed for Framer Motion and Radix UI. |
| Features | MEDIUM | WebSearch verified with multiple credible sources. Feature priorities based on 2026 web standards and SaaS best practices. Lack of Context7 library limits domain-specific insights. |
| Architecture | HIGH | Next.js 15 App Router patterns from official documentation. Server/client component boundaries and composition patterns are well-established. Project structure validated against Next.js docs and community best practices. |
| Pitfalls | HIGH | Drawn from official Next.js upgrade guides, real GitHub issues, and Vercel blog posts. Glassmorphism accessibility concerns validated against multiple accessibility resources. Mobile performance issues confirmed in Tailwind GitHub discussions. |

**Overall confidence:** HIGH

The stack and architecture research has very high confidence due to official documentation sources. Feature research is medium confidence due to reliance on secondary sources rather than domain-specific Context7 libraries, but SaaS website patterns are well-established and consistent across sources. Pitfall research is high confidence as it draws from actual migration experiences, GitHub issues, and official upgrade guides.

### Gaps to Address

- **Real-world contrast ratios:** While research confirms glassmorphism poses accessibility risks, actual contrast ratios for the Continua gradient (blue to pink) need to be tested against white text at alpha 0.77. This requires implementation and testing, not more research.

- **Mobile blur performance thresholds:** Research identifies that 3+ blur effects cause performance issues, but the exact threshold for Continua's specific design (header + dropdowns + cards) needs profiling on real devices during Phase 3.

- **Browser support policy:** Tailwind CSS v4 requires Safari 16.4+, but no explicit browser support policy was defined. This should be documented in Phase 1 and validated during Phase 5 testing.

- **Form submission behavior:** Project specifies "visual-only" forms with no API integration. However, if any data collection is added later (even localStorage), this changes WCAG requirements and privacy policy language. Clarify exact form behavior expectations during Phase 4 planning.

- **Social proof content:** Features require social proof above fold (logos, testimonials, metrics), but research didn't identify what Continua has available. Gather actual social proof content during Phase 3.

## Sources

### Primary (HIGH confidence)

**Next.js Official Documentation:**
- [Getting Started: Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Getting Started: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)

**Radix UI Official Documentation:**
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Dropdown Menu Component](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
- [Dialog Component](https://www.radix-ui.com/primitives/docs/components/dialog)

**Tailwind CSS:**
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

**NPM Registry (version verification):**
- [framer-motion](https://www.npmjs.com/package/framer-motion) — Latest: 12.34.0
- [@radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu) — Latest: 2.1.16
- [@radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog) — Latest: 1.1.15

### Secondary (MEDIUM confidence)

**Next.js Pitfalls and Best Practices:**
- [Common mistakes with the Next.js App Router - Vercel Blog](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [Next.js 15 Upgrade Guide](https://prateeksha.com/blog/nextjs-15-upgrade-guide-app-router-caching-migration)
- [Next.js App Router Gotchas - TevPro](https://tevpro.com/next-js-gotchas/)

**Accessibility:**
- [Glassmorphism Meets Accessibility - Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Glassmorphism with Website Accessibility in Mind - New Target](https://www.newtarget.com/web-insights-blog/glassmorphism/)
- [Glassmorphism: Definition and Best Practices - Nielsen Norman Group](https://www.nngroup.com/articles/glassmorphism/)
- [WCAG 2.1 ADA Compliance Requirements](https://www.accessibility.works/blog/wcag-ada-website-compliance-standards-requirements/)

**SaaS Website Features and Patterns:**
- [Best B2B SaaS Websites 2026](https://www.vezadigital.com/post/best-b2b-saas-websites-2026)
- [SaaS Website Design 2026](https://www.stan.vision/journal/saas-website-design)
- [SaaS Website Best Practices - RevenueZen](https://revenuezen.com/saas-website-best-practices/)
- [High-Converting Lead Capture Forms 2026](https://www.platoforms.com/blog/ultimate-guide-lead-capture-forms/)

**Performance:**
- [Core Web Vitals 2026 Updates](https://www.seologist.com/knowledge-sharing/core-web-vitals-whats-changed/)
- [Web Performance Standards 2026](https://www.inmotionhosting.com/blog/web-performance-benchmarks/)
- [backdrop-filter Performance - GitHub Issue](https://github.com/tailwindlabs/tailwindcss/issues/15256)

### Tertiary (LOW confidence)

**Animation Libraries Comparison:**
- [Best React Animation Libraries 2026 - LogRocket](https://blog.logrocket.com/best-react-animation-libraries/)
- [Top React Animation Libraries - Syncfusion](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)

**SEO and Content Strategy:**
- [SaaS Marketing Trends 2026](https://thesmarketers.com/blogs/saas-marketing-trends/)
- [SaaS SEO Strategy 2026](https://abedintech.com/saas-seo-strategy/)

---
*Research completed: 2026-02-11*
*Ready for roadmap: yes*
