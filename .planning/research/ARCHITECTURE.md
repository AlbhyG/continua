# Architecture Research

**Domain:** Multi-page informational website on Next.js 15 App Router
**Researched:** 2026-02-11
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Root Layout (Server)                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │            Header (Client Component)                │     │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────┐ │     │
│  │  │  Logo   │  │ Who ▾    │  │ What ▾   │  │Sign │ │     │
│  │  │         │  │ Dropdown │  │ Dropdown │  │ In  │ │     │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────┘ │     │
│  └────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                     Page Content (Server)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Home Page / Who Page / What Page / Book Page       │    │
│  │  (Static content rendered as Server Components)     │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                 Dialog/Modal Layer (Client)                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Form Dialogs (Publishers/Agents/Therapists forms)  │    │
│  │  Triggered from Book page dropdown                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Root Layout | HTML structure, global styles, font loading, wraps all pages | Server Component with Inter font, Tailwind CSS v4, gradient background |
| Header | Fixed navigation bar with logo and dropdown menus | Client Component for interactivity, preserves state across navigation |
| Dropdown Menu | Manage open/close state, handle click-outside-to-close, position absolutely | Client Component with local state or headless UI library |
| Page Components | Render static content for each route (/who, /what, /book) | Server Components for SEO and performance |
| Dialog/Modal | Overlay forms for Publishers/Agents/Therapists | Client Component with URL-synced state for shareability |
| Text Content | Long-form text with proper spacing and typography | Server Component, could be extracted to separate files/components |

## Recommended Project Structure

```
src/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx          # Root layout (Server Component)
│   ├── page.tsx            # Home page (Server Component)
│   ├── who/                # Who page route
│   │   └── page.tsx        # (Server Component)
│   ├── what/               # What page route
│   │   └── page.tsx        # (Server Component)
│   ├── book/               # Book page route
│   │   └── page.tsx        # (Server Component)
│   └── globals.css         # Tailwind CSS v4 with @theme directive
│
├── components/             # Shared components (organized by type)
│   ├── layout/             # Layout-specific components
│   │   ├── Header.tsx      # Fixed header with logo and nav (Client)
│   │   ├── Logo.tsx        # Logo component with home link
│   │   └── Navigation.tsx  # Navigation pills container
│   │
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Dropdown.tsx    # Dropdown menu component (Client)
│   │   ├── Dialog.tsx      # Modal dialog component (Client)
│   │   └── Button.tsx      # Button component (can be Server or Client)
│   │
│   └── forms/              # Form-related components
│       ├── PublisherForm.tsx      # (Client)
│       ├── AgentForm.tsx          # (Client)
│       └── TherapistForm.tsx      # (Client)
│
├── lib/                    # Utility functions and constants
│   └── content.ts          # Page content as constants/exports
│
└── types/                  # TypeScript type definitions
    └── index.ts            # Shared types
```

### Structure Rationale

- **app/ directory:** Follows Next.js 15 App Router conventions where folders define routes and special files (layout.tsx, page.tsx) define UI. Each route segment gets its own folder.

- **components/ organized by purpose:** Layout components are separated from reusable UI primitives and form components. This follows the "three-tier component structure" pattern where UI primitives live separately from layout components and feature-specific components.

- **Client boundaries at component level:** Only interactive components (Header, Dropdown, Dialog, Forms) use "use client" directive. Page content remains as Server Components for optimal performance and SEO.

- **lib/ for utilities:** Extracting long-form text content into lib/content.ts keeps page components clean and makes content management easier.

- **No route groups needed:** For a simple 4-page site, route groups (folderName) would add unnecessary complexity. Direct folders for each route are clearer.

## Architectural Patterns

### Pattern 1: Server Component by Default, Client When Needed

**What:** All components are Server Components by default. Only mark components as Client Components (with "use client" directive) when they need interactivity, state, effects, or browser APIs.

**When to use:** This is the foundational pattern for all Next.js 15 App Router apps, especially static informational sites.

