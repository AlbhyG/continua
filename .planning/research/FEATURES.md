# Feature Research

**Domain:** Informational/Marketing Website for SaaS Product (Personality Assessment Platform)
**Researched:** 2026-02-11
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Mobile-responsive navigation** | 80%+ of B2B decision-makers research on mobile devices | LOW | Hamburger menu on mobile, full navigation on desktop. Must be thumbable (touch targets 44px+). |
| **Clear value proposition above fold** | Users decide to stay/leave within 3-5 seconds | LOW | 6-10 word hero message that answers "who you help, what you solve, why you're different" |
| **Primary CTA above fold** | Users expect clear next action | LOW | Single, action-oriented button (e.g., "Book Assessment", "Get Started") with standout color |
| **Sticky header** | Standard pattern users expect for quick navigation | LOW | Limit to 50px height, disappear on scroll down, reappear on scroll up (Google NCI best practice) |
| **Fast page load (LCP < 2.5s)** | Core Web Vitals now ranking factor; users abandon slow sites | MEDIUM | Technical requirement. Lazy-load non-essential elements, compress images, use CDN |
| **WCAG 2.1 Level AA compliance** | Legal requirement (government deadline April 2026), table stakes for professional sites | MEDIUM | Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text, keyboard navigation, semantic HTML, ARIA labels |
| **Contact/lead capture mechanism** | Users expect way to get in touch or book | LOW | Either dedicated contact page, embedded form, or "Book" CTA linking to scheduling |
| **About/Who page** | Users want to know who's behind the product | LOW | Team, mission, credentials. Builds trust for personality assessment context |
| **Privacy policy link in footer** | Legal requirement, trust signal | LOW | Required for any data collection or cookies |
| **Social proof above fold** | Users don't trust claims without validation | LOW | Logos, testimonials, or metrics (e.g., "5,000+ assessments completed") |
| **Footer with site structure** | Universal pattern for navigation and trust signals | LOW | Links to key pages, social media, legal pages, copyright |
| **Semantic HTML structure** | SEO table stakes, accessibility requirement | LOW | Proper heading hierarchy (h1-h6), nav/main/footer elements, alt text on images |
| **Meta tags (title, description)** | SEO basics, controls how site appears in search and shares | LOW | Unique per page, 60 chars for title, 160 for description |
| **SSL certificate (HTTPS)** | Security table stakes, Google ranking factor | LOW | Required for trust and SEO |
| **Favicon** | Professional polish | LOW | Missing favicon looks incomplete, unprofessional |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued and memorable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Glassmorphism design system** | Distinctive visual identity that conveys sophistication and modern approach | MEDIUM | Differentiator but has accessibility risks (contrast ratios). Requires careful implementation with fallbacks |
| **Gradient backgrounds with depth** | Creates emotional, premium feel appropriate for personality insights | LOW | Aligns with brand differentiation, but must maintain text readability |
| **Micro-animations on scroll** | Modern, polished feel that increases engagement | MEDIUM | Subtle animations (fade-in, parallax). Avoid excessive animation that distracts or reduces accessibility |
| **Conversation-style form (one question at a time)** | 30% higher conversion than traditional multi-field forms | MEDIUM | For "Book" section. Reduces cognitive load and form abandonment |
| **Interactive product preview** | 10-15 second micro-demos outperform "book a call" CTAs | MEDIUM-HIGH | Shows actual assessment interface. Makes site "first version of product" not pitch deck |
| **AI Engine Optimization (AEO)** | Structured content so AI systems cite your information | MEDIUM | 2026 SEO evolution. Schema markup, FAQ sections, clear answer-style content |
| **Pillar-cluster content model** | Establishes topical authority, improves SEO and discoverability | MEDIUM | Hub pages (e.g., "Personality Assessments") link to detailed content. Requires content strategy |
| **Progressive disclosure in navigation** | Reduces cognitive load, highlights priority paths | LOW | Mega menu or focused dropdowns. Matches user intent journey |
| **Dark mode support** | Growing user expectation, especially for professional tools | MEDIUM | Requires careful contrast management with glassmorphism |
| **Sub-100ms interaction responses** | Engagement Reliability (ER) is new Google 2026 metric | MEDIUM | Optimized JavaScript, minimal blocking scripts, lazy-loading |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Deliberately NOT building these.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Auto-playing video background** | Looks "modern" and "engaging" | Kills page performance (LCP), high bounce rates, accessibility issues, mobile data concerns | Static hero with gradient background and optional play button for demo video |
| **Complex mega menu with images** | Showcase all offerings | Overwhelms users (paradox of choice), slow interaction, high maintenance | Simple 3-category dropdown (Who, What, Book) focused on user journey |
| **Popup newsletter on entry** | Capture emails immediately | 22% conversion for click-triggered vs <2% for time/entry triggers. Entry popups annoy users before they see value | Exit-intent popup or embedded form after user engages with content |
| **Multi-page "Book" flow** | Collect maximum information upfront | High abandonment (50% drop per field), intimidating, reduces conversions | Visual-only dialog form (as specified in project), or conversational single-question flow |
| **Parallax scrolling everywhere** | Trendy, dynamic feel | Accessibility issues (motion sickness), performance hit, mobile problems, distracts from content | Subtle parallax on hero only, focus on content and fast load times |
| **Animated SVG illustrations everywhere** | Visual interest, brand personality | File size and performance cost, maintenance burden, can distract from message | Strategic use on 1-2 key pages only; static with CSS transforms elsewhere |
| **Social media feed embeds** | Show "we're active" | Third-party scripts kill performance, privacy concerns, layout shift (CLS), outdated content risk | Simple icon links to social profiles in footer |
| **Live chat widget** | Immediate support | No support team for informational site, creates expectations can't meet, performance cost | Contact form or "Book" CTA with clear response time expectations |
| **Cookie consent banner covering content** | Legal compliance | Annoying UX, hides content, high bounce rate | Minimal footer banner or implied consent for non-tracking cookies |
| **Separate mobile site (m.domain.com)** | "Optimized" mobile experience | SEO nightmare (duplicate content), maintenance burden, broken mobile/desktop switching | Single responsive site with mobile-first design and single breakpoint |

