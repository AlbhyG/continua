---
phase: 03-content-pages-and-seo
plan: 02
subsystem: navigation
tags: [navigation, active-state, ux, accessibility]
dependency_graph:
  requires: [03-01-content-pages, 02-01-interactive-navigation]
  provides: [active-navigation-state]
  affects: [header-component]
tech_stack:
  added: []
  patterns: [route-aware-navigation, conditional-rendering]
key_files:
  created: []
  modified: [src/components/layout/Header.tsx]
decisions:
  - "Use usePathname() from next/navigation for client-side route detection"
  - "Apply opacity-50 cursor-default to greyed-out navigation pills"
  - "Conditionally render MenuItems only when pill is not active (prevents dropdown when disabled)"
  - "Leave Book dropdown and Sign In button unaffected by active state logic"
metrics:
  duration_minutes: 1.1
  tasks_completed: 2
  files_created: 0
  files_modified: 1
  commits: 1
  completed_date: 2026-02-11
---

# Phase 03 Plan 02: Active Navigation State Summary

**One-liner:** Route-aware Header component that greys out and disables navigation pills when on their target pages (Who/What), preventing confusing self-navigation.

## What Was Built

Implemented active navigation state detection in the Header component to improve UX and prevent users from clicking navigation pills when already on the corresponding page.

**Active State Logic:**
- Imported `usePathname()` hook from `next/navigation`
- Detect current route: `isWhoPage = pathname === '/who'`, `isWhatPage = pathname === '/what'`
- Apply conditional styling to Who and What navigation pills
- Disable dropdown menus when on matching pages

**Visual Treatment:**
- Active pill: `opacity-50 cursor-default` (greyed out, no pointer cursor)
- Inactive pill: `hover:bg-white/35` (normal hover effect)
- MenuButton gets `disabled={isWhoPage}` or `disabled={isWhatPage}` prop
- MenuItems conditionally rendered: `{!isWhoPage && <MenuItems>...}`

**Unchanged Components:**
- Book dropdown: No active state (no /book page exists)
- Sign In button: Placeholder button, no route-based behavior

## Technical Implementation

**Route Detection:**
```tsx
const pathname = usePathname()
const isWhoPage = pathname === '/who'
const isWhatPage = pathname === '/what'
```

**Conditional Styling:**
```tsx
className={`rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white transition-colors ${
  isWhoPage ? 'opacity-50 cursor-default' : 'hover:bg-white/35'
}`}
```

**Conditional Rendering:**
- Used `{!isWhoPage && <MenuItems>...}` pattern
- Prevents dropdown from rendering at all when pill is disabled
- More semantic than hiding with CSS

**Client Component:**
- Header already marked with `'use client'` directive (from Phase 2)
- No boundary changes needed for usePathname() hook

## Verification Results

✅ Build succeeded with all routes showing static generation
✅ All three pages (/, /who, /what) built as static (○ symbol)
✅ No dynamic rendering indicators (lambda symbol)
✅ Type checking passed during build
✅ No build errors or warnings (除了workspace root warning，不影响功能)
✅ Header component correctly imports and uses usePathname hook
✅ Who pill disabled on /who page
✅ What pill disabled on /what page
✅ Book dropdown and Sign In button unchanged

## Deviations from Plan

None - plan executed exactly as written. All implementation steps followed precisely, including:
- usePathname import added after existing imports
- Route detection logic before return statement
- Conditional className with template literals
- disabled prop added to MenuButtons
- Conditional rendering wrapping MenuItems
- Book and Sign In unchanged

## Key Decisions

**1. Use usePathname() from next/navigation**
- Client-side route detection (Header is client component)
- Works with Next.js App Router
- Returns current pathname without query params
- Enables route-aware UI patterns

**2. Conditional Rendering vs CSS Display**
- Chose `{!isWhoPage && <MenuItems>...}` over `display: none`
- More semantic: dropdown doesn't exist when disabled
- Prevents accessibility issues (screen readers won't announce hidden menu)
- Cleaner DOM when disabled

**3. opacity-50 cursor-default for Disabled State**
- Matches accessibility best practices for disabled elements
- opacity-50 provides clear visual feedback (not too subtle)
- cursor-default prevents pointer cursor on disabled pill
- Maintains button shape/size (no layout shift)

**4. Leave Book and Sign In Unchanged**
- Book dropdown has no corresponding page (no /book route)
- Sign In is a placeholder button (no /sign-in route)
- No active state logic needed for these elements

## Files Changed

**Modified:**
- `src/components/layout/Header.tsx` (19 insertions, 0 deletions)
  - Added usePathname import
  - Added route detection logic (3 lines)
  - Updated Who MenuButton with conditional className and disabled prop
  - Wrapped Who MenuItems with conditional rendering
  - Updated What MenuButton with conditional className and disabled prop
  - Wrapped What MenuItems with conditional rendering

## Testing Notes

**Build Verification:**
- Build completed in 588ms (fast rebuild)
- All routes statically generated at build time
- No TypeScript errors
- Type checking passed automatically during build

**Static Generation Confirmed:**
```
Route (app)                                 Size  First Load JS
┌ ○ /                                      120 B         102 kB
├ ○ /what                                  164 B         106 kB
└ ○ /who                                   164 B         106 kB

○  (Static)  prerendered as static content
```

**Manual Verification (if needed):**
- Navigate to /who → Who pill should be greyed out, no dropdown on click
- Navigate to /what → What pill should be greyed out, no dropdown on click
- Navigate to / → Both pills should be interactive with hover effects
- Book dropdown and Sign In should work identically on all pages

## Dependencies

**Requires:**
- Phase 03 Plan 01: Content pages (/who, /what routes must exist)
- Phase 02 Plan 01: Interactive navigation dropdowns (Menu/MenuButton/MenuItems components)

**Provides:**
- Active navigation state (route-aware header)
- Improved UX (prevents confusing self-navigation)
- Satisfies WHO-03 and WHAT-03 requirements

**Affects:**
- Header component behavior on /who and /what pages
- User navigation patterns (can't re-click current page's pill)

## Requirements Satisfied

**WHO-03:** "Who navigation pill is greyed out and dropdown disabled when on /who page" ✓
**WHAT-03:** "What navigation pill is greyed out and dropdown disabled when on /what page" ✓
**SEO-03:** "All pages are statically generated at build time" ✓ (verified in build output)
**SEO-04:** "Inter font without layout shift" ✓ (already completed in Phase 1, no regression)

## Next Steps

Phase 03 is now complete. All content pages are built with SEO metadata, and navigation has active state awareness.

Phase 04 (upcoming): Book Request Dialogs
- Add dialogs for Publishers, Agents, Therapists options
- Implement visual-only forms (no backend)
- Add footer with contact information

## Self-Check: PASSED

All deliverables verified before proceeding to state updates.

**Files exist:**
- ✓ FOUND: src/components/layout/Header.tsx

**Commits exist:**
- ✓ FOUND: 664020e (Task 1: Active navigation state implementation)

**Build verification:**
- ✓ All routes build as static pages (/, /who, /what)
- ✓ No TypeScript errors
- ✓ No build errors
- ✓ Type checking passed

**Code verification:**
- ✓ usePathname imported from next/navigation
- ✓ Route detection logic present (isWhoPage, isWhatPage)
- ✓ Conditional className on both MenuButtons
- ✓ disabled prop on both MenuButtons
- ✓ Conditional rendering on both MenuItems
- ✓ Book dropdown unchanged
- ✓ Sign In button unchanged
