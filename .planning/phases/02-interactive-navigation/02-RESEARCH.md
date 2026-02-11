# Phase 2: Interactive Navigation - Research

**Researched:** 2026-02-11
**Domain:** React dropdown menus with accessibility
**Confidence:** HIGH

## Summary

Phase 2 requires implementing interactive dropdown menus for the navigation pills (Who, What, Book) with full keyboard accessibility and proper state management. The core technical challenge is building accessible dropdowns that handle click-outside behavior, keyboard navigation (Tab, Enter, Escape), and ensure only one dropdown is open at a time.

The React ecosystem offers two mature, production-ready solutions: Headless UI and Radix UI. Both libraries handle the complex accessibility logic (ARIA attributes, focus management, keyboard interactions) automatically, following WAI-ARIA Menu Button patterns. The project already uses Tailwind CSS, making Headless UI the natural fit as it's built by the Tailwind team for seamless integration.

**Primary recommendation:** Use Headless UI Menu component for dropdowns. It provides complete accessibility out-of-box, automatic state management, and works perfectly with existing Tailwind styling. For glassmorphic dropdown panels, use backdrop-filter: blur() which has full browser support in 2026.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @headlessui/react | 2.2.9 | Accessible dropdown components | Built by Tailwind team, automatic ARIA/keyboard handling, designed for Tailwind CSS integration |
| Next.js 15 | 15.x | App Router with client components | Already in use, modern routing with usePathname hook |
| React 19 | 19.x | Component framework | Already in use, latest stable version |
| Tailwind CSS | 4.1.18 | Styling system | Already in use, integrates perfectly with Headless UI |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dropdown-menu | Latest | Alternative dropdown primitives | If need more composability or complex nested menus (not needed for Phase 2) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Headless UI | Radix UI | More composable but requires more setup. Radix better for complex interactions, Headless UI better for simple dropdowns with Tailwind |
| Headless UI | Custom implementation | Avoid - accessibility is deceptively complex. Hand-rolling means reimplementing focus management, ARIA patterns, keyboard interactions |

**Installation:**
```bash
npm install @headlessui/react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Existing header (already 'use client')
│   │   ├── NavigationDropdown.tsx  # Reusable dropdown component
│   └── ui/                     # Future shared UI components
```

### Pattern 1: Headless UI Menu Component
**What:** Accessible dropdown with automatic keyboard navigation and state management
**When to use:** All navigation dropdowns (Who, What, Book)
**Example:**
```typescript
// Source: https://headlessui.com/react/menu
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'

<Menu>
  <MenuButton className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5">
    Who
  </MenuButton>
  <MenuItems
    anchor="bottom start"
    className="rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
  >
    <MenuItem>
      {({ focus }) => (
        <Link
          href="/who/individuals"
          className={`block px-4 py-2 ${focus ? 'bg-accent/10' : ''}`}
        >
          Individuals
        </Link>
      )}
    </MenuItem>
  </MenuItems>
</Menu>
```

### Pattern 2: State Management for Single Open Dropdown
**What:** Only one dropdown open at a time - Headless UI handles this automatically
**When to use:** All navigation pills
**Example:**
```typescript
// Headless UI automatically closes other dropdowns when one opens
// No manual state management needed across multiple Menu components
// Each Menu component manages its own open/closed state internally
```

### Pattern 3: Click Outside to Close
**What:** Clicking outside an open dropdown closes it automatically
**When to use:** All dropdowns
**Example:**
```typescript
// Headless UI handles this automatically
// No need for useRef + useEffect + document.addEventListener pattern
// Built-in behavior when using Menu component
```

### Pattern 4: Glassmorphic Dropdown Styling
**What:** White 95% opacity background with backdrop blur
**When to use:** All dropdown panels
**Example:**
```typescript
// Source: https://blog.logrocket.com/how-to-create-glassmorphism-effect-react/
<MenuItems
  className="rounded-xl bg-white/95 backdrop-blur shadow-lg"
>
  {/* Items */}
</MenuItems>

// Tailwind config already has backdrop-blur utilities
// backdrop-filter has full browser support in 2026
```

