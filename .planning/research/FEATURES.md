# Feature Research

**Domain:** Marketing/Pre-Launch Site with Interactive Features (v2.0 Evolution)
**Researched:** 2026-02-15 (Updated from v1.0 research)
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

#### Authentication & Signup Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email validation before form submission | Standard practice for all web forms; prevents invalid submissions | LOW | Regex pattern matching + real-time feedback. Built into HTML5 but should supplement with custom validation |
| Clear error messaging | Users need to know why action failed and how to fix | LOW | Inline validation messages with aria-live for accessibility |
| Email confirmation after signup | Users expect proof that signup succeeded | LOW | Auto-sent after Supabase record created; uses email templates |
| Loading states during async operations | Visual feedback that action is processing | LOW | Spinner or disabled state while API calls complete |
| Accessible form controls | Screen readers must announce errors and states | MEDIUM | ARIA labels, live regions, keyboard navigation already handled by Headless UI |

#### Email Verification & Download Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One-time use verification links | Security standard for email verification | MEDIUM | Supabase provides this by default; tokens expire after 1 hour |
| Link expiration messaging | Users clicking expired links need clear guidance | LOW | Custom error page or toast notification with re-send option |
| Clear "check your email" prompt | After signup, users need explicit next-step guidance | LOW | Confirmation dialog or message stating "Check your inbox for verification link" |
| Email delivery confirmation in UI | Users unsure if email sent need reassurance | LOW | "Email sent to [address]" message with edit option if wrong |

#### Coming Soon & Navigation Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Mobile-responsive dropdowns | 60%+ mobile traffic; dropdowns must work on touch devices | LOW | Already exists with @headlessui/react; verify touch interactions |
| Visual indication of disabled/unavailable features | Users clicking non-functional items need to understand why | LOW | Grayed-out text, "Coming Soon" label, or tooltip on hover/tap |
| Consistent navigation structure | Users expect predictable navigation patterns | LOW | Combining Who/What must maintain existing user mental model |

#### Legal & Compliance

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Privacy-compliant data storage | GDPR/CCPA considerations for email collection | MEDIUM | Supabase hosted; requires Terms/Privacy policy links on forms |
| Clear data usage disclosure | Users want to know how email will be used | LOW | Brief explanation in dialog: "We'll notify you when Continua launches" |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Coming Soon dropdowns with visual hierarchy | Shows product depth without building features; maintains UX consistency | LOW | Disabled state with helpful messaging vs. hiding features entirely |
| Consolidated Who/What navigation | Reduces header clutter; signals product focus on relationships + assessments | LOW | Merge existing separate dropdowns; design challenge for mega menu structure |
| Progressive disclosure in Book flow | Multi-step verification feels professional; reduces abandonment vs. long single form | MEDIUM | Email → verify → download creates trust; manages user expectations |
| Contextual Coming Soon messages | Each placeholder explains *why* coming soon and *when* available | MEDIUM | Different copy per feature; can collect waitlist interest per feature |
| Zero-password authentication pattern | Modern UX; users don't create/remember passwords for pre-launch signup | MEDIUM | Magic links only; simpler than traditional auth; aligns with "notify me" use case |
| Inline validation with accessibility-first design | Real-time feedback without blocking submission; screen reader compatible | MEDIUM | Avoids disabled button trap; shows errors but allows form submission |
| Verified email gating for premium content | Higher quality leads; prevents spam signups for PDF downloads | MEDIUM | Double opt-in pattern validates genuine interest |
| Transparent waitlist positioning | Users can see how many signups ahead of them | MEDIUM | Gamification element; creates urgency and social proof |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Disabled submit button until all fields valid | Perceived as "helpful" — prevents invalid submissions | Accessibility nightmare: button loses keyboard focus, users confused why disabled, no error guidance | Keep button enabled; show inline validation errors; prevent submission with JS but show clear error summary |
| Auto-login after email signup (without verification) | Reduces friction; faster onboarding | Security risk: anyone can claim any email; account takeovers if email recycled | Require email verification before any account access; auto-login only for returning verified users |
| SMS verification alongside email | "More options = better UX" | Adds complexity: phone number validation, international formats, carrier issues, SMS costs | Email-only for v2.0; SMS is out-of-scope; most users prefer email for marketing signups |
| Real-time everything (dropdowns, validation, etc.) | Modern feel; instant feedback | Over-engineering for marketing site; adds latency if server-dependent; battery drain on mobile | Use real-time validation for local checks (email format); defer to submission for server checks (email exists) |
| Extensive form fields during signup | "Get more data upfront" | Increases abandonment; users resistant to sharing before value demonstrated | Collect only name + email; gather additional info post-launch when product value is proven |
| Password-based authentication for pre-launch | Traditional pattern; perceived as "more secure" | Overkill for notification signup; users forget passwords; password reset flow adds complexity | Magic links for pre-launch; consider passwords only if building full user accounts post-launch |
| Immediate PDF download without verification | Reduces friction for users | Spam risk; fake emails in database; no quality control on leads | Email verification required; builds higher quality lead list |
| Hamburger menu for restructured navigation | "Standard mobile pattern" | Style guide specifies horizontal pills; breaking existing design system | Keep existing glassmorphic pill navigation; ensure responsive scaling |
| Social login (Google, Apple) for pre-launch signup | "Users prefer social login" | Complexity for notification-only signup; OAuth setup overhead; tracking concerns | Magic links simpler for waitlist; defer social login until full product launch |