**Trade-offs:**
- **Pros:** Better performance (less JavaScript shipped), better SEO (HTML rendered on server), faster initial page load, can access server resources directly
- **Cons:** Requires understanding server/client boundary, can't use React hooks like useState in Server Components

**Example:**
```typescript
// app/who/page.tsx - Server Component (default)
export default function WhoPage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 pt-20">
      <h1 className="text-[32px] font-bold mb-6">Who is Continua For?</h1>
      <section className="space-y-6">
        <div>
          <h2 className="text-[20px] font-bold mb-3">For Individuals</h2>
          <p>Continua helps you see your patterns across different situations...</p>
        </div>
        {/* More content */}
      </section>
    </div>
  )
}

// components/layout/Header.tsx - Client Component (needs state)
'use client'

import { useState } from 'react'
import Logo from './Logo'
import Navigation from './Navigation'

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="fixed top-0 w-full bg-[rgba(67,117,237,0.92)] backdrop-blur z-50">
      <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <Navigation openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
      </div>
    </header>
  )
}
```

### Pattern 2: Composition Pattern for Client Components in Server Components

**What:** Server Components can render Client Components as children. Pass Server Components to Client Components via the children prop to maintain server rendering benefits.

**When to use:** When you need a Client Component wrapper (like Header) but want to keep the content inside as Server Components, or when building layouts that need both server and client rendering.

**Trade-offs:**
- **Pros:** Minimizes client-side JavaScript while maintaining interactivity where needed, clear separation of concerns
- **Cons:** Requires understanding of component boundaries, need to be careful about data flow

**Example:**
```typescript
// app/layout.tsx - Server Component
import Header from '@/components/layout/Header'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-inter">
        <Header /> {/* Client Component */}
        <main>{children}</main> {/* Server Component pages */}
      </body>
    </html>
  )
}

// The Header is a Client Component, but the pages rendered in {children}
// remain Server Components. This composition is key to the architecture.
```

### Pattern 3: Shared Layout with State Preservation

**What:** Layouts in Next.js App Router preserve state across navigation and do not re-render. This is called "partial rendering" - only page components update while layouts remain mounted.

**When to use:** For fixed headers, navigation bars, or any UI that should persist across page transitions.

**Trade-offs:**
- **Pros:** Better UX (no flicker on navigation), maintains dropdown open/close state, preserves scroll position in sidebar/nav
- **Cons:** Layout components stay mounted, so be mindful of effects and subscriptions that shouldn't run on every page

**Example:**
```typescript
// components/layout/Header.tsx
'use client'

import { useState } from 'react'

export default function Header() {
  // This state persists across page navigation because the layout doesn't re-render
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleNavigation = () => {
    // Dropdown state is preserved when using <Link> for navigation
    // User can open "Who" dropdown, click a link, and the dropdown
    // position/state persists until they click outside or navigate away
  }

  return (
    <header>
      {/* Header content */}
    </header>
  )
}
```

### Pattern 4: Click-Outside-to-Close Pattern for Dropdowns

**What:** Dropdowns should close when clicking outside them or when clicking another dropdown trigger. Use useEffect with document-level event listeners.

**When to use:** All dropdown menus and popovers in the application.

**Trade-offs:**
- **Pros:** Expected UX pattern, accessible, handles edge cases
- **Cons:** Need to manage cleanup of event listeners, need to handle refs correctly

**Example:**
```typescript
'use client'

import { useRef, useEffect } from 'react'

export default function Dropdown({ isOpen, onClose, children }) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div ref={dropdownRef} className="absolute mt-2 rounded-xl bg-white/95">
      {children}
    </div>
  )
}
```

### Pattern 5: URL-Synced Modals for Shareability

**What:** Dialog/modal state can be represented in the URL for shareable deep links. Users can refresh the page or share the URL and the modal will open to the same state.