### Pattern 5: Keyboard Navigation (Handled Automatically)
**What:** Tab, Enter, Escape, Arrow keys work automatically
**When to use:** All dropdowns
**Example:**
```typescript
// Headless UI provides these keyboard interactions automatically:
// - Enter/Space on button: opens menu, focuses first item
// - Arrow Up/Down: navigate items
// - Escape: closes menu, returns focus to button
// - Tab: moves to next focusable element (closes menu)
// - A-Z: focuses matching item (typeahead)

// No custom keyboard handling code needed
```

### Pattern 6: Next.js Link Integration
**What:** Dropdown items navigate using Next.js Link
**When to use:** All navigable dropdown items
**Example:**
```typescript
import Link from 'next/link'

<MenuItem>
  <Link href="/who/individuals" className="block px-4 py-2">
    Individuals
  </Link>
</MenuItem>

// Note: Headless UI's close function can be used if needed
<MenuItem>
  {({ close }) => (
    <Link href="/page" onClick={() => close()}>
      Item
    </Link>
  )}
</MenuItem>
```

### Anti-Patterns to Avoid
- **Don't manually manage dropdown state with useState across multiple dropdowns** - Headless UI Menu components automatically handle "only one open" behavior
- **Don't implement click-outside with useRef + useEffect** - Headless UI handles this built-in
- **Don't manually implement keyboard navigation** - Headless UI provides WAI-ARIA compliant keyboard interactions
- **Don't use role="menu" on navigation links** - Navigation menus should use role="navigation", but Headless UI Menu uses proper ARIA roles for dropdown behavior
- **Don't suppress hydration warnings without understanding the cause** - If dropdown has hydration issues, fix the root cause (usually non-deterministic rendering)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown accessibility | Custom keyboard handlers, ARIA attributes | Headless UI Menu or Radix UI DropdownMenu | WAI-ARIA Menu Button pattern is complex - requires proper focus management, roving tabindex, aria-expanded, aria-haspopup, aria-controls, and keyboard event handlers for Enter, Space, Escape, Arrows, Home, End, A-Z |
| Click outside detection | useRef + useEffect + document.addEventListener | Headless UI built-in behavior | Edge cases include: clicks on scrollbars, clicks during transitions, portal-rendered elements, iOS touch events, preventing default on outside clicks |
| Focus management | Manual focus() calls | Headless UI automatic focus management | Must handle: return focus to trigger on close, focus first item on open, focus last item on Arrow Up, trap focus in modal mode, restore focus on unmount |
| Only one dropdown open | useState + context to track all dropdowns | Headless UI automatic behavior | Requires: unique IDs for each dropdown, coordination across component tree, cleanup on unmount, handling rapid clicks |
| Glassmorphism fallbacks | Custom feature detection | CSS with opacity fallback | backdrop-filter not supported in older browsers (pre-2020), needs fallback: `background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);` |

**Key insight:** Dropdown accessibility is a solved problem in 2026. Both Headless UI and Radix UI implement the complete WAI-ARIA Menu Button pattern. Custom implementations almost always have accessibility bugs - missing keyboard interactions, incorrect ARIA attributes, or broken focus management. Use a library.

## Common Pitfalls

### Pitfall 1: Hydration Errors with Client-Only Dropdowns
**What goes wrong:** Error "Text content does not match server-rendered HTML" when dropdown state depends on client-side only values
**Why it happens:** Server renders one thing, client hydrates with different initial state (e.g., using window, localStorage, random IDs)
**How to avoid:** Header already marked as 'use client' (done in Phase 1). Ensure dropdown components don't use client-only values during initial render. Headless UI Menu components are hydration-safe.
**Warning signs:** Console errors about hydration mismatch, content "flashing" on page load

### Pitfall 2: Z-Index and Stacking Context Issues
**What goes wrong:** Dropdown appears behind other elements or doesn't layer properly
**Why it happens:** CSS stacking contexts created by transform, filter, opacity, or position create new z-index scopes
**How to avoid:** Use Headless UI's anchor prop for positioning or portal rendering. Ensure dropdown has higher z-index than header (e.g., z-50 for header, z-[100] for dropdowns). Test with overlapping content.
**Warning signs:** Dropdown partially hidden, appears behind other elements, z-index numbers keep increasing

### Pitfall 3: Focus Trap Preventing Navigation
**What goes wrong:** User can't Tab out of dropdown to other page elements
**Why it happens:** Modal mode enabled when not needed, or incorrect focus management
**How to avoid:** Headless UI Menu uses non-modal by default (correct for navigation). Don't add focus-trap libraries. Ensure Tab key moves to next focusable element (closes dropdown).
**Warning signs:** Can't Tab to browser address bar, stuck in dropdown, must press Escape to continue

