# Codebase Structure

**Analysis Date:** 2026-02-11

## Directory Layout

```
continua/
├── .claude/              # Claude configuration
├── .git/                 # Git repository
├── .planning/            # Planning and documentation
│   └── codebase/         # Codebase analysis documents
├── docs/                 # Project documentation
│   ├── high-level-plan.md
│   ├── style-guide.md    # Design system and UI patterns
│   └── web-architecture.md  # Feature and page specifications
├── public/               # Static assets
│   └── logo.png         # Continua rainbow arc logo (72x48px in header)
├── src/                  # Source code
│   └── app/             # Next.js App Router
│       ├── layout.tsx   # Root layout with metadata
│       └── page.tsx     # Home page component
├── .gitignore           # Git ignore patterns
├── CLAUDE.md            # Project instructions
├── package.json         # Dependencies and scripts
├── package-lock.json    # Locked dependency versions
├── tsconfig.json        # TypeScript configuration
└── next.config.ts       # Next.js configuration
```

## Directory Purposes

**`.planning/codebase/`:**
- Purpose: Stores codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Contains: Markdown analysis documents
- Key files: `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `CONCERNS.md`, `STACK.md`, `INTEGRATIONS.md`

**`docs/`:**
- Purpose: User-facing project documentation
- Contains: Design system, architecture decisions, feature specifications
- Key files: `style-guide.md` (color palette, typography, components), `web-architecture.md` (page layouts, navigation structure)

**`public/`:**
- Purpose: Static assets served directly by Next.js
- Contains: Images and other immutable files
- Key files: `logo.png` (rainbow arc logo, used in header)

**`src/`:**
- Purpose: All application source code
- Contains: TypeScript components, logic, utilities
- Key files: Application entry points and route components

**`src/app/`:**
- Purpose: Next.js App Router configuration and page routes
- Contains: Layout components and page components following App Router structure
- Key files: `layout.tsx` (root layout), `page.tsx` (home page at `/`)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapper providing metadata and HTML structure
- `src/app/page.tsx`: Home page component rendered at `/` route

**Configuration:**
- `tsconfig.json`: TypeScript compiler options with `"strict": true` and path alias `@/*` → `./src/*`
- `next.config.ts`: Next.js build and runtime configuration
- `package.json`: Project dependencies (Next.js 15, React 19, TypeScript 5)

**Core Logic:**
- `src/app/page.tsx`: Home page with centered heading
- `src/app/layout.tsx`: Root wrapper with page title and HTML structure

**Testing:**
- Not yet implemented

**Documentation:**
- `docs/style-guide.md`: Design system (colors, typography, components, layout patterns)
- `docs/web-architecture.md`: Feature specifications (header, dropdowns, page text)

## Naming Conventions

**Files:**
- Layout files: `layout.tsx` (App Router convention)
- Page files: `page.tsx` (App Router convention)
- Configuration: lowercase with dashes (e.g., `next.config.ts`, `tsconfig.json`)
- Components: PascalCase when exported as named components

**Directories:**
- Route directories: lowercase (e.g., `app/`)
- Source structure: lowercase (e.g., `src/`)
- Special directories use square brackets for dynamic routes (future pattern): `[id]/`

## Where to Add New Code

**New Page/Route:**
- Create directory under `src/app/` matching the route path
- Add `page.tsx` file in that directory
- Example: `src/app/who/page.tsx` for `/who` route
- Add `layout.tsx` in directory if custom layout needed for that route tree

**New Component:**
- Create `src/app/components/` directory (does not exist yet)
- Use PascalCase filenames: `Header.tsx`, `Navigation.tsx`
- Export as default or named export with type definitions

**Shared Utilities:**
- Create `src/lib/` directory (does not exist yet) for utility functions
- Create `src/utils/` directory (does not exist yet) for helper functions
- Pattern: small, focused utility modules

**Styling:**
- Use Tailwind CSS utility classes directly in JSX
- Reference color tokens: `rgba(67, 117, 237, 0.92)` for accent blue
- Follow mobile-first responsive design (no breakpoint for mobile, `md:` for 768px+)
- See `docs/style-guide.md` for complete design token reference

**Type Definitions:**
- Define types inline in component files or co-locate in same directory
- Create `src/types/` directory (does not exist yet) for shared type definitions
- Use TypeScript strict mode for all files

## Special Directories

**`.next/`:**
- Purpose: Build output from Next.js compilation
- Generated: Yes (by `npm run build` or `npm run dev`)
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

**`.git/`:**
- Purpose: Git version control
- Contains: Commit history and branch information
- Committed: N/A (Git internal)

## Import Path Aliases

**Configured in `tsconfig.json`:**
- `@/*` → `./src/*`
- Usage: `import Header from '@/app/components/Header'` instead of `import Header from '../../../app/components/Header'`

---

*Structure analysis: 2026-02-11*