**When to use:** For important dialogs (like the Publisher/Agent/Therapist forms) that users might want to bookmark or share.

**Trade-offs:**
- **Pros:** Shareable URLs, back button closes modal naturally, better UX for deep linking
- **Cons:** More complex than local state, requires understanding of Next.js routing

**Example:**
```typescript
// Option 1: Using search params (simpler, good for this use case)
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'

export default function BookPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const formType = searchParams.get('form') // 'publisher' | 'agent' | 'therapist'

  const openForm = (type: string) => {
    router.push(`/book?form=${type}`)
  }

  const closeForm = () => {
    router.push('/book')
  }

  return (
    <>
      <div>
        <button onClick={() => openForm('publisher')}>Publishers</button>
        <button onClick={() => openForm('agent')}>Agents</button>
        <button onClick={() => openForm('therapist')}>Therapists</button>
      </div>

      <Dialog open={formType === 'publisher'} onClose={closeForm}>
        <PublisherForm />
      </Dialog>
      {/* Similar for agent and therapist */}
    </>
  )
}

// Option 2: Using parallel routes and intercepting routes (more advanced)
// Good for full-page modals with their own URLs like /book/publisher
// See Next.js docs on intercepting routes for this pattern
```

### Pattern 6: Headless UI Pattern for Complex Interactive Components

**What:** Use headless UI libraries (like Headless UI or Radix UI) for complex interactive components like dropdowns, dialogs, and menus. These handle accessibility, keyboard navigation, and state management while you control styling.

**When to use:** For accessible dropdown menus and modals. Especially recommended when building with Tailwind CSS (Headless UI is from the Tailwind team).

**Trade-offs:**
- **Pros:** Handles accessibility (ARIA, keyboard nav, focus management), battle-tested logic, saves development time
- **Cons:** Another dependency, learning curve for the library API

**Example:**
```typescript
'use client'

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'

export default function WhoDropdown() {
  return (
    <Menu>
      <MenuButton className="rounded-full bg-white/20 hover:bg-white/35 px-4 py-1.5">
        Who ▾
      </MenuButton>

      <MenuItems className="absolute mt-2 min-w-[180px] rounded-xl bg-white/95 p-2">
        <MenuItem>
          {({ focus }) => (
            <a
              href="/who#individuals"
              className={`block rounded-lg px-3 py-2 ${
                focus ? 'bg-black/5' : ''
              }`}
            >
              Individuals
            </a>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <a
              href="/who#couples"
              className={`block rounded-lg px-3 py-2 ${
                focus ? 'bg-black/5' : ''
              }`}
            >
              Couples
            </a>
          )}
        </MenuItem>
        {/* More items */}
      </MenuItems>
    </Menu>
  )
}
```

## Data Flow

### Navigation Flow

```
User clicks navigation item
    ↓
Client Component (Header/Dropdown) updates local state
    ↓
Next.js <Link> component triggers client-side navigation
    ↓
App Router performs partial rendering:
  - Layout (Header) stays mounted → state preserved
  - Page component swaps → new Server Component renders
    ↓
User sees new page with same header state
```

### Modal/Dialog Flow

```
User clicks "Publishers" in Book dropdown
    ↓
Client Component calls router.push('/book?form=publisher')
    ↓
URL updates (can be shared/bookmarked)
    ↓
Component re-renders, reads searchParams
    ↓
Dialog component sees open={true} and renders
    ↓
User closes dialog (button or click outside)
    ↓
Client Component calls router.push('/book')
    ↓
URL updates, Dialog sees open={false}, unmounts
```

### Static Content Flow

```
Build time:
  - Next.js runs Server Components
  - Generates static HTML for each page
  - Creates client bundle with only Client Components
    ↓
Request time:
  - Server sends pre-rendered HTML immediately
  - Browser displays content (no loading spinner)
  - Client JavaScript hydrates interactive components
  - Navigation becomes instant (prefetched)
```

### Key Data Flows

