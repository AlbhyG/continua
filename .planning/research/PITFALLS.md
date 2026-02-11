# Pitfalls Research

**Domain:** Next.js 15 Informational Website with Tailwind CSS v4
**Researched:** 2026-02-11
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Glassmorphism Accessibility Failures

**What goes wrong:**
Semi-transparent glassmorphism cards fail WCAG 2.2 contrast requirements (4.5:1 for body text, 3:1 for UI components). Text readability varies as users scroll because background content shifts beneath the transparent layer, creating unpredictable contrast ratios. Users with low vision or color blindness cannot read content reliably.

**Why it happens:**
Designers prioritize aesthetic appeal over accessibility. The style guide specifies `rgba(255, 255, 255, 0.77)` for card backgrounds, which looks beautiful against the gradient but provides insufficient contrast guarantee. Developers test on their own screens at optimal angles and brightness, missing real-world accessibility failures.

**How to avoid:**
- Test all text against the **darkest** possible background color in the gradient (the pink `rgb(229, 158, 221)` at 100%)
- Add semi-opaque background overlays behind text blocks to ensure minimum 4.5:1 contrast
- For critical content (navigation, forms, CTAs), use solid white backgrounds `#ffffff` instead of transparent ones
- Run automated accessibility checks in CI using tools like axe-core or Lighthouse
- Test with browser extensions that simulate color blindness and low vision

**Warning signs:**
- Text that looks fine at the top of the page (blue gradient) but becomes harder to read toward the bottom (pink gradient)
- User feedback about readability issues
- Lighthouse accessibility scores below 90
- Text that disappears or becomes illegible when users adjust screen brightness

**Phase to address:**
Phase 1 (Foundation/Design System) - Build accessibility testing into the component library from the start. Create card variants that meet WCAG requirements.

---

### Pitfall 2: Client/Server Component Boundary Violations

**What goes wrong:**
Developers add `"use client"` at the top of page components to fix a single interactivity issue, converting the entire page and all imported components into client components. This eliminates Next.js 15's performance benefits, increases JavaScript bundle size, and breaks static generation. Alternatively, attempting to import Server Components into Client Components causes build errors.

**Why it happens:**
The distinction between server and client rendering is conceptually confusing, especially since client components are also SSR'd initially. Developers see an error about `window` or `useState` and reflexively add `"use client"` to the nearest file without understanding the boundary implications. The error messages don't clearly explain the component tree implications.

**How to avoid:**
- Follow the "server by default" principle - all components are Server Components unless explicitly marked otherwise
- Push `"use client"` as deep in the component tree as possible (e.g., only mark the interactive button as a client component, not the entire page)
- Use the composition pattern: pass Server Components as children to Client Components rather than importing them
- Create separate files for interactive pieces (e.g., `dropdown.client.tsx` vs `dropdown-content.server.tsx`)
- Document which components are client vs server in your component library

**Warning signs:**
- JavaScript bundle size grows unexpectedly large
- Static generation stops working (`generateStaticParams` errors)
- Build warnings about "use client" in unexpected places
- Loss of streaming and progressive enhancement benefits
- TypeScript type inference breaking across boundaries

**Phase to address:**
Phase 1 (Foundation) and Phase 2 (Core Components) - Establish clear patterns for component boundaries. Every new component should explicitly decide server vs client.

---

### Pitfall 3: Backdrop-Blur Performance Collapse on Mobile

**What goes wrong:**
The style guide extensively uses `backdrop-blur` for glassmorphism effects on header, dropdowns, and cards. On mobile devices, particularly mid-range and older phones, this causes severe performance degradation: janky scrolling, dropped frames, laggy interactions, and high battery drain. The site feels sluggish despite being otherwise well-optimized.

**Why it happens:**
Backdrop-blur is GPU-intensive. Each blurred element requires the browser to sample, blur, and composite background pixels in real-time. The Continua design has multiple stacked blur effects (header with blur, dropdowns with blur, cards with blur). Mobile GPUs, especially on Android devices, struggle with 3+ simultaneous blur effects. Developers test on high-end MacBooks and recent iPhones, missing the performance cliff on real-world devices.