## Feature Dependencies

```
WCAG 2.1 AA Compliance
    └──requires──> Semantic HTML Structure
    └──requires──> Color Contrast Standards (4.5:1)
                       └──conflicts──> Glassmorphism (transparency reduces contrast)
                           └──requires──> Fallback Overlays or Borders

Mobile-Responsive Navigation
    └──requires──> Sticky Header
    └──enhances──> Fast Page Load

Fast Page Load (Core Web Vitals)
    └──requires──> Optimized Images
    └──requires──> Lazy Loading
    └──requires──> Minimal JavaScript
    └──conflicts──> Auto-playing Video
    └──conflicts──> Social Media Embeds

SEO Optimization
    └──requires──> Semantic HTML
    └──requires──> Meta Tags
    └──requires──> Fast Page Load
    └──enhances──> Pillar-Cluster Content Model
    └──requires──> AI Engine Optimization (2026)

Glassmorphism Design
    └──requires──> Contrast Testing
    └──requires──> Dark Mode Consideration
    └──conflicts──> WCAG 2.1 AA (without mitigation)

Conversational Forms
    └──enhances──> Lead Capture
    └──conflicts──> Multi-page Book Flow
```

### Dependency Notes

- **WCAG 2.1 AA conflicts with Glassmorphism:** Transparency reduces contrast ratios. Requires semi-opaque color overlays, subtle borders, testing each glassmorphic element against backgrounds.
- **Core Web Vitals conflicts with heavy media:** Auto-playing video, parallax everywhere, social embeds all kill performance metrics that now impact SEO rankings.
- **Mobile-first enhances everything:** Starting with mobile constraints ensures fast, focused design that scales up gracefully.
- **AEO enhances traditional SEO:** Not competing strategies. Structure content for AI systems while maintaining traditional optimization.