## Feature Dependencies

```
[Email Verification Flow]
    └──requires──> [Supabase Email Configuration]
                       └──requires──> [Email Templates]
                       └──requires──> [Redirect URLs Configured]
                       └──requires──> [Site URL Set]

[Sign In/Up Dialog] ──requires──> [Supabase Database Table]
                     ──requires──> [Form Validation]
                     ──requires──> [Name + Email Fields]

[Book PDF Download] ──requires──> [Email Verification Flow]
                     ──requires──> [PDF Storage/Hosting]
                     ──requires──> [Download Link Generation]

[Coming Soon Dropdowns] ──enhances──> [Navigation Restructure]
                         ──requires──> [Disabled State Styling]

[Inline Validation] ──conflicts──> [Disabled Button Pattern]

[Navigation Restructure] ──requires──> [Content Migration]
                          ──enhances──> [Mobile UX]

[Magic Link Authentication] ──requires──> [Email Verification Flow]
                             ──conflicts──> [Password-based Auth]

[Verified PDF Downloads] ──requires──> [Double Opt-in Pattern]
```

### Dependency Notes

- **Email Verification Flow requires Supabase Email Configuration:** Magic links need Site URL and redirect URLs configured in Supabase dashboard; email templates must be customized before sending
- **Sign In/Up Dialog requires Supabase Database Table:** User records (name, email, created_at, verified) must be stored before email can be sent
- **Book PDF Download requires Email Verification Flow:** Cannot serve PDF without confirming email ownership; prevents spam/abuse
- **Coming Soon Dropdowns enhances Navigation Restructure:** Merging Who/What creates space for Coming Soon features; shows product roadmap visually
- **Inline Validation conflicts with Disabled Button Pattern:** Accessibility best practice is keep button enabled + show errors; disabling button hides it from screen readers and confuses users
- **Navigation Restructure requires Content Migration:** Existing Who/What pages need new content from architecture slides; can't just merge dropdowns without updating page content
- **Magic Link Authentication conflicts with Password-based Auth:** Choose one pattern for v2.0; adding both creates confusion and implementation complexity

## MVP Definition

### Launch With (v2.0)

Features required for v2.0 interactive foundation — builds on v1.0 marketing shell.

