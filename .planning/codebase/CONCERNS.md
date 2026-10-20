# Codebase Concerns

**Analysis Date:** 2026-02-11

## Missing Critical Infrastructure

**Testing Framework:**
- Issue: No testing framework configured despite TypeScript and React in use
- Files: `package.json` lacks any test runner (Jest, Vitest, etc.)
- Impact: Cannot validate component behavior, API endpoints, or business logic. Risk of regressions in future development.
- Fix approach: Add Jest or Vitest to `package.json` with configuration. Create `.test.tsx` files co-located with components in `src/app/`.

**Linting & Code Quality:**
- Issue: No ESLint or Prettier configuration detected
- Files: No `.eslintrc.*`, `eslint.config.*`, or `.prettierrc` files
- Impact: No automated code style enforcement. Risk of inconsistent formatting and code quality across team contributions.
- Fix approach: Add ESLint config aligned with the style guide (`docs/style-guide.md`). Use Prettier for consistent formatting. Add pre-commit hooks via husky.

**Type Safety Gap:**
- Issue: TypeScript configured with `skipLibCheck: true` which skips type checking on dependencies
- Files: `tsconfig.json` line 6
- Impact: May miss type errors from third-party libraries. Reduces confidence in type safety.
- Fix approach: Enable `skipLibCheck: false` and fix any resulting type errors. Use `@types/` packages for untyped libraries.

## Styling Implementation Mismatch

**Inline Styles in Page Component:**
- Issue: `src/app/page.tsx` uses inline `style` prop rather than Tailwind CSS
- Files: `src/app/page.tsx` lines 3-10
- Impact: Deviates from style guide which specifies Tailwind CSS. Makes component harder to maintain and inconsistent with future components.
- Fix approach: Convert inline styles to Tailwind utility classes. Apply spacing, typography, and layout patterns from `docs/style-guide.md`.

**Missing Tailwind Configuration:**
- Issue: Style guide references Tailwind CSS v4 with CSS `@theme` directive, but no `tailwind.config.js` or `globals.css` with theme configuration detected
- Files: No `src/globals.css` or `tailwind.config.ts` found
- Impact: Cannot implement glassmorphism cards, gradients, or color tokens defined in style guide. Design system will be fragmented.
- Fix approach: Create `src/globals.css` with `@theme` directive exposing color tokens and gradients. Configure Tailwind in PostCSS.

## Missing Assets

**Logo Asset:**
- Issue: Style guide references `/public/logo.png` but file not found in repository
- Files: `/public/logo.png` missing (referenced in `docs/style-guide.md` line 7)
- Impact: Cannot render header logo. Breaks visual identity and brand consistency.
- Fix approach: Add `logo.png` (72x48px) to `/public/` directory. File should be a colorful arc of dashed segments in rainbow colors (red, orange, yellow, green, blue, purple, magenta).

**Font Asset:**
- Issue: Style guide specifies Inter font via `@font-face` from `fonts.gstatic.com`, but not loaded in layout
- Files: `src/app/layout.tsx` missing font import
- Impact: Page will fallback to system fonts. Typography will not match design system specifications.
- Fix approach: Add Inter font import in `src/app/layout.tsx` or `src/globals.css` using Google Fonts CDN or local files.

## Architecture Gaps

**Missing Layout Components:**
- Issue: Design system specifies fixed header, centered content layout with specific padding/max-width, but no header/layout components exist
- Files: `docs/style-guide.md` describes header structure (lines 106-154) but no implementation
- Impact: Cannot build navigation. Home page layout doesn't match design specification.
- Fix approach: Create `src/components/Header.tsx` with logo, navigation dropdowns. Update layout.tsx to include Header and apply `pt-80px` to main content area.

**No Component Structure:**
- Issue: No `src/components/` directory exists. Only page components in `src/app/`
- Files: Missing `src/components/` directory
- Impact: Cannot reuse UI elements (cards, buttons, dropdown panels, progress bars). Design system will require duplication.
- Fix approach: Create `src/components/` with reusable components: Card, Button, DropdownMenu, ProgressBar, etc. following style guide patterns.