## MVP Definition

### Launch With (v1)

Minimum viable informational site — what's needed to establish professional presence and capture leads.

- [x] **Mobile-responsive navigation with sticky header** — Users expect intuitive navigation, sticky header is standard
- [x] **Home page with value prop above fold** — Core landing page with hero message, primary CTA, social proof
- [x] **Three-section navigation (Who, What, Book)** — Focused on user journey, not overwhelming
- [x] **Content pages for Who and What sections** — Establish credibility and explain offering
- [x] **Visual-only dialog form for Book section** — Lead capture mechanism (as specified in project scope)
- [x] **WCAG 2.1 Level AA baseline compliance** — Legal requirement, trust signal
- [x] **Core Web Vitals optimization** — LCP < 2.5s, CLS < 0.1, INP < 200ms
- [x] **Glassmorphism design system with tested contrast** — Brand differentiator, but accessibility-validated
- [x] **Basic SEO (semantic HTML, meta tags)** — Discoverability foundation
- [x] **Footer with privacy policy and site structure** — Legal requirement, trust signal

### Add After Validation (v1.x)

Features to add once core is working and validated with real users.

- [ ] **Micro-animations on scroll** — Add polish once performance budget allows
- [ ] **Interactive product preview/demo** — Once assessment product is built, show actual interface
- [ ] **Pillar-cluster content expansion** — Develop content hub for SEO and authority building
- [ ] **AI Engine Optimization (AEO)** — Structure existing content for AI citation (FAQ schema, answer-style formatting)
- [ ] **Exit-intent popup for lead capture** — Optimize conversion once baseline is established
- [ ] **Dark mode support** — User experience enhancement, requires design system expansion
- [ ] **Blog or resources section** — Content marketing, SEO long-tail keywords
- [ ] **Case studies or testimonials page** — Social proof expansion once customers exist
- [ ] **Optimized image formats (WebP/AVIF)** — Performance optimization iteration

### Future Consideration (v2+)

Features to defer until product-market fit is established and site is generating leads.

- [ ] **Multi-language support** — Only if targeting international markets
- [ ] **Advanced analytics/heatmaps** — User behavior insights for optimization
- [ ] **A/B testing framework** — Once sufficient traffic for statistical significance
- [ ] **CMS integration** — If frequent content updates needed (vs. static site)
- [ ] **Client portal/login area** — Only if assessment results delivered via web (currently out of scope)
- [ ] **Advanced micro-interactions** — Polish features, low ROI until core is proven

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Mobile-responsive navigation | HIGH | LOW | P1 |
| WCAG 2.1 AA compliance | HIGH | MEDIUM | P1 |
| Fast page load (Core Web Vitals) | HIGH | MEDIUM | P1 |
| Clear value prop above fold | HIGH | LOW | P1 |
| Primary CTA above fold | HIGH | LOW | P1 |
| Sticky header | MEDIUM | LOW | P1 |
| Contact/lead capture | HIGH | LOW | P1 |
| Social proof above fold | HIGH | LOW | P1 |
| Footer with site structure | MEDIUM | LOW | P1 |
| Basic SEO (meta tags, semantic HTML) | HIGH | LOW | P1 |
| Glassmorphism design system | MEDIUM | MEDIUM | P1 |
| Conversational-style forms | HIGH | MEDIUM | P2 |
| Micro-animations on scroll | LOW | MEDIUM | P2 |
| Interactive product preview | HIGH | HIGH | P2 |
| AI Engine Optimization (AEO) | MEDIUM | MEDIUM | P2 |
| Dark mode support | MEDIUM | MEDIUM | P2 |
| Pillar-cluster content model | MEDIUM | MEDIUM | P2 |
| Exit-intent popup | MEDIUM | LOW | P2 |
| Blog/resources section | MEDIUM | HIGH | P3 |
| A/B testing framework | MEDIUM | HIGH | P3 |
| Multi-language support | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (table stakes, core brand differentiation)
- P2: Should have, add when core is validated (optimization, enhancement)
- P3: Nice to have, future consideration (expansion, scale)