1. **Page Navigation:** User interaction in Header (Client) → Next.js routing (client-side) → Page swap (Server Component) → Layout preserved. Data flows one-way down from Server to Client.

2. **Dropdown State:** Local state in Header component → passed down as props to Dropdown components → onClick handlers bubble up to update state → state preserved across page navigation.

3. **Form Submission:** User fills form (Client Component) → validates input → triggers action → displays success/error. For this project, forms are visual-only (no API), so flow ends at display.

## Component Boundaries

### Server/Client Boundary Rules

1. **Server Components (default):**
   - All components in `app/` directory are Server Components unless marked with 'use client'
   - Can access server resources, databases, file system
   - Cannot use React hooks (useState, useEffect, etc.)
   - Cannot use browser APIs
   - Examples: page.tsx files, layout.tsx (root), text content components

2. **Client Components (explicit):**
   - Must have 'use client' directive at the top
   - Can use React hooks and browser APIs
   - Once marked, all imports and children become part of client bundle
   - Examples: Header, Dropdown, Dialog, Forms

3. **Composition Rules:**
   - ✅ Server Component can render Client Component as child
   - ✅ Server Component can be passed to Client Component via children prop
   - ❌ Client Component cannot directly import Server Component
   - ✅ Client Component can render Server Component if passed as prop

### Component Communication

| From → To | Method | Example |
|-----------|--------|---------|
| Server → Client | Props | Pass static data like page title, content to client wrapper |
| Client → Client | Props & callbacks | Dropdown receives `isOpen` and `onClose` from parent |
| Client → Server | Not applicable | Client Components cannot call Server Components directly |
| Layout → Page | URL params | Pages receive route params and search params as props |

## Build Order and Dependencies

### Suggested Build Order

**Phase 1: Foundation (No dependencies)**
1. Set up root layout with Tailwind CSS v4 configuration
2. Add Inter font loading
3. Apply gradient background styling
4. Create basic page structure (app/page.tsx)

**Phase 2: Static Content (Depends on Phase 1)**
1. Create UI primitives (components/ui/Button.tsx if needed)
2. Build page routes: app/who/page.tsx, app/what/page.tsx, app/book/page.tsx
3. Add static text content (can extract to lib/content.ts later)

**Phase 3: Layout Components (Depends on Phase 1)**
1. Create Logo component (components/layout/Logo.tsx)
2. Build basic Header component without dropdowns (components/layout/Header.tsx)
3. Add fixed positioning and backdrop blur styling

**Phase 4: Interactive Navigation (Depends on Phase 3)**
1. Add dropdown component (components/ui/Dropdown.tsx or install Headless UI)
2. Implement dropdown state management in Header
3. Build Navigation component with dropdown menus
4. Wire up navigation links to page routes
5. Add click-outside-to-close behavior

**Phase 5: Modals and Forms (Depends on Phase 4)**
1. Create Dialog component (components/ui/Dialog.tsx)
2. Build form components (components/forms/PublisherForm.tsx, etc.)
3. Implement URL-synced modal state in Book page
4. Wire up "Book" dropdown to open appropriate modal

**Phase 6: Polish (Depends on all previous)**
1. Add hover states and transitions
2. Test all navigation paths
3. Verify glassmorphism styling matches design
4. Test responsive behavior at mobile and desktop sizes

### Dependency Graph

```
Phase 1 (Foundation)
    ↓
├─→ Phase 2 (Static Content)
│
└─→ Phase 3 (Layout Components)
        ↓
    Phase 4 (Interactive Navigation)
        ↓
    Phase 5 (Modals and Forms)
        ↓
    Phase 6 (Polish)
```

### Critical Path Components

These components block other work if not completed:

1. **Root Layout (app/layout.tsx)** - Blocks all pages
2. **Header Component** - Blocks navigation implementation
3. **Dropdown Component** - Blocks interactive menus
4. **Dialog Component** - Blocks form modals