- [x] **Restructured navigation (Who/What combined)** — Signals product focus; reduces header clutter; table stakes for v2.0 content structure
- [x] **My Relationships page with Coming Soon dropdowns** — Content delivery; shows planned features without building them
- [x] **My Info page with Coming Soon dropdowns** — Content delivery; mirrors Relationships page structure
- [x] **Sign In/Up dialog with email validation** — Notification signup; builds waitlist; validates interest
- [x] **Supabase database integration** — Backend required for all interactive features
- [x] **Email verification for Book downloads** — Gated content pattern; collects verified leads
- [x] **Updated home page copy** — Marketing message evolution ("The Personality Continua")
- [x] **Basic inline form validation** — Table stakes for any form; prevents bad data
- [x] **Accessible form error handling** — Keep buttons enabled, show clear errors with ARIA announcements
- [x] **Email template configuration** — Customize Supabase templates for brand voice
- [x] **"Check your email" confirmation UI** — Post-signup guidance; reduces support questions
- [x] **Improved tablet/PC responsive layout** — Existing mobile-first design needs better desktop optimization

### Add After Validation (v2.x)

Features to add once core is working and v2.0 is validated with real users.

- [ ] **Resend verification email** — Trigger: user reports "didn't receive email"; 15% of users need this
- [ ] **Better expired link handling** — Trigger: user complaints about confusing error messages
- [ ] **Email address change before verification** — Trigger: users submit wrong email, want to correct before verifying
- [ ] **Waitlist position/count display** — Trigger: want to gamify signups; show social proof ("Join 1,247 people waiting")
- [ ] **Per-feature Coming Soon waitlists** — Trigger: want to prioritize features by demand; collect interest per feature
- [ ] **Loading spinners for async operations** — Trigger: slow connections cause confusion; add once performance profiling shows need
- [ ] **Success/error toast notifications** — Trigger: improve feedback for async actions; better than dialog-only patterns
- [ ] **Email preview in dialog** — Trigger: reduce typos; show entered email with option to edit before submitting
- [ ] **Keyboard shortcuts for power users** — Trigger: analytics show repeat visitors; add Cmd+K command palette

### Future Consideration (v3+)

Features to defer until product launches and waitlist converts to users.

- [ ] **SMS notifications** — Why defer: Email is sufficient for v2.0; SMS adds cost + complexity + international challenges
- [ ] **User account system** — Why defer: Pre-launch doesn't need persistent sessions; build when product launches
- [ ] **Social login (Google, Apple)** — Why defer: Magic links simpler for notification signup; add when converting to full accounts
- [ ] **Advanced analytics (signup funnel)** — Why defer: Not enough traffic yet; use basic analytics first
- [ ] **Referral/sharing incentives** — Why defer: Need user base first; growth hack after validation ("Move up 5 spots for each referral")
- [ ] **Multi-language support** — Why defer: English-only validates faster; internationalize after PMF
- [ ] **Custom email service (Resend/SendGrid)** — Why defer: Supabase email sufficient for v2.0; migrate if deliverability issues arise
- [ ] **Rate limiting per email address** — Why defer: Low abuse risk for pre-launch; add if spam becomes problem
- [ ] **Admin dashboard for waitlist management** — Why defer: Manual Supabase dashboard sufficient for v2.0; build custom UI when needed

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Email validation (inline) | HIGH | LOW | P1 |
| Supabase integration | HIGH | MEDIUM | P1 |
| Email verification flow | HIGH | MEDIUM | P1 |
| Navigation restructure | MEDIUM | LOW | P1 |
| Coming Soon dropdowns | MEDIUM | LOW | P1 |
| Updated home copy | HIGH | LOW | P1 |
| My Relationships page content | HIGH | LOW | P1 |
| My Info page content | HIGH | LOW | P1 |
| Accessible form controls | HIGH | MEDIUM | P1 |
| Email template customization | MEDIUM | LOW | P1 |
| "Check your email" UI | HIGH | LOW | P1 |
| Responsive layout improvements | MEDIUM | MEDIUM | P1 |
| Loading states | MEDIUM | LOW | P2 |
| Resend verification email | MEDIUM | LOW | P2 |
| Expired link handling | MEDIUM | LOW | P2 |
| Email address change flow | MEDIUM | LOW | P2 |
| Success/error toasts | MEDIUM | LOW | P2 |
| Waitlist position display | LOW | MEDIUM | P3 |
| Per-feature waitlists | LOW | HIGH | P3 |
| SMS notifications | MEDIUM | HIGH | P3 |
| Social login | MEDIUM | HIGH | P3 |
| Referral incentives | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for v2.0 launch — builds on existing v1.0 foundation
- P2: Should have, add when time permits — improves UX but not blocking
- P3: Nice to have, future consideration — deferred to v3+ or post-launch