## Competitor Feature Analysis

**Note:** SaaS marketing websites in 2026 show convergence around certain patterns while differentiating on execution quality and brand expression.

| Feature | Common Pattern | Differentiator Approach | Our Approach |
|---------|----------------|-------------------------|--------------|
| **Navigation** | Simple header with 3-5 items, sticky on scroll | Mega menu (complex products) vs. focused dropdown (simple products) | Focused dropdown (Who, What, Book) — simple, intent-driven |
| **Hero Section** | Value prop + CTA + social proof above fold | 10-15s micro-demo vs. static with imagery | Static with glassmorphism + gradient, evolve to micro-demo in v2 |
| **Lead Capture** | Multi-field form on contact page | Conversational one-at-a-time forms (30% higher conversion) | Visual-only dialog (v1), evolve to conversational (v2) |
| **Performance** | Many sites fail Core Web Vitals | Top performers: LCP < 2s, mobile-first, optimized assets | Target Core Web Vitals "Good" thresholds, mobile-first |
| **Accessibility** | Minimal compliance or failing | WCAG 2.1 AA with testing | WCAG 2.1 AA baseline with glassmorphism contrast testing |
| **Design System** | Clean, minimal, lots of white space | Glassmorphism, dark themes, bold gradients | Glassmorphism + gradients + Inter font — distinctive visual identity |
| **Content Structure** | Feature pages + blog + resources | Pillar-cluster model for SEO authority | Simple v1 (Who/What/Book), expand to pillar-cluster in v2 |
| **SEO Strategy** | Basic meta tags, some failing technical SEO | AEO + traditional SEO, topical authority, sub-$100 CAC | Basic SEO v1, add AEO in v2, focus on personality assessment keywords |

## Implementation Considerations

### Glassmorphism + WCAG 2.1 AA

**Challenge:** Glassmorphism transparency inherently reduces contrast ratios, conflicting with WCAG requirements.

**Mitigation strategies:**
1. Semi-opaque color overlays on glass panels (not pure transparency)
2. Subtle borders (1px with contrast-meeting color) on glass elements
3. Increase text weight (semibold vs. regular) on glass backgrounds
4. Test every glass element against actual backgrounds it will overlay
5. Fallback: Increase panel opacity for high-contrast mode users
6. Dark mode: Boost opacity, add darker borders, enforce stricter contrast

**Testing protocol:**
- Use automated tools (axe, Lighthouse) for initial checks
- Manual testing with color contrast analyzer for each glassmorphic element
- Test in high-contrast mode (Windows, macOS)
- Screen reader testing (VoiceOver, NVDA)

### Performance Budget with Visual Design

**Challenge:** Glassmorphism effects, gradients, and micro-animations can impact Core Web Vitals.

**Approach:**
1. Set performance budget: LCP < 2.5s, CLS < 0.1, INP < 200ms
2. Use CSS backdrop-filter (GPU-accelerated) for glass blur, not SVG filters
3. Gradients as CSS, not images
4. Lazy-load below-fold glass elements
5. Preload critical fonts (Inter)
6. Minimize JavaScript (avoid heavy animation libraries)
7. Monitor with Real User Monitoring (RUM) tools

### Mobile-First with Single Breakpoint

**Challenge:** Simple breakpoint strategy while maintaining design quality.

**Approach:**
1. Design for 375px mobile first (iPhone SE baseline)
2. Single breakpoint at 768px (tablet/desktop)
3. Fluid typography using clamp() for smooth scaling
4. Navigation: Hamburger < 768px, full navigation >= 768px
5. Test at breakpoint edges (767px, 769px) for layout breaks