These can be built in parallel:
- All page routes (who, what, book) can be built simultaneously
- Form components (Publisher, Agent, Therapist) can be built in parallel
- Logo and basic navigation can be built while pages are in progress

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10 pages | Current architecture is perfect. Keep all content as static Server Components. Consider moving page content to separate MDX files if content becomes large. |
| 10-50 pages | Add route groups to organize pages by category. Consider a CMS for content management. Add a sitemap generation script. |
| 50+ pages | Use MDX for content authoring. Implement content collections. Consider parallel routes for more complex UI. Add search functionality. |

### Scaling Priorities

1. **First bottleneck:** Content management becomes tedious with many pages. **Fix:** Move to MDX files or a headless CMS like Sanity/Contentful. Keep the component architecture the same.

2. **Second bottleneck:** Too many navigation items in dropdown. **Fix:** Implement mega-menu pattern or sidebar navigation. This would require refactoring the Header component but the overall architecture remains sound.

3. **Third bottleneck:** Client bundle size grows with many interactive components. **Fix:** Implement dynamic imports with React.lazy for modals and forms. Split code by route automatically happens with App Router.

## Anti-Patterns

### Anti-Pattern 1: Making Everything a Client Component

**What people do:** Add 'use client' to the root layout or to all page components "just in case" they need state later.

**Why it's wrong:** Ships unnecessary JavaScript to the browser, loses Server Component benefits (direct data access, zero-bundle-size, SEO), slower initial page load.

**Do this instead:** Start with Server Components by default. Only add 'use client' to the specific components that need interactivity. Push the client boundary down as far as possible.

**Example:**
```typescript
// ❌ WRONG - Everything is client-side
'use client'
export default function WhoPage() {
  return <div>Static content that doesn't need client JavaScript</div>
}

// ✅ RIGHT - Server Component by default
export default function WhoPage() {
  return <div>Static content that doesn't need client JavaScript</div>
}
```

### Anti-Pattern 2: Prop Drilling Through Many Layers

**What people do:** Pass dropdown state from Header → Navigation → Dropdown → MenuItem through 4+ levels of props.

**Why it's wrong:** Becomes hard to maintain, makes components tightly coupled, difficult to refactor.

**Do this instead:** Use composition or a state management solution. For simple dropdown state, keep it in the component that owns it. For complex state, consider React Context (client-side only) or a library like Zustand.

**Example:**
```typescript
// ❌ WRONG - Deep prop drilling
<Header openDropdown={open} setOpen={setOpen}>
  <Navigation openDropdown={open} setOpen={setOpen}>
    <Dropdown openDropdown={open} setOpen={setOpen}>
      <MenuItem openDropdown={open} setOpen={setOpen}>

// ✅ RIGHT - State lives where it's used
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Menu>
      <MenuButton onClick={() => setIsOpen(!isOpen)} />
      <MenuItems show={isOpen} />
    </Menu>
  )
}
```

### Anti-Pattern 3: Mixing Inline Styles with Tailwind

**What people do:** Use both `className` with Tailwind utilities and `style` prop with inline CSS in the same component.

**Why it's wrong:** Inconsistent styling approach, harder to maintain, can't leverage Tailwind's design system benefits.

**Do this instead:** Use Tailwind utilities exclusively. If you need custom values, use Tailwind's arbitrary values syntax: `className="bg-[rgba(67,117,237,0.92)]"`

**Example:**
```typescript
// ❌ WRONG - Mixed approaches
<div
  className="rounded-xl p-4"
  style={{ backgroundColor: 'rgba(255,255,255,0.77)' }}
>

// ✅ RIGHT - Tailwind only
<div className="rounded-xl p-4 bg-[rgba(255,255,255,0.77)]">
```

### Anti-Pattern 4: Not Using Link Component for Navigation

**What people do:** Use regular `<a>` tags or `router.push()` for internal navigation.

**Why it's wrong:** Loses prefetching benefits, causes full page reload, breaks the single-page app experience, layout re-renders unnecessarily.