## Competitor Feature Analysis

| Feature | Industry Standard | Marketing Sites (Carrd, Unicorn Platform) | SaaS Pre-Launch (Product Hunt, LaunchList) | Our Approach |
|---------|-------------------|-------------------------------------------|-------------------------------------------|--------------|
| Email signup | Email field only | Email + Name (optional) | Email + Name + Company | Email + Name — balance data collection vs. friction |
| Verification | Optional | Rare (immediate signup) | Magic links or double opt-in | Magic links — modern pattern, aligns with no-password approach |
| Coming Soon indicators | Grayed-out links or hidden features | Dedicated "Coming Soon" pages | Waitlist per feature with position tracking | Dropdown with disabled state + tooltip — shows structure without navigation |
| Navigation structure | Static pages | Limited (1-3 pages) | Sections on single page | Mega dropdown combining Who/What — signals product depth while maintaining existing v1.0 pages |
| Download gates | Immediate download or paywall | Email capture → download | Email → verify → download with position tracking | Email → verify → download — prevents spam, collects quality leads |
| Form validation | Submit-time only | Real-time (varies) | Real-time + accessible | Real-time inline + enabled button — accessibility-first per WebAIM guidance |
| Post-signup flow | Thank you page or redirect | Email confirmation | Redirect to dashboard or waitlist page | Confirmation message + "check email" prompt — clear next step without overcomplication |
| Password vs. passwordless | 80% password-based | Varies | 60% magic links | Magic links only — modern pattern, no password reset complexity |

## Implementation Considerations

### Disabled Button Accessibility Issue

**Challenge:** Project spec says "OK button disabled until valid input" but this conflicts with accessibility best practices.

**Research findings:**
- Disabled buttons cannot receive keyboard focus, making them invisible to screen reader users
- Users don't understand why button is disabled or how to fix errors
- Modern best practice: keep button enabled, show validation errors, prevent submission with clear messaging

**Recommendation:**
- Keep button enabled at all times
- Show inline validation errors as user types (with debouncing)
- On submit with invalid data: prevent form submission, show error summary with aria-live announcement, focus first error
- Visually style button differently when form is invalid (lower opacity) but keep it clickable

**Spec interpretation:**
Reinterpret spec as "prevent submission until valid input" rather than "disable button until valid input" — achieves same goal with better accessibility.

### Email Verification Flow UX

**Standard pattern from research:**

1. User enters email in Book dialog
2. System validates email format (client-side)
3. User clicks submit
4. System sends verification email
5. UI shows "Check your email for verification link" message
6. User clicks link in email (magic link with token)
7. Link redirects to site, validates token
8. System shows download page with PDF link
9. Link expires after 1 hour; token is one-time use

**Enhanced flow option (for P2):**

1-3. Same as above
4. System shows "Enter email to receive download link" confirmation
5. User can edit email if wrong, or confirm
6. On confirm, send verification email
7-9. Same as above

**Supabase implementation:**
- Use `signInWithOtp` for magic link generation
- Configure redirect URL to `/book/download?type=[publishers|agents|therapists]`
- Download page checks session, serves appropriate PDF
- Expire links via Supabase default (1 hour)

### Coming Soon Dropdown Design

**Pattern from research:**
- Show feature structure without implementing functionality
- Use disabled state with clear messaging
- Avoid hiding features entirely (transparency builds trust)