## Sources

**Navigation Patterns:**
- [Best B2B SaaS Website Examples (2026)](https://www.vezadigital.com/post/best-b2b-saas-websites-2026)
- [SaaS website design in 2026 — best SaaS websites, examples & conversion framework](https://www.stan.vision/journal/saas-website-design)
- [Designing Your SaaS Navigation Menu for Maximum Discoverability](https://lollypop.design/blog/2025/december/saas-navigation-menu-design/)
- [15 Website Navigation Best Practices and Do's That Work](https://www.wearetenet.com/blog/website-navigation-best-practices)

**Content & Structure:**
- [35 SaaS website design examples to learn from in 2026 | Webflow Blog](https://webflow.com/blog/saas-website-design-examples)
- [SaaS Website Structure Best Practices for Growth | RevenueZen](https://revenuezen.com/saas-website-best-practices/)
- [Best Practices For A SaaS Website | Powered by Search](https://www.poweredbysearch.com/blog/saas-website-best-practices/)

**Lead Capture & Forms:**
- [The Ultimate Guide to High-Converting Lead Capture Forms (2026)](https://www.platoforms.com/blog/ultimate-guide-lead-capture-forms/)
- [Ultimate guide to high-converting signup forms (2026 edition)](https://www.omnisend.com/blog/best-signup-forms-conversions/)
- [Lead Capture Forms: 14 Best Practices With Tips & Templates](https://www.leadsquared.com/learn/marketing/lead-capture-forms/)
- [9 Tips for Designing Contact Forms That Convert](https://www.webfx.com/blog/general/9-tips-for-designing-contact-forms-that-convert/)

**Accessibility:**
- [2026 WCAG & ADA Website Compliance Requirements & Standards](https://www.accessibility.works/blog/wcag-ada-website-compliance-standards-requirements/)
- [Glassmorphism Meets Accessibility: Can Glass Be Inclusive? | Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Glassmorphism with Website Accessibility in Mind: Balancing Style and Readability – New Target](https://www.newtarget.com/web-insights-blog/glassmorphism/)

**Performance:**
- [Core Web Vitals 2026: Key Updates and How to Proof Your Website - SEOlogist Inc](https://www.seologist.com/knowledge-sharing/core-web-vitals-whats-changed/)
- [2026 Web Performance Standards: Guide Faster Websites](https://www.inmotionhosting.com/blog/web-performance-benchmarks/)
- [Core Web Vitals 2026: Technical SEO That Actually Moves the Needle](https://almcorp.com/blog/core-web-vitals-2026-technical-seo-guide/)

**SEO:**
- [SaaS Marketing Trends 2026: AI-First Strategies](https://thesmarketers.com/blogs/saas-marketing-trends/)
- [10 SaaS SEO Strategy - SaaS Startup Advice To Outrank Competitors in 2026](https://agilityportal.io/blog/10-saas-seo-strategy)
- [SaaS SEO Strategy 2026: 7 Proven Tactics to Explode Organic Growth](https://abedintech.com/saas-seo-strategy/)
- [B2B SaaS SEO Strategies for Growth in 2026](https://www.gravitatedesign.com/blog/b2b-saas-seo-strategies/)

**Sticky Headers & Mobile Navigation:**
- [Sticky Headers: 5 Ways to Make Them Better - NN/G](https://www.nngroup.com/articles/sticky-headers/)
- [SEO Best Practices: Mobile-Friendly Sticky Headers](https://www.dodgeballmarketing.com/blog/seo-best-practices-is-the-header-sticky-for-mobile)
- [The 3 Golden Rules of Sticky Menu Navigation | Contentsquare](https://contentsquare.com/blog/the-3-golden-rules-of-sticky-menu-navigation/)

---
*Feature research for: Continua - Personality Assessment Platform Informational Website*
*Researched: 2026-02-11*
*Confidence: MEDIUM (WebSearch verified with multiple credible sources; Context7 not available for this domain)*