**How to avoid:**
- Reduce blur radius on mobile: Use media queries to drop from `blur(12px)` to `blur(3-5px)` on small screens
- Limit the number of simultaneous blur effects: Ensure only 2-3 elements have backdrop-blur active at once
- Use `will-change: backdrop-filter` sparingly (only on elements about to animate) to hint GPU optimization
- Add hardware acceleration with `transform: translateZ(0)` but test battery impact
- Provide a "reduce transparency" mode that respects `prefers-reduced-transparency` media query, replacing blur with solid colors
- Consider removing blur entirely on very low-end devices (use device detection or performance API)
- Profile on actual Android devices (Samsung Galaxy A series, Pixel 6a, etc.), not just iPhones

**Warning signs:**
- Scrolling feels janky or stuttery on mobile
- High battery drain reports from mobile users
- Chrome DevTools performance profile shows long GPU tasks
- Frame rate drops below 30fps during interactions
- Mobile users complaining about sluggishness while desktop users report no issues

**Phase to address:**
Phase 2 (Core Components) - Build mobile performance testing and blur fallbacks into all glassmorphism components. Phase 3 (Responsive & Performance) - Comprehensive mobile device testing.

---

### Pitfall 4: Tailwind CSS v4 Configuration Confusion

**What goes wrong:**
Developers try to configure Tailwind using `tailwind.config.js` (v3 approach) or put `@theme` directives in imported CSS files, causing configuration to silently fail. Custom colors, spacing, or fonts don't apply. IDE shows "Unknown at rule @theme" errors. Migration from examples or tutorials breaks because they assume v3 syntax.

**Why it happens:**
Tailwind CSS v4 fundamentally changed configuration from JavaScript to CSS-based configuration. The `@theme` directive only works in the main entry CSS file that Tailwind processes directly - it's **not** processed in files imported via `@import`. Most existing documentation and tutorials still show v3 patterns. The error messages are confusing and IDE support is incomplete.

**How to avoid:**
- Put **all** `@theme` configuration in the main CSS file (`app/globals.css`) that's imported in the root layout
- Don't use `@import` to split theme configuration across multiple files
- Configure VS Code to recognize Tailwind directives: Add `"*.css": "tailwindcss"` to CSS language associations in settings
- Use `:root` CSS variables for values that don't need corresponding utility classes, reserve `@theme` for values that should generate utilities
- Don't create `tailwind.config.js` - delete it if it exists from scaffolding
- Reference the official v4 docs, not v3 docs or random blog posts

**Warning signs:**
- Custom colors defined in `@theme` not working
- IDE showing red squiggles under `@theme`
- Configuration working locally but failing in CI/build
- Utilities not generating for custom theme values
- Confusion about where configuration should live

**Phase to address:**
Phase 1 (Foundation) - Establish the correct configuration pattern and document it clearly for all developers.

---

### Pitfall 5: Next.js 15 Caching Behavior Surprises

**What goes wrong:**
Developers expect pages to be cached by default (Next.js 14 behavior) but Next.js 15 changed defaults: GET Route Handlers are **not** cached by default, and the behavior differs between development and production. Static pages that should be cached aren't, or pages that should be dynamic are cached. Stale content appears after deployments. Revalidation doesn't work as expected.

**Why it happens:**
Next.js 15 changed caching defaults for better developer ergonomics, but this breaks assumptions from Next.js 14. Documentation from early 2025 is outdated. The behavior is different in `next dev` vs production builds vs edge deployments, making it hard to predict. Developers don't understand the interaction between `fetch` caching, Full Route Cache, and Router Cache.

**How to avoid:**
- Explicitly declare rendering strategy with `export const dynamic = 'force-static'` or `export const dynamic = 'force-dynamic'` in route segments
- For static pages (most informational content), use `export const dynamic = 'force-static'` to guarantee static generation
- Test caching behavior in production builds (`npm run build` && `npm run start`), not just `npm run dev`
- Add automated CI tests that check `Cache-Control` headers on representative endpoints
- Understand the four caching layers: Request Memoization, Data Cache, Full Route Cache, Router Cache
- For ISR (Incremental Static Regeneration), use time-based revalidation: `export const revalidate = 3600` (seconds)
- Document expected caching behavior for each route in code comments

**Warning signs:**
- Pages showing stale data after deployment
- Development behavior differs dramatically from production
- `generateStaticParams` returning empty arrays causing dynamic rendering
- Unexpected cache misses or hits
- Headers showing `Cache-Control: private` when you expected caching