### Pitfall 4: Incorrect ARIA Roles for Navigation
**What goes wrong:** Screen readers announce navigation as application menu instead of navigation
**Why it happens:** Confusion between role="menu" (application actions) and role="navigation" (site navigation)
**How to avoid:** Headless UI Menu uses role="menu" which is correct for dropdown behavior. The parent nav element already has role="navigation" from semantic HTML. Don't add additional ARIA roles.
**Warning signs:** Screen reader says "menu" instead of "navigation", unexpected announcements

### Pitfall 5: Dropdown Not Closing on Navigation
**What goes wrong:** Clicking dropdown link navigates but dropdown stays open
**Why it happens:** In Next.js App Router, Link doesn't trigger events that close dropdowns
**How to avoid:** Headless UI Menu automatically closes when MenuItem is activated. If using custom onClick handlers, use the close render prop: `{({ close }) => <Link onClick={close}>...</Link>}`
**Warning signs:** Dropdown remains visible after navigation, need to click outside or press Escape

### Pitfall 6: backdrop-filter Performance
**What goes wrong:** Janky scrolling or animations when dropdowns are open
**Why it happens:** backdrop-filter is expensive - browser must re-blur on every frame
**How to avoid:** Use will-change: backdrop-filter for elements that will blur. Keep blur radius reasonable (10-20px). Test on lower-end devices. Consider static blur (blurred image) for poor-performing browsers.
**Warning signs:** FPS drops when scrolling, choppy animations, CPU usage spikes

## Code Examples

Verified patterns from official sources:

### Basic Navigation Dropdown
```typescript
// Source: https://headlessui.com/react/menu
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import Link from 'next/link'

export default function NavigationDropdown() {
  return (
    <Menu>
      <MenuButton className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors">
        Who
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        className="mt-2 rounded-xl bg-white/95 backdrop-blur shadow-lg p-2 min-w-[200px]"
      >
        <MenuItem>
          {({ focus }) => (
            <Link
              href="/who/individuals"
              className={`block px-4 py-2 rounded-lg text-sm ${
                focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
              }`}
            >
              Individuals
            </Link>
          )}
        </MenuItem>

        <MenuItem>
          {({ focus }) => (
            <Link
              href="/who/couples"
              className={`block px-4 py-2 rounded-lg text-sm ${
                focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
              }`}
            >
              Couples
            </Link>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
```

### Dropdown with Data-Driven Items
```typescript
// Source: https://headlessui.com/react/menu
const whoItems = [
  { href: '/who/individuals', label: 'Individuals' },
  { href: '/who/couples', label: 'Couples' },
  { href: '/who/families', label: 'Families' },
  { href: '/who/teams', label: 'Teams' },
]

<Menu>
  <MenuButton>Who</MenuButton>
  <MenuItems anchor="bottom start">
    {whoItems.map((item) => (
      <MenuItem key={item.href}>
        {({ focus }) => (
          <Link
            href={item.href}
            className={focus ? 'bg-accent/10' : ''}
          >
            {item.label}
          </Link>
        )}
      </MenuItem>
    ))}
  </MenuItems>
</Menu>
```

### Glassmorphic Styling with Fallback
```css
/* Source: https://blog.logrocket.com/how-to-create-glassmorphism-effect-react/ */
.dropdown-panel {
  /* Fallback for browsers without backdrop-filter support */
  background: rgba(255, 255, 255, 0.95);

  /* Modern browsers (all browsers in 2026) */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  /* Optional: add saturate for more glass effect */
  /* backdrop-filter: blur(10px) saturate(180%); */

  /* Performance hint */
  will-change: backdrop-filter;
}
```