**Do this instead:** Use Next.js `<Link>` component for all internal navigation. It provides automatic prefetching and client-side transitions.

**Example:**
```typescript
// ❌ WRONG - Full page reload
<a href="/who">Who</a>

// ❌ WRONG - Works but no prefetching
onClick={() => router.push('/who')}

// ✅ RIGHT - Prefetched client-side navigation
import Link from 'next/link'
<Link href="/who">Who</Link>
```

### Anti-Pattern 5: Creating Separate layout.tsx for Every Route

**What people do:** Add a layout.tsx file in every route folder (app/who/layout.tsx, app/what/layout.tsx, etc.) even though they all render the same header.

**Why it's wrong:** Duplicated code, harder to maintain, wastes the shared layout feature of App Router.

**Do this instead:** Use a single root layout (app/layout.tsx) for shared UI like the header. Only create nested layouts when the layout actually differs for that route segment.

**Example:**
```typescript
// ❌ WRONG - Duplicated layout
// app/who/layout.tsx
export default function WhoLayout({ children }) {
  return <><Header />{children}</>
}
// app/what/layout.tsx
export default function WhatLayout({ children }) {
  return <><Header />{children}</>  // Same code!
}

// ✅ RIGHT - Single shared layout
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}  // Different page for each route
      </body>
    </html>
  )
}
```

## Integration Points

### External Services

For this project, all functionality is static with visual-only forms (no API). If integration becomes necessary in the future:

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Email API (SendGrid, Resend) | Server Action in app/actions | Call from Client Component form submission |
| Analytics (Vercel Analytics) | Script in root layout | Client-side tracking |
| CMS (Sanity, Contentful) | Fetch in Server Components | Can use ISR for content updates |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Root Layout ↔ Pages | children prop | Layout wraps all pages, pages are swapped on navigation |
| Header ↔ Dropdowns | Props (isOpen, onClose) | State management for open/close |
| Dropdown ↔ Menu Items | Headless UI context | If using Headless UI, context provides state automatically |
| Book Page ↔ Dialogs | URL search params | Modals synchronized with URL for shareability |

## Sources

### Official Documentation (HIGH confidence)
- [Getting Started: Layouts and Pages | Next.js](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Getting Started: Server and Client Components | Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Guides: Static Exports | Next.js](https://nextjs.org/docs/app/guides/static-exports)
- [File-system conventions: Intercepting Routes | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes)
- [Dropdown Menu - Headless UI](https://headlessui.com/react/menu)

### Next.js 15 Guides and Tutorials (MEDIUM confidence)
- [Next.js 15: App Router — A Complete Senior-Level Guide | Medium](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)
- [Ideaflow - Next.js 15 App Router Deep Dive](https://www.ideaflow.studio/en/blog/next-js-15-app-router-deep-dive-building-lightning-fast-multi-page-apps)
- [Next.js 15 Advanced Patterns for 2026](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)

### Component Patterns (MEDIUM confidence)
- [A guide to Next.js layouts and nested layouts - LogRocket](https://blog.logrocket.com/guide-next-js-layouts-nested-layouts/)
- [Shareable Modals in Next.js: URL-Synced UI Made Simple](https://javascript-conference.com/blog/shareable-modals-nextjs/)
- [Dialog with Next.js App Router - Ariakit](https://ariakit.org/examples/dialog-next-router)
- [Headless Component Pattern - Martin Fowler](https://martinfowler.com/articles/headless-component.html)

### Project Structure (MEDIUM confidence)
- [The Ultimate Guide to Organizing Your Next.js 15 Project Structure - Wisp CMS](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)
- [Next js Folder Structure Best Practices for Scalable Applications (2026 Guide)](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
- [Getting Started: Project Structure | Next.js](https://nextjs.org/docs/app/getting-started/project-structure)

---
*Architecture research for: Continua multi-page informational website*
*Researched: 2026-02-11*