**Phase to address:**
Phase 1 (Foundation) - Set up the correct static generation patterns and document them. Phase 4 (Deployment) - Add cache validation tests.

---

### Pitfall 6: Inter Font Loading Performance Issues

**What goes wrong:**
The style guide specifies loading Inter font from Google Fonts using `@font-face` pointing to `fonts.gstatic.com`. This creates a waterfall: HTML loads → CSS loads → font URLs discovered → fonts download. Users see invisible text (FOIT) or fallback fonts that shift layout (FOUT) before Inter loads. Core Web Vitals suffer, particularly CLS (Cumulative Layout Shift).

**Why it happens:**
Developers use the familiar Google Fonts approach without understanding Next.js 15's built-in font optimization. The `next/font/google` module exists specifically to solve this problem but goes unused. Font subsetting isn't applied, so users download the entire font family including unused glyphs.

**How to avoid:**
- Use `next/font/google` to import Inter: `import { Inter } from 'next/font/google'`
- This automatically: downloads fonts at build time, self-hosts them (no external requests), generates optimal `@font-face` declarations, subsets to only needed characters
- Apply `font-display: swap` to ensure text is visible during loading
- Preload critical fonts in the `<head>` (Next.js does this automatically with `next/font`)
- Use variable fonts (`Inter` is available as a variable font) for better performance and flexibility
- Specify only the weights you need (400, 700) to reduce file size
- Consider font subsetting for Latin-only text: `subset: ['latin']`

**Warning signs:**
- Flash of invisible text (FOIT) on page load
- Flash of unstyled text (FOUT) with layout shift
- Poor CLS scores in Lighthouse
- Fonts loading slowly on throttled connections
- Multiple font file requests in Network tab instead of self-hosted fonts

**Phase to address:**
Phase 1 (Foundation) - Implement proper font loading from the start. This affects the entire design system.

---

### Pitfall 7: Hydration Errors from Dynamic Content

**What goes wrong:**
The app crashes on the client with "Text content does not match server-rendered HTML" errors. Server renders one thing, client expects another. Common causes in informational sites: timestamps, random values, window-dependent calculations, third-party scripts, browser extensions modifying DOM.

**Why it happens:**
Server-side rendering happens in Node.js without access to browser APIs. If a component uses `window`, `localStorage`, `document`, or generates dynamic values (timestamps, random numbers) during render, the server output differs from the client's first render. React detects the mismatch and throws. The error messages are cryptic and don't clearly point to the cause.

**How to avoid:**
- Never access browser APIs (`window`, `document`, `localStorage`) in Server Components
- For client-side-only code, use `useEffect` hook to defer execution until after hydration
- For dynamic values, render a loading state or generic default on the server, then update in `useEffect`
- Wrap browser-dependent code in checks: `if (typeof window !== 'undefined')`
- Validate HTML structure - don't nest `<div>` in `<p>`, don't nest `<p>` in `<p>`
- Be careful with third-party libraries that modify DOM (analytics, chat widgets)
- Use `suppressHydrationWarning` only as a last resort for truly unavoidable cases (like timestamps)
- Test with React StrictMode enabled (Next.js enables this by default in dev)

**Warning signs:**
- Console errors about hydration mismatch
- Flash of wrong content before it corrects itself
- Components unmounting and remounting unexpectedly
- Different behavior in dev vs production
- Errors that only occur on specific browsers or with specific extensions

**Phase to address:**
Phase 1 (Foundation) and Phase 2 (Core Components) - Establish patterns for client-side code. Add linting rules to catch browser API usage in Server Components.

---

### Pitfall 8: Dropdown and Modal Accessibility Violations

**What goes wrong:**
The header dropdowns and dialog forms are built without proper ARIA attributes, keyboard navigation, or focus management. Screen readers can't understand the dropdown structure. Keyboard users can't open dropdowns with Enter/Space, can't navigate items with arrow keys, can't close with Escape. Focus isn't trapped in modals. Tab order is wrong.

**Why it happens:**
Developers build interactive UI by hand without understanding accessibility requirements. The visual behavior works (click to open, click item to activate) so it seems "done." Keyboard and screen reader testing is skipped. WAI-ARIA patterns aren't followed. There's no accessibility checklist in the development process.