### Keyboard Navigation Testing Checklist
```typescript
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
// Manual testing steps - no code needed, Headless UI implements all:

// 1. Tab to navigation pill
// 2. Press Enter or Space - should open dropdown, focus first item
// 3. Press Arrow Down - should move to next item
// 4. Press Arrow Up - should move to previous item
// 5. Press Home - should focus first item
// 6. Press End - should focus last item
// 7. Press Escape - should close dropdown, return focus to button
// 8. Tab with dropdown open - should close dropdown, move to next element
// 9. Type "F" - should focus first item starting with F (typeahead)
// 10. Click outside - should close dropdown
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom dropdown with useState + useRef + useEffect | Headless UI Menu component | 2020-2021 | Eliminated 100+ lines of accessibility code per dropdown |
| Router events API (router.events) | usePathname + useSearchParams hooks | Next.js 13 (2022) | Concurrent rendering broke old events API, new hooks more reliable |
| Manual ARIA attributes | Library-managed ARIA | 2020+ | WAI-ARIA pattern too complex to hand-roll reliably |
| CSS-only dropdowns with :hover | JavaScript-managed with proper accessibility | 2018+ | Hover-only dropdowns are keyboard inaccessible |
| role="menu" for all navigation | role="menu" only for action menus | Ongoing education | Navigation vs application menus have different patterns |

**Deprecated/outdated:**
- **router.events API** (Next.js Pages Router): Removed in App Router, use usePathname() hook instead
- **forwardRef wrapping for click-outside detection**: No longer needed with Headless UI's built-in behavior
- **Manual aria-expanded toggle**: Headless UI manages automatically
- **Custom focus trap implementations**: Headless UI handles focus management

## Open Questions

1. **Should dropdown positioning use anchor prop or portal rendering?**
   - What we know: Headless UI supports both. Anchor prop is simpler. Portal avoids z-index issues.
   - What's unclear: If fixed header creates stacking context issues
   - Recommendation: Start with anchor prop (simpler). Switch to portal if z-index issues appear during implementation.

2. **Should we extract a reusable NavigationDropdown component?**
   - What we know: Three dropdowns (Who, What, Book) with similar structure
   - What's unclear: Whether Book dropdown is different enough (opens dialogs in Phase 4)
   - Recommendation: Create shared component for Who/What. Book might need custom implementation in Phase 4.

3. **Do we need to handle dropdown behavior on route changes?**
   - What we know: Headless UI auto-closes on MenuItem activation. Next.js Link doesn't trigger router events.
   - What's unclear: If dropdown stays open in edge cases
   - Recommendation: Test behavior during implementation. If needed, use usePathname() with useEffect to close on path change.

## Sources

### Primary (HIGH confidence)
- [Headless UI Menu Documentation](https://headlessui.com/react/menu) - Official API, keyboard interactions, code examples
- [Radix UI Dropdown Menu Documentation](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) - Alternative library comparison
- [WAI-ARIA Menu Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) - W3C accessibility specifications
- [Next.js 15 Documentation - Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) - Official Next.js routing docs

### Secondary (MEDIUM confidence)
- [LogRocket: How to Create Glassmorphism Effect in React](https://blog.logrocket.com/how-to-create-glassmorphism-effect-react/) - CSS glassmorphism patterns
- [LogRocket: How to Detect Click Outside React Component](https://blog.logrocket.com/detect-click-outside-react-component-how-to/) - Click-outside patterns (not needed with Headless UI)
- [Next.js Hydration Error Documentation](https://nextjs.org/docs/messages/react-hydration-error) - Official hydration error guide
- [WCAG 2.1.1 Keyboard Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) - Keyboard accessibility standards
- [ScratchDB: Headless UI vs Radix UI Comparison](https://scratchdb.com/compare/headless-ui-vs-radix-ui/) - Library comparison

### Tertiary (LOW confidence)
- [Medium: Building Accessible Dropdown in React](https://medium.com/@katr.zaks/building-an-accessible-dropdown-combobox-in-react-a-step-by-step-guide-f6e0439c259c) - Custom implementation guide (not recommended, prefer library)
- [Various WebSearch Results](https://www.locofy.ai/blog/create-a-dropdown-menu-with-headless-ui) - Community tutorials and patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Headless UI is official, mature, and designed for this exact use case. Version 2.2.9 is stable. @headlessui/react is the standard for Tailwind+React dropdowns.
- Architecture: HIGH - Official Headless UI documentation provides complete patterns. WAI-ARIA specifications are authoritative. No custom architecture needed.
- Pitfalls: MEDIUM - Pitfalls documented from official Next.js docs (hydration), common React patterns (z-index), and WAI-ARIA guidance (ARIA roles). Performance pitfall based on CSS backdrop-filter behavior.

**Research date:** 2026-02-11
**Valid until:** 2026-05-11 (90 days - stable technology stack, minimal churn expected)