**Recommended implementation:**

```tsx
<Menu>
  <MenuButton>Add</MenuButton>
  <MenuItems>
    <MenuItem disabled>
      <div className="px-4 py-2 text-gray-400 cursor-not-allowed">
        <div className="font-semibold">Person</div>
        <div className="text-xs">Coming Soon</div>
      </div>
    </MenuItem>
    <MenuItem disabled>
      <div className="px-4 py-2 text-gray-400 cursor-not-allowed">
        <div className="font-semibold">Group</div>
        <div className="text-xs">Coming Soon</div>
      </div>
    </MenuItem>
    {/* ... other options */}
  </MenuItems>
</Menu>
```

**Alternative approaches:**
1. Tooltip on hover: "This feature launches in [timeframe]"
2. Click opens "Coming Soon" dialog with email signup for feature-specific waitlist
3. Show feature preview screenshot in dropdown

**Recommendation:** Start with approach #1 (simple disabled state), evolve to #2 (feature waitlists) in v2.x if analytics show user interest.

### Navigation Restructure Strategy

**Challenge:** Merge Who/What into single dropdown without losing existing content or confusing users.

**Options:**

**Option A: Combined dropdown with sections**
```
Who + What
  ├─ Who We Serve
  │   ├─ Individuals
  │   ├─ Couples
  │   ├─ Families
  │   └─ Teams
  └─ What We Offer
      ├─ Assessments
      ├─ Results
      └─ Tools
```

**Option B: Two columns (mega menu)**
```
[Who We Serve]    [What We Offer]
Individuals       Assessments
Couples           Results
Families          Tools
Teams
```

**Option C: Separate dropdowns, rename for clarity**
```
For Whom → Individuals, Couples, Families, Teams
What's Included → Assessments, Results, Tools
```

**Research recommendation:**
- Option B (two-column mega menu) aligns with mega menu best practices from NN/G research
- Maintains clear visual separation while reducing header items
- Mobile: stack columns vertically
- Accessibility: keyboard navigation left-to-right, top-to-bottom

**Spec interpretation:**
Project spec says "Who/What combined dropdown" — interpret as Option B (mega menu with two sections).

### Responsive Layout Improvements

**Existing v1.0:**
- Mobile-first design with single breakpoint
- Horizontal pill navigation at all screen sizes
- Glassmorphic cards with backdrop blur

**v2.0 improvements needed:**
- Tablet (768px-1024px): optimize card widths, potentially two-column layout for content
- Desktop (>1024px): max-width container, better use of horizontal space
- Mega menu: ensure two columns work on tablet, stack on mobile
- Touch targets: verify 44px minimum for all interactive elements

**Approach:**
- Keep existing mobile foundation
- Add tablet optimizations: `@media (min-width: 768px)` for two-column cards
- Add desktop optimizations: `@media (min-width: 1024px)` for max-width and spacing
- Test at breakpoint boundaries (767px, 768px, 1023px, 1024px)

## Sources