**How to avoid:**
- Follow WAI-ARIA Authoring Practices for Menu Button pattern and Dialog pattern
- For dropdowns:
  - Button trigger: `role="button"`, `aria-haspopup="true"`, `aria-expanded="false|true"`
  - Menu: `role="menu"`, positioned absolutely
  - Menu items: `role="menuitem"`, focusable
  - Keyboard: Space/Enter to open, Arrow keys to navigate, Escape to close, Tab to close and move focus
- For modals:
  - Container: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title
  - Trap focus inside modal (cycle tab within modal)
  - Escape key closes modal
  - Return focus to trigger element when closed
  - Disable body scrolling while open
- Consider using React Aria or Radix UI primitives instead of building from scratch
- Add automated accessibility testing with axe-core
- Test with keyboard only (unplug mouse)
- Test with screen reader (VoiceOver on Mac, NVDA on Windows)

**Warning signs:**
- Can't operate dropdowns with keyboard
- Screen reader announces wrong information or nothing at all
- Focus disappears or moves to wrong elements
- Can't escape from modals with keyboard
- Lighthouse accessibility score below 90

**Phase to address:**
Phase 2 (Core Components) - Build accessibility into dropdown and modal components from the start. Add accessibility testing to component development workflow.

---

## Moderate Pitfalls

### Pitfall 9: Fixed Header Anchor Link Coverage

**What goes wrong:**
The header is fixed at the top of the viewport. When users click anchor links (e.g., from "Who" page to "For Individuals" section), the browser scrolls so the target is at the very top, but the fixed header covers it. Users must manually scroll down to see the content they navigated to.

**Prevention:**
- Add `scroll-padding-top: 80px` to the `html` element (80px matches the header height including padding)
- Alternatively, add `scroll-margin-top: 80px` to all anchor target elements
- Test all anchor navigation scenarios
- Consider smooth scrolling: `scroll-behavior: smooth` on `html` element

**Phase to address:**
Phase 2 (Core Components) - When building the header and page navigation.

---

### Pitfall 10: Missing or Incorrect SEO Metadata

**What goes wrong:**
Informational pages missing unique `title` and `description` meta tags. All pages using the same generic metadata. Open Graph images not set or using relative URLs that social platforms can't fetch. Robots.txt blocking important pages or assets.

**Prevention:**
- Export `metadata` object from every page with unique title and description
- Set `metadataBase` in root layout for absolute URLs: `metadataBase: new URL('https://continua.com')`
- Create OpenGraph images for each major page
- For dynamic routes, use `generateMetadata` async function
- Don't mix `metadata` object and `generateMetadata` function in the same file
- Add meta description to every page (150-160 characters)
- Validate metadata with social media preview tools (Twitter Card Validator, Facebook Sharing Debugger)
- Generate a sitemap with all pages
- Test that robots.txt isn't blocking pages or CSS/JS assets

**Phase to address:**
Phase 3 (Content Pages) - As pages are built, add proper metadata to each.

---

### Pitfall 11: Next.js 15 params Type Mismatch

**What goes wrong:**
TypeScript build errors in dynamic routes: "Type 'Params' is missing the following properties from type 'Promise<any>': then, catch, finally." This is a Next.js 15-specific breaking change that breaks code migrated from Next.js 14.

**Prevention:**
- In Next.js 15, `params` in Server Components is a Promise that must be awaited
- Change from: `function Page({ params }: { params: { slug: string } })`
- Change to: `async function Page({ params }: { params: Promise<{ slug: string }> })` and `const { slug } = await params`
- Also affects: `searchParams` (now a Promise)
- Update all dynamic route pages and generateMetadata functions
- Add TypeScript strict mode to catch these early: `"strict": true` in tsconfig.json

**Phase to address:**
Phase 2 (Routing) - If/when building dynamic routes. For this fully static informational site, this may not apply.

---

### Pitfall 12: Tailwind CSS v4 Browser Support Issues

**What goes wrong:**
Site breaks on older browsers because Tailwind CSS v4 requires Safari 16.4+, Chrome 111+, and Firefox 128+. Styles fail on older iOS devices. Range media queries don't work on Safari 15.4-16.3.

**Prevention:**
- Document minimum browser versions in README and support policy
- Add browserslist configuration if needed for PostCSS compatibility
- Test on real older devices, not just modern browsers
- Consider showing a browser upgrade notice for unsupported browsers
- If you must support older browsers, stay on Tailwind CSS v3.4 until requirements change
- Use feature detection with `@supports` for critical features
- Check Can I Use for specific CSS features used extensively (backdrop-filter requires Safari 18+, Chrome 76+)