## Database & Backend Not Addressed

**No API Routes:**
- Issue: Architecture document (`docs/web-architecture.md`) describes complex features (assessments, results filtering, team management) but no backend implementation exists
- Files: No `src/app/api/` directory
- Impact: Frontend cannot persist data. Cannot support authentication, tests, results storage, or cohort management.
- Fix approach: Create API routes for core entities: assessments, results, users, teams, cohorts. Plan database schema.

**No Authentication:**
- Issue: Header specifies "Sign In" button and style guide mentions dropdowns for Publishers, Agents, Therapists, but no auth implementation
- Files: No auth middleware or auth context
- Impact: Cannot protect routes or manage user sessions. Cannot implement role-based access (Individuals, Couples, Families, Teams).
- Fix approach: Integrate authentication provider (NextAuth.js, Supabase, or custom). Add auth middleware to layout or API routes.

**No Database Configuration:**
- Issue: No database client or ORM configured (no Prisma, Supabase, MongoDB client, etc.)
- Files: `package.json` has no database dependencies
- Impact: Cannot store assessments, user profiles, test results, or relationships. Feature development is blocked.
- Fix approach: Choose database (PostgreSQL/Supabase recommended for relationships). Add ORM (Prisma) and environment variables for connection.

## Deployment & Environment Concerns

**No Environment Variable Schema:**
- Issue: Style guide and architecture document imply configuration needs (auth, database) but `.env.example` or documented env vars missing
- Files: No `.env.example` file
- Impact: Developers cannot know what configuration is required. Production deployment may fail due to missing secrets.
- Fix approach: Create `.env.example` with all required variables (database URL, auth provider keys, API endpoints). Document in README.

**Bare Next.js Configuration:**
- Issue: `next.config.ts` is empty
- Files: `next.config.ts` (lines 1-5)
- Impact: No customization for build, fonts, images, or redirects. May miss performance optimizations.
- Fix approach: Add image optimization config, font loaders, rewrites for API routes, and compression settings.

## Documentation Gaps

**No README:**
- Issue: No README.md with setup instructions, project overview, or architecture guide
- Files: Missing `README.md`
- Impact: New developers cannot understand how to run the project or what it does. No quick start guide.
- Fix approach: Create README.md with project description, setup instructions, running dev server, and links to architecture docs.

**Architecture Documentation Misalignment:**
- Issue: `docs/high-level-plan.md` is an old plan (December 7, 2025), but `docs/web-architecture.md` (February 10, 2026) is the current spec. Two documents describe similar but slightly different features.
- Files: `docs/high-level-plan.md` vs `docs/web-architecture.md`
- Impact: Confusing for developers. Risk of implementing from wrong spec or duplication of effort.
- Fix approach: Archive or delete `docs/high-level-plan.md`. Keep only `docs/web-architecture.md` as single source of truth.

## Build & Bundle Concerns

**Turbopack in Development:**
- Issue: `package.json` uses Next.js with `--turbopack` flag (line 6: `"dev": "next dev --turbopack"`)
- Files: `package.json`
- Impact: Turbopack is experimental and unstable. May cause unexpected build failures or performance regressions.
- Fix approach: Remove `--turbopack` flag for stability until project reaches production-ready state. Benchmark performance gain before re-enabling.

## Type Definition Completeness

**React 19 Component Typing:**
- Issue: Project uses React 19 with `children: React.ReactNode` pattern in `layout.tsx`, but no global type definitions for component props
- Files: `src/app/layout.tsx` lines 8-12
- Impact: As more components are added, prop interfaces will be inconsistent. May lead to runtime errors with unchecked props.
- Fix approach: Create `src/types/index.ts` with common component prop types. Use `React.FC<Props>` with proper typing across all components.

---

*Concerns audit: 2026-02-11*
