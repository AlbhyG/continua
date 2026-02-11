# Coding Conventions

**Analysis Date:** 2026-02-11

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `layout.tsx`, `page.tsx`)
- Directories: lowercase with hyphens for multi-word names
- Configuration files: camelCase with descriptive names (e.g., `next.config.ts`)

**Functions:**
- Component functions: PascalCase (e.g., `RootLayout`, `Home`)
- Type exports: PascalCase (e.g., `Metadata`)
- Event handlers: camelCase (not currently used, would follow React conventions)

**Variables:**
- Constants and types: camelCase or PascalCase for types
- React props: camelCase (e.g., `children`)
- Destructured parameters: camelCase

**Types:**
- Type declarations: PascalCase (e.g., `Metadata` from Next.js)
- Utility types: Use `Readonly<>` for immutable props

## Code Style

**Formatting:**
- Next.js uses ESLint by default (configured via `npm run lint` in `package.json`)
- No explicit Prettier config found; relies on Next.js defaults
- Indentation: 2 spaces (inferred from source files)
- Quotes: Double quotes for JSX attributes and strings

**Linting:**
- Tool: ESLint (via Next.js built-in configuration)
- Run: `npm run lint`
- Key rule observed: TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)

**Observed Patterns from Source:**
```typescript
// Type imports at top
import type { Metadata } from "next";

// Readonly pattern for props
Readonly<{
  children: React.ReactNode;
}>

// Default export for page/layout components
export default function RootLayout({ children }: Readonly<{...}>) {
  return (...)
}
```

## Import Organization

**Order:**
1. Type imports from external libraries (e.g., `import type { Metadata } from "next"`)
2. Regular imports (currently none in example files)
3. Component/content in JSX

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Used for absolute imports from src directory

**Pattern Observed:**
```typescript
// Type imports first
import type { Metadata } from "next";

// Then functional code/exports
export const metadata: Metadata = { ... };
export default function RootLayout(...) { ... }
```

## Error Handling

**Patterns:**
- No error handling patterns observed in current codebase (minimal code)
- Next.js error boundary patterns would apply for page-level errors
- Recommended: Use try-catch for async operations
- Recommended: Implement error.tsx for route-level error handling

## Logging

**Framework:** console (browser/server native console)

**Patterns:**
- No logging currently implemented
- When implementing: Use `console` for server-side (layout.tsx, server components)
- Client-side logging: Minimize console usage in production

## Comments

**When to Comment:**
- Comments are minimal in current codebase
- Only use comments for non-obvious logic or workarounds
- Self-documenting code preferred (descriptive function/variable names)

**JSDoc/TSDoc:**
- Metadata type from Next.js uses type annotations
- No custom JSDoc observed; recommend using JSDoc for exported functions

## Function Design

**Size:**
- Keep functions under 50 lines when possible
- Layout and page components in current codebase are small (15-20 lines)

**Parameters:**
- Use destructuring for component props
- Always type props explicitly
- Use `Readonly<>` for immutable prop objects

**Return Values:**
- React components return JSX.Element
- Explicitly type all return values
- Use `React.ReactNode` for flexible children props

## Module Design

**Exports:**
- Named exports for utilities and helpers (not yet present)
- Default exports for Next.js page/layout components (observed pattern in `layout.tsx`, `page.tsx`)
- Type exports: `export type { TypeName }`

**Barrel Files:**
- Not currently used; add if creating component libraries
- Pattern would be: `src/components/index.ts` with `export { ComponentA } from './A'`

## Next.js Specific Patterns

**App Router Structure:**
- Routes defined by directory structure under `src/app/`
- `layout.tsx` for shared layout wrapping child routes
- `page.tsx` for route content
- Components and metadata at route level

**Metadata:**
- Use Next.js `Metadata` type for page/layout metadata
- Define as exported constant: `export const metadata: Metadata = { ... }`

**TypeScript Strict Mode:**
- Enabled globally (`tsconfig.json: "strict": true`)
- All values must be properly typed
- No implicit `any` types

## Style System

Per `/docs/style-guide.md`, Tailwind CSS v4 is configured via CSS `@theme` directive:
- No `tailwind.config.js` file
- Styling: Inline Tailwind utility classes or CSS modules
- Color tokens defined in CSS (e.g., `--color-foreground: rgb(7, 7, 8)`)
- Responsive design: Mobile-first with `md` breakpoint at 768px

---

*Convention analysis: 2026-02-11*