**Phase to address:**
Phase 1 (Foundation) - Decide browser support policy. Phase 4 (Deployment) - Test on target browsers.

---

## Minor Pitfalls

### Pitfall 13: TypeScript Errors Skipped in Development

**What goes wrong:**
TypeScript errors are visible in the IDE but don't block `npm run dev`. Developers ignore them because the site appears to work. Production build suddenly fails with type errors, blocking deployment.

**Prevention:**
- Enable TypeScript checking in development: Run `tsc --noEmit --watch` in a separate terminal
- Add pre-commit hooks that run type checking: `tsc --noEmit`
- Configure CI to fail on type errors before merging
- Don't use `ignoreBuildErrors: true` in `next.config.ts` - this hides problems
- Use strict TypeScript mode: `"strict": true`
- Treat warnings as errors in CI

**Phase to address:**
Phase 1 (Foundation) - Set up development workflow and CI checks.

---

### Pitfall 14: Missing Loading and Error States

**What goes wrong:**
If any page uses dynamic data fetching (even just for forms), users see a blank screen during loading. Errors show ugly Next.js error pages instead of styled messages. No feedback for form submissions.

**Prevention:**
- Create `loading.tsx` for any route that might load data
- Create `error.tsx` with proper error UI for every major route segment
- Even for static pages, consider skeleton screens during client-side navigation
- For forms, show loading state during submission and clear success/error messages
- Test error scenarios: network offline, server errors, validation failures

**Phase to address:**
Phase 2 (Core Components) - Build loading and error components. Phase 3 (Content Pages) - Apply to all routes.

---

### Pitfall 15: Gradient Background Performance

**What goes wrong:**
The full-viewport fixed gradient (`background-attachment: fixed`) can cause performance issues on mobile, particularly during scrolling. The browser must recalculate background position for every frame.

**Prevention:**
- Test scroll performance on mid-range Android devices
- Consider using a static gradient (remove `background-attachment: fixed`) on mobile via media query
- If performance is poor, create the gradient as an absolutely positioned `::before` pseudo-element instead
- Profile with Chrome DevTools Performance tab looking for paint operations during scroll
- Monitor Core Web Vitals, particularly CLS and INP (Interaction to Next Paint)

**Phase to address:**
Phase 3 (Responsive & Performance) - Mobile performance testing and optimization.

---

### Pitfall 16: Over-Using "use client" Directive

**What goes wrong:**
Beyond the critical boundary violations, subtle overuse happens: developers mark components as client "just in case" or because they're imported from a client component. This gradually inflates the client bundle without clear benefit.

**Prevention:**
- Regularly audit `"use client"` usage: `grep -r "use client" src/`
- Ask for every client component: "Does this truly need browser APIs or state?"
- Use `next build` and check `.next/static/chunks` to see client bundle size
- Aim for minimal client JavaScript - the informational site should be mostly server components
- Document why each client component needs to be client-side