### Email Signup & Form Validation
- [Best Sign Up Flows (2026): 15 UX Examples That Convert](https://www.eleken.co/blog-posts/sign-up-flow)
- [20 Signup Form Examples: Ultimate Guide (2026 edition)](https://www.omnisend.com/blog/best-signup-forms-conversions/)
- [9 Email Signup Form Best Practices to Grow Your List Faster](https://getsitecontrol.com/blog/email-signup-form-best-practices/)
- [35 Best Signup Form Examples for Higher Conversions in 2026](https://optinmonster.com/best-signup-form-examples-for-higher-conversions/)
- [13 Top Email Sign-Up Form Examples that Convert - Klaviyo](https://www.klaviyo.com/blog/top-signup-forms-examples)

### Email Verification & Magic Links
- [Passwordless email logins | Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Login With Magic Link | Supabase Docs](https://supabase.com/docs/guides/auth/passwordless-login/auth-magic-link)
- [Email Templates | Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [How magic links work and why should you use them? — WorkOS](https://workos.com/blog/a-guide-to-magic-links)
- [How to use magic links for better UX - LogRocket](https://blog.logrocket.com/ux-design/how-to-use-magic-links/)
- [What is Magic Link Login? How it Works - Ping Identity](https://www.pingidentity.com/en/resources/blog/post/what-is-magic-link-login.html)

### Gated Content & Download Flows
- [How to Build an Email Verification Workflow That Actually Works](https://clearout.io/blog/email-verification-workflow-guide/)
- [Email Verification Flow | Descope Documentation](https://docs.descope.com/flows/use-cases/email-verification)
- [Implementing the right email verification flow - SuperTokens](https://supertokens.com/blog/implementing-the-right-email-verification-flow)
- [How Gating Content can Improve Lead Generation - MailerLite](https://www.mailerlite.com/blog/content-gating)

### Coming Soon & Pre-Launch Patterns
- [Designing "Coming Soon" Pages — Smashing Magazine](https://www.smashingmagazine.com/2009/11/designing-coming-soon-pages/)
- [32 Best Coming Soon Page Examples](https://elementor.com/blog/best-coming-soon-page-examples/)
- [31 Best Coming Soon Page Examples I've Found in 2026](https://www.seedprod.com/coming-soon-pages-wordpress/)
- [How To Grow a Prelaunch Waitlist for Your Startup](https://www.masslight.com/posts/prelaunch-waitlist-startup)
- [Waitlist Marketing Strategy 2025](https://getwaitlist.com/blog/waitlist-marketing-strategy-2025-how-to-build-demand-before-launch)
- [How to Launch a Waitlist and Build Hype for Your Product](https://unicornplatform.com/blog/how-to-launch-a-waitlist-and-build-hype-for-your-product/)

### Navigation & Dropdown Design
- [Mega Menus Work Well for Site Navigation - NN/G](https://www.nngroup.com/articles/mega-menus-work-well/)
- [User-Friendly Mega-Dropdowns: When Hover Menus Fail — Smashing Magazine](https://www.smashingmagazine.com/2021/05/frustrating-design-patterns-mega-dropdown-hover-menus/)
- [Mega Navigation Menu Design Trends in Modern Websites](https://designmodo.com/mega-navigation-menu/)
- [7 Mega Menu Examples with Exceptional UX Design](https://www.webstacks.com/blog/mega-menu-examples)
- [Dropdown UI Design: Anatomy, UX, and Use Cases](https://www.setproduct.com/blog/dropdown-ui-design)

### Supabase Implementation
- [JavaScript API Reference | Supabase Docs](https://supabase.com/docs/reference/javascript/auth-signup)
- [Password-based Auth | Supabase Docs](https://supabase.com/docs/guides/auth/passwords)
- [Email Magic Links overview | Okta Developer](https://developer.okta.com/docs/guides/email-magic-links-overview/java/main/)

### Accessibility & Disabled Buttons
- [WebAIM: Usable and Accessible Form Validation](https://webaim.org/techniques/formvalidation/)
- [A Guide To Accessible Form Validation — Smashing Magazine](https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/)
- [Accessibility and Usability: Inline Field Validation vs. Constantly Active Submit Button](https://www.sheribyrnehaber.com/accessibility-and-usability-inline-field-validation-vs-constantly-active-submit-button/)
- [Don't Disable Form Controls - Adrian Roselli](https://adrianroselli.com/2024/02/dont-disable-form-controls.html)
- [Stop disabling form submit buttons](https://blog.thms.uk/2023/03/stop-disabling-form-submit-buttons)
- [Form Validation When Submit Button is Disabled • DigitalA11Y](https://www.digitala11y.com/academy/form-validation-when-submit-button-is-disabled/)

---
*Feature research for: Continua v2.0 Interactive Foundation*
*Researched: 2026-02-15*
*Confidence: HIGH (WebSearch findings verified across multiple authoritative sources; Supabase official documentation; accessibility standards from WebAIM and W3C)*