**Phase to address:**
Ongoing - Code review checklist item.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `suppressHydrationWarning` to hide hydration errors | Removes console noise quickly | Masks underlying bugs that cause poor UX, unpredictable behavior, and potential runtime errors | Only for truly unavoidable cases like server-rendered timestamps |
| Skipping keyboard accessibility testing | Faster component development | Legal liability (ADA), excludes keyboard users, fails WCAG requirements | Never - keyboard testing is essential |
| Using inline blur radius without mobile optimization | Simpler code, fewer media queries | Terrible mobile performance, user complaints, high bounce rate | Never for production - always optimize mobile blur |
| Hardcoding fixed header height instead of CSS variables | Quicker implementation | Difficult to maintain when header height changes, breaks scroll padding | Never - use CSS variables or Tailwind theme |
| Skipping OpenGraph images | Saves design time | Poor social media presence, unprofessional sharing previews | Acceptable for internal pages, never for marketing pages |
| Using any/unknown TypeScript types | Silences type errors quickly | Loses type safety, causes runtime errors, makes refactoring dangerous | Never - invest time in proper types |
| Ignoring backdrop-filter browser support | Works on developer's Mac | Breaks on older browsers, no fallback UI | Only acceptable if browser support policy excludes those browsers |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Fonts | Using `<link>` or `@import` from Google Fonts directly | Use `next/font/google` module for automatic optimization |
| Analytics Scripts | Adding `<script>` tags directly to HTML | Use `next/script` with `strategy="afterInteractive"` |
| Form Handling | Using client-side only forms | Use Server Actions for progressive enhancement |
| Environment Variables | Using `process.env` in client components | Prefix with `NEXT_PUBLIC_` for client access, or keep server-only |
| CSS Variables | Defining in CSS file outside `@theme` directive | Use `@theme` for values that need utility classes, `:root` for others |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Multiple backdrop-blur layers | Janky scrolling, low FPS on mobile | Limit to 2-3 simultaneous blur effects, reduce radius on mobile | 3+ blur effects on mid-range Android devices |
| Large client bundle from over-using client components | Slow initial page load, high TBT | Keep most components as Server Components, measure bundle size | Bundle exceeds 100-200KB for an informational site |
| Unoptimized images | Large LCP, slow loading | Use `next/image` for automatic optimization (even though not many images in this site) | Any image over 100KB |
| Fixed gradient with `background-attachment: fixed` | Scroll jank on mobile | Use static gradient or absolutely positioned element on mobile | Low-end devices, particularly Android |
| Too many font weights loaded | Slow FCP, unnecessary bandwidth | Only load weights 400 and 700 as specified in style guide | Loading 5+ font weights |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Dropdown closes on any click outside, including header navigation | User accidentally closes dropdown when trying to click adjacent button | Implement proper focus management and intentional close interactions |
| No visual feedback on form submission | User doesn't know if action succeeded, clicks multiple times | Show loading state, then success/error message with clear next steps |
| Mobile header too large | Wastes precious mobile viewport space | Consider smaller padding/logo on mobile |
| Text over gradient without opacity control | Readability varies dramatically as user scrolls | Add semi-opaque backgrounds behind text or use solid backgrounds |
| Dropdown items without hover states | Unclear what's interactive | Clear hover/focus states with background color change |
| No keyboard focus indicators | Keyboard users lost | Visible focus rings, don't disable outline without replacement |

---

## "Looks Done But Isn't" Checklist

- [ ] **Dropdowns:** Often missing keyboard navigation (arrow keys, enter, escape) - verify with keyboard only
- [ ] **Forms:** Often missing loading states and error handling - test with network throttling and invalid inputs
- [ ] **Glassmorphism cards:** Often failing contrast requirements - test with accessibility checker on all gradient sections
- [ ] **Fixed header:** Often covers anchor link targets - test all internal navigation links
- [ ] **Metadata:** Often using generic title/description - verify unique metadata on every page
- [ ] **Mobile performance:** Often only tested on high-end devices - test on mid-range Android
- [ ] **Accessibility:** Often missing ARIA labels and roles - test with screen reader
- [ ] **Error states:** Often showing default error pages - verify custom error pages render correctly
- [ ] **TypeScript:** Often ignoring type errors visible in IDE - verify `npm run build` succeeds
- [ ] **Font loading:** Often causing layout shift - verify fonts load without FOUT/FOIT

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Glassmorphism accessibility failure | MEDIUM | Audit all text-on-transparent-background, add semi-opaque backgrounds, retest contrast ratios |
| Client/server boundary violations | LOW-MEDIUM | Move "use client" deeper in tree, refactor to composition pattern, rebuild affected pages |
| Backdrop-blur mobile performance | MEDIUM | Add media queries to reduce/remove blur on mobile, test on real devices |
| Tailwind v4 config issues | LOW | Consolidate all @theme into main CSS file, remove tailwind.config.js |
| Caching behavior surprises | MEDIUM | Add explicit dynamic/static exports, add cache testing to CI, redeploy |
| Font loading issues | LOW | Migrate to next/font/google, remove external font links |
| Hydration errors | MEDIUM-HIGH | Identify dynamic content, wrap in useEffect, separate server/client concerns |
| Accessibility violations | MEDIUM-HIGH | Add ARIA attributes, implement keyboard navigation, add focus management |
| Fixed header anchor coverage | LOW | Add scroll-padding-top to HTML element |
| Missing SEO metadata | MEDIUM | Create metadata for each page, set metadataBase, generate sitemap |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Glassmorphism accessibility | Phase 1 (Foundation) | Automated accessibility tests passing, manual screen reader testing |
| Client/server boundaries | Phase 1 (Foundation), Phase 2 (Components) | Build succeeds, bundle size within targets, static generation working |
| Backdrop-blur performance | Phase 2 (Components), Phase 3 (Responsive) | Scroll FPS >50 on mid-range Android, mobile performance metrics green |
| Tailwind v4 configuration | Phase 1 (Foundation) | All custom theme values working, IDE not showing errors |
| Caching behavior | Phase 1 (Foundation), Phase 4 (Deployment) | Cache headers correct in production, static pages cached as expected |
| Font loading | Phase 1 (Foundation) | No FOUT/FOIT, CLS score <0.1, fonts self-hosted |
| Hydration errors | Phase 1 (Foundation), Phase 2 (Components) | No hydration warnings in console, StrictMode enabled |
| Dropdown/modal accessibility | Phase 2 (Components) | Keyboard navigation working, screen reader testing passed |
| Fixed header anchors | Phase 2 (Components) | All anchor links scroll to visible position |
| SEO metadata | Phase 3 (Content Pages) | Unique metadata on all pages, social previews working |
| TypeScript errors | Phase 1 (Foundation) | CI checks enabled, build succeeds with no type errors |
| Missing loading/error states | Phase 2 (Components), Phase 3 (Content) | All routes have loading.tsx and error.tsx |
| Gradient performance | Phase 3 (Responsive) | Smooth scrolling on mobile devices |
| Over-using "use client" | Ongoing (Code Review) | Regular bundle size audits, documentation of client components |

---

## Sources

### Next.js App Router and Caching
- [Common mistakes with the Next.js App Router and how to fix them - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [Next.js 15 Upgrade Guide: App Router changes, caching gotchas - Prateeksha](https://prateeksha.com/blog/nextjs-15-upgrade-guide-app-router-caching-migration)
- [Next.js App Router: common mistakes and how to fix them - Upsun](https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/)
- [Next.js App Router Gotchas - TevPro](https://tevpro.com/next-js-gotchas/)

### Tailwind CSS v4
- [Tailwind CSS 4: What's New and Should You Migrate? - Code With Seb](https://www.codewithseb.com/blog/tailwind-css-4-whats-new-migration-guide)
- [Upgrading to Tailwind CSS v4: Missing Defaults, Broken Dark Mode - GitHub Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/16517)
- [Upgrade guide - Tailwind CSS](https://tailwindcss.com/docs/upgrade-guide)
- [@theme directive not working when importing CSS files - GitHub Issue](https://github.com/tailwindlabs/tailwindcss/issues/18966)
- [Quick Fix: "Unknown at rule @theme" in Tailwind CSS v4 - Medium](https://medium.com/@luizmipc/quick-fix-unknown-at-rule-theme-in-tailwind-css-v4-2000b965eda5)

### Client/Server Components
- [Next.js Server Components Broke Our App Twice - Medium](https://medium.com/lets-code-future/next-js-server-components-broke-our-app-twice-worth-it-e511335eed22)
- [Getting Started: Server and Client Components - Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Mastering Client and Server Components in Next.js - Medium](https://medium.com/@vshall/mastering-client-and-server-components-in-next-js-a-comprehensive-guide-573acf9892a2)

### Glassmorphism Accessibility
- [Glassmorphism Meets Accessibility: Can Glass Be Inclusive? - Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Glassmorphism with Website Accessibility in Mind - New Target](https://www.newtarget.com/web-insights-blog/glassmorphism/)
- [Glassmorphism: Definition and Best Practices - Nielsen Norman Group](https://www.nngroup.com/articles/glassmorphism/)

### Font Loading
- [How to Fix "Font Loading" Issues in Next.js - OneUpTime](https://oneuptime.com/blog/post/2026-01-24-nextjs-font-loading-issues/view)
- [Getting Started: Font Optimization - Next.js](https://nextjs.org/docs/app/getting-started/fonts)
- [Optimizing: Fonts - Next.js](https://nextjs.org/docs/14/app/building-your-application/optimizing/fonts)

### Static Generation
- [How to Fix "generateStaticParams" Errors in Next.js - OneUpTime](https://oneuptime.com/blog/post/2026-01-24-nextjs-generatestaticparams-errors/view)
- [Functions: generateStaticParams - Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [How to Fix Next.js searchParams Killing Static Generation - Build with Matija](https://www.buildwithmatija.com/blog/nextjs-searchparams-static-generation-fix)

### Accessibility
- [Building an Accessible Dropdown (Combobox) in React - Medium](https://medium.com/@katr.zaks/building-an-accessible-dropdown-combobox-in-react-a-step-by-step-guide-f6e0439c259c)
- [Accessibility - React](https://legacy.reactjs.org/docs/accessibility.html)
- [Accessibility - react-modal documentation](https://reactcommunity.org/react-modal/accessibility/)
- [Keyboard Events and Accessibility in React - Useful Codes](https://useful.codes/keyboard-events-and-accessibility-in-react/)

### SEO and Metadata
- [Next.js Metadata Tutorial: Static & Dynamic SEO Configs - Medium](https://utsavdesai26.medium.com/next-js-metadata-tutorial-static-dynamic-seo-configs-7c843ea9e416)
- [How to Configure SEO in Next.js 16 (the Right Way) - JS Dev Space](https://jsdevspace.substack.com/p/how-to-configure-seo-in-nextjs-16)
- [Next.js SEO: Metadata, Sitemaps & Canonical Tags - Prateeksha](https://prateeksha.com/blog/nextjs-app-router-seo-metadata-sitemaps-canonicals)
- [How to Fix "Metadata" Generation Errors in Next.js - OneUpTime](https://oneuptime.com/blog/post/2026-01-24-fix-nextjs-metadata-generation-errors/view)

### Hydration Errors
- [Next.js Hydration Errors in 2026: The Real Causes, Fixes, and Prevention - Medium](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)
- [Next.js 15 Hydration Errors Explained (and Eliminated) - Medium](https://medium.com/@sureshdotariya/next-js-15-hydration-errors-explained-and-eliminated-12-real-bugs-and-their-one-line-fixes-966ae9360258)
- [Text content does not match server-rendered HTML - Next.js](https://nextjs.org/docs/messages/react-hydration-error)
- [React 19 & Next.js 15 Hydration Error Fix - C# Corner](https://www.c-sharpcorner.com/article/react-19-next-js-15-hydration-error-fix/)

### Performance
- [Creating Blurred Backgrounds Using CSS Backdrop-Filter - OpenReplay](https://blog.openreplay.com/creating-blurred-backgrounds-css-backdrop-filter/)
- [backdrop-filter - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [Performance issue with backdrop blur - GitHub Issue](https://github.com/tailwindlabs/tailwindcss/issues/15256)
- [How CSS Properties Affect Website Performance - F22 Labs](https://www.f22labs.com/blogs/how-css-properties-affect-website-performance/)

### Fixed Headers and Anchors
- [Fixed Headers and Jump Links? The Solution is scroll-margin-top - CSS-Tricks](https://css-tricks.com/fixed-headers-and-jump-links-the-solution-is-scroll-margin-top/)
- [Simple Solution for Anchor Links Behind Sticky Headers - Markus Oberlehner](https://markus.oberlehner.net/blog/simple-solution-for-anchor-links-behind-sticky-headers)
- [One line CSS solution to prevent anchor links from scrolling behind a sticky header - GetPublii](https://getpublii.com/blog/one-line-css-solution-to-prevent-anchor-links-from-scrolling-behind-a-sticky-header.html)

### TypeScript and Build Issues
- [Next.js 15 Build Fails: 'params' type mismatch - GitHub Issue](https://github.com/vercel/next.js/issues/77609)
- [Next.js 15 params Type Error During Build - GitHub Discussion](https://github.com/vercel/next.js/discussions/80494)
- [How to Use Next.js with TypeScript - OneUpTime](https://oneuptime.com/blog/post/2026-02-02-nextjs-typescript/view)

### Caching and Revalidation
- [Getting Started: Caching and Revalidating - Next.js](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- [Deep Dive: Caching and Revalidating - GitHub Discussion](https://github.com/vercel/next.js/discussions/54075)
- [Functions: revalidatePath - Next.js](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

---

*Pitfalls research for: Next.js 15 Informational Website with Tailwind CSS v4, React 19, TypeScript*
*Researched: 2026-02-11*
*Confidence: HIGH (verified through official documentation, recent 2026 sources, and real-world issue reports)*
