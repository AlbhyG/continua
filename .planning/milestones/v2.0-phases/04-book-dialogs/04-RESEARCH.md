# Phase 4: Book Dialogs - Research

**Researched:** 2026-02-11
**Domain:** Dialog/Modal components with form inputs using Headless UI
**Confidence:** HIGH

## Summary

Phase 4 requires implementing three Book dialogs (Publishers, Agents, Therapists) triggered from the existing Book dropdown menu. Each dialog displays a simple visual-only form with email and/or phone inputs. The core technical challenge is integrating Headless UI Dialog with the existing Menu component, managing independent dialog states, and applying glassmorphic styling consistent with the existing design system.

The project already uses @headlessui/react 2.2.9 for the Book dropdown. Headless UI's Dialog component provides automatic accessibility (focus management, keyboard navigation, scroll locking, ARIA attributes) and works seamlessly with the existing Tailwind CSS styling. Dialog state must be managed separately from Menu state - each of the three dialogs needs its own useState hook.

The forms are visual-only (no submission logic), requiring only HTML input elements with proper semantic types (email, tel) for mobile keyboard optimization. Glassmorphic styling uses the existing pattern: bg-white/95 with backdrop-blur, matching the navigation dropdown panels.

**Primary recommendation:** Use Headless UI Dialog component with separate state management for each dialog type. Trigger dialogs from MenuItem onClick handlers. Apply existing glassmorphic styling pattern to DialogPanel and DialogBackdrop. Use semantic HTML inputs (type="email", type="tel") without validation or submission logic.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @headlessui/react | 2.2.9 | Dialog and Menu components | Already installed, provides complete accessibility (focus trap, scroll lock, keyboard navigation, ARIA) |
| Next.js 15 | 15.x | App Router with client components | Already in use, Header already marked 'use client' |
| React 19 | 19.x | Component framework with useState hooks | Already in use, latest stable version |
| Tailwind CSS | 4.1.18 | Styling system | Already in use, glassmorphic utilities available |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | Latest | Form validation and submission | NOT NEEDED - Phase 4 is visual-only, no validation required |
| zod | Latest | Schema validation | NOT NEEDED - Phase 4 has no form submission |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Headless UI Dialog | Radix UI Dialog | Similar functionality, different API. Headless UI better since already in use |
| Headless UI Dialog | Custom modal | Avoid - accessibility extremely complex (focus trap, scroll lock, portal rendering, inert management) |
| Separate dialogs | Single dialog with conditional content | More complex state, harder to extend. Separate dialogs clearer and more maintainable |

**Installation:**
```bash
# Already installed
@headlessui/react 2.2.9
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Existing, contains Book Menu
│   ├── dialogs/
│   │   ├── PublishersDialog.tsx    # Publishers booking dialog
│   │   ├── AgentsDialog.tsx        # Agents booking dialog
│   │   └── TherapistsDialog.tsx    # Therapists booking dialog
```

### Pattern 1: Headless UI Dialog Component
**What:** Accessible modal dialog with automatic focus management and keyboard navigation
**When to use:** All Book dialogs (Publishers, Agents, Therapists)
**Example:**
```typescript
// Source: https://headlessui.com/react/dialog
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { useState } from 'react'

function PublishersDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-md rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
            <DialogTitle className="text-lg font-bold">
              We will send you a proposal
            </DialogTitle>

            <Description className="text-sm text-gray-600 mt-2">
              Enter your contact information
            </Description>

            <input type="email" placeholder="Email" />
            <input type="tel" placeholder="Phone" />

            <button onClick={() => setIsOpen(false)}>Close</button>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
```

### Pattern 2: Menu Item Triggering Dialog
**What:** MenuItem onClick handler sets dialog state to open
**When to use:** All Book dropdown items
**Example:**
```typescript
// Source: https://headlessui.com/react/menu
import { Menu, MenuItem } from '@headlessui/react'

function BookMenu() {
  const [showPublishers, setShowPublishers] = useState(false)

  return (
    <>
      <Menu>
        <MenuButton>Book</MenuButton>
        <MenuItems>
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => setShowPublishers(true)}
                className={focus ? 'bg-accent/10' : ''}
              >
                Publishers
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>

      <PublishersDialog isOpen={showPublishers} onClose={() => setShowPublishers(false)} />
    </>
  )
}
```

### Pattern 3: Separate State for Each Dialog
**What:** Each dialog type has independent state management
**When to use:** Multiple dialogs that can't be open simultaneously
**Example:**
```typescript
// In Header.tsx
const [showPublishers, setShowPublishers] = useState(false)
const [showAgents, setShowAgents] = useState(false)
const [showTherapists, setShowTherapists] = useState(false)

// Each dialog gets its own state
<PublishersDialog isOpen={showPublishers} onClose={() => setShowPublishers(false)} />
<AgentsDialog isOpen={showAgents} onClose={() => setShowAgents(false)} />
<TherapistsDialog isOpen={showTherapists} onClose={() => setShowTherapists(false)} />
```

### Pattern 4: Glassmorphic Dialog Styling
**What:** Consistent glassmorphic styling matching existing navigation panels
**When to use:** All dialog components
**Example:**
```typescript
// DialogBackdrop: dark overlay with blur
<DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

// DialogPanel: white 95% opacity with backdrop blur, matching dropdown style
<DialogPanel className="max-w-md rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
  {/* Dialog content */}
</DialogPanel>

// Matches existing MenuItems styling:
// className="rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
```

### Pattern 5: Visual-Only Form Inputs
**What:** HTML inputs with semantic types but no validation or submission
**When to use:** Phase 4 visual-only requirements
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
// Email input - mobile keyboards show @ symbol
<input
  type="email"
  placeholder="your@email.com"
  className="w-full px-4 py-2 rounded-lg border border-gray-300"
/>

// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/tel
// Phone input - mobile keyboards show number pad
<input
  type="tel"
  placeholder="(555) 123-4567"
  className="w-full px-4 py-2 rounded-lg border border-gray-300"
/>

// No onSubmit handler needed - forms are visual-only
// No validation - Phase 4 requirement is "visual-only, no actual form submission"
```

### Pattern 6: Dialog Centered Positioning
**What:** Dialog panel centered in viewport with padding for mobile
**When to use:** All dialogs
**Example:**
```typescript
<Dialog open={isOpen} onClose={onClose}>
  <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

  {/* Centering container */}
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <DialogPanel className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
      {/* Content */}
    </DialogPanel>
  </div>
</Dialog>
```

### Pattern 7: Keyboard Navigation (Handled Automatically)
**What:** Escape closes dialog, focus trapped inside, Tab cycles through inputs
**When to use:** All dialogs
**Example:**
```typescript
// Headless UI Dialog provides these keyboard interactions automatically:
// - Escape: closes dialog, returns focus to trigger button
// - Tab: cycles forward through focusable elements (inputs, buttons)
// - Shift + Tab: cycles backward
// - Focus trapped inside dialog - can't Tab to background content
// - Click outside DialogPanel: triggers onClose callback
// - Scroll locked on background content

// No custom keyboard handling code needed
```

### Pattern 8: Dialog Transitions (Optional Enhancement)
**What:** Smooth fade/scale animations when dialog opens/closes
**When to use:** Optional for Phase 4, enhances user experience
**Example:**
```typescript
// Source: https://headlessui.com/react/dialog
<DialogBackdrop
  transition
  className="fixed inset-0 bg-black/30 duration-300 ease-out data-closed:opacity-0"
/>

<DialogPanel
  transition
  className="duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
>
  {/* Content */}
</DialogPanel>

// transition prop enables data-closed, data-enter, data-leave attributes
// Use Tailwind classes to define animation behavior
```

### Anti-Patterns to Avoid
- **Don't share state between dialogs** - Each dialog type needs independent open/closed state
- **Don't manually implement focus trap** - Headless UI Dialog handles this automatically
- **Don't use form onSubmit handlers** - Phase 4 is visual-only, no submission logic
- **Don't add validation libraries** - Visual-only forms don't need react-hook-form or zod
- **Don't manually lock scroll** - Headless UI Dialog locks scroll automatically when open
- **Don't forget DialogBackdrop** - Required for proper click-outside-to-close behavior
- **Don't nest dialogs** - Each dialog should be a sibling, not nested inside each other

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal accessibility | Custom modal with portal, focus trap, scroll lock | Headless UI Dialog | Dialog accessibility requires: portal rendering to avoid z-index issues, focus trap with initial focus and return focus, scroll locking with padding adjustment, inert management for background content, Escape key handling, click-outside detection, ARIA attributes (role="dialog", aria-modal, aria-labelledby, aria-describedby) |
| Focus management | Manual focus() calls, useRef tracking | Headless UI automatic focus | Must handle: initial focus on first element or specified element, focus trap cycling with Tab/Shift+Tab, return focus to trigger on close, handle disabled/hidden elements, respect data-autofocus attribute |
| Scroll locking | document.body.style.overflow = 'hidden' | Headless UI built-in | Edge cases: scrollbar width compensation (prevents layout shift), nested scrollable elements, mobile Safari overscroll, multiple dialogs, cleanup on unmount, iOS momentum scrolling |
| Click outside to close | useRef + useEffect + document.addEventListener | Headless UI DialogPanel boundary | Edge cases: clicks during animation/transition, portal-rendered children, nested modals, touch events on mobile, scrollbar clicks |
| Dialog positioning | Absolute/fixed positioning with manual centering | Flexbox centering pattern | Must handle: vertical centering, horizontal centering, responsive padding, mobile viewport height (vh vs dvh), keyboard on mobile |

**Key insight:** Modal dialogs are one of the most complex UI patterns - they require coordinating portal rendering, focus management, scroll locking, keyboard navigation, ARIA attributes, and click-outside detection. Custom implementations almost always have bugs. Headless UI Dialog solves all of these in a library already in use.

## Common Pitfalls

### Pitfall 1: Missing DialogBackdrop Causes Click-Outside Failure
**What goes wrong:** Clicking outside dialog doesn't close it, or entire screen becomes clickable
**Why it happens:** DialogBackdrop defines the click-outside boundary. Without it, click-outside behavior is unpredictable
**How to avoid:** Always include DialogBackdrop as first child of Dialog. It should cover full viewport with fixed positioning: `className="fixed inset-0"`
**Warning signs:** Click-outside doesn't work, can click through dialog to background, z-index issues

### Pitfall 2: Menu State Interfering with Dialog State
**What goes wrong:** Dialog opens but Menu doesn't close, or Menu closes Dialog
**Why it happens:** Menu and Dialog states not properly separated
**How to avoid:** Menu auto-closes when MenuItem is clicked. Dialog state is independent. Pattern: `<MenuItem onClick={() => setDialogOpen(true)}>` opens dialog after Menu closes automatically
**Warning signs:** Menu stays open behind dialog, closing dialog also closes menu

### Pitfall 3: Dialog Content Not Focusable
**What goes wrong:** Error "There are no focusable elements inside the <FocusTrap />"
**Why it happens:** Dialog requires at least one focusable element (button, input, link)
**How to avoid:** Always include at least one focusable element. Inputs and buttons are focusable by default. Use data-autofocus to specify initial focus target
**Warning signs:** Console error about focus trap, dialog doesn't receive keyboard focus

### Pitfall 4: Incorrect Input Types
**What goes wrong:** Mobile keyboards don't show optimal layout (e.g., missing @ for email)
**Why it happens:** Using type="text" instead of semantic input types
**How to avoid:** Use type="email" for email inputs (mobile shows @ symbol and .com), type="tel" for phone (mobile shows number pad). Phase 4 is visual-only but semantic types improve UX
**Warning signs:** Mobile keyboard doesn't match input purpose, user has to switch keyboard manually

### Pitfall 5: Z-Index Stacking Issues
**What goes wrong:** Dialog appears behind header or other elements
**Why it happens:** Fixed header has high z-index, dialog needs higher z-index to layer on top
**How to avoid:** Header uses z-50. Dialog should use higher z-index on both DialogBackdrop and centering container (e.g., z-[60] or z-[100]). Headless UI portals to document.body by default, avoiding most z-index issues
**Warning signs:** Dialog partially hidden behind header, dropdown menus appear above dialog

### Pitfall 6: Dialog State Persistence After Navigation
**What goes wrong:** Dialog remains open when user navigates away
**Why it happens:** Dialog state not reset on route change
**How to avoid:** For Phase 4, dialogs are in Header which persists across routes. Consider useEffect with pathname to close dialogs on navigation, or accept that dialogs stay open (likely acceptable for Phase 4 scope)
**Warning signs:** Navigate to different page, dialog still visible

### Pitfall 7: Multiple Dialogs Open Simultaneously
**What goes wrong:** Two dialogs stack on top of each other
**Why it happens:** Multiple dialog states can be true simultaneously
**How to avoid:** Ensure MenuItem onClick handlers only open one dialog at a time. Since dialogs are triggered from Menu, Menu auto-closes so only one MenuItem can be clicked. Natural behavior prevents this issue.
**Warning signs:** Two dialogs visible, backdrop appears twice, focus management confused

## Code Examples

Verified patterns from official sources:

### Complete Publishers Dialog Component
```typescript
// Source: https://headlessui.com/react/dialog
'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react'

interface PublishersDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function PublishersDialog({ isOpen, onClose }: PublishersDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Backdrop: dark overlay with blur */}
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Centering container */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <DialogPanel className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
          <DialogTitle className="text-lg font-bold text-foreground">
            We will send you a proposal
          </DialogTitle>

          <Description className="text-sm text-gray-600 mt-2">
            Enter your email or phone number
          </Description>

          <div className="mt-4 space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />

            <input
              type="tel"
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
```

### Therapists Dialog (Email Only)
```typescript
// Source: https://headlessui.com/react/dialog
'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react'

interface TherapistsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function TherapistsDialog({ isOpen, onClose }: TherapistsDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <DialogPanel className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
          <DialogTitle className="text-lg font-bold text-foreground">
            We will send you a PDF of the book
          </DialogTitle>

          <Description className="text-sm text-gray-600 mt-2">
            Enter your email address
          </Description>

          <div className="mt-4">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
```

### Header Integration Pattern
```typescript
// Source: https://headlessui.com/react/menu
// In existing Header.tsx
'use client'

import { useState } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import PublishersDialog from '@/components/dialogs/PublishersDialog'
import AgentsDialog from '@/components/dialogs/AgentsDialog'
import TherapistsDialog from '@/components/dialogs/TherapistsDialog'

export default function Header() {
  // Dialog states - each independent
  const [showPublishers, setShowPublishers] = useState(false)
  const [showAgents, setShowAgents] = useState(false)
  const [showTherapists, setShowTherapists] = useState(false)

  return (
    <header>
      {/* Existing header content */}

      <Menu>
        <MenuButton>Book</MenuButton>
        <MenuItems anchor="bottom start" className="rounded-xl bg-white/95 backdrop-blur shadow-lg p-2">
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => setShowPublishers(true)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                  focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                }`}
              >
                Publishers
              </button>
            )}
          </MenuItem>

          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => setShowAgents(true)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                  focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                }`}
              >
                Agents
              </button>
            )}
          </MenuItem>

          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => setShowTherapists(true)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                  focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                }`}
              >
                Therapists
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>

      {/* Dialog components - rendered as siblings */}
      <PublishersDialog isOpen={showPublishers} onClose={() => setShowPublishers(false)} />
      <AgentsDialog isOpen={showAgents} onClose={() => setShowAgents(false)} />
      <TherapistsDialog isOpen={showTherapists} onClose={() => setShowTherapists(false)} />
    </header>
  )
}
```

### Dialog with Transitions (Optional Enhancement)
```typescript
// Source: https://headlessui.com/react/dialog
<Dialog open={isOpen} onClose={onClose}>
  {/* Backdrop fades in/out */}
  <DialogBackdrop
    transition
    className="fixed inset-0 bg-black/30 backdrop-blur-sm duration-300 ease-out data-closed:opacity-0"
  />

  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    {/* Panel fades and scales */}
    <DialogPanel
      transition
      className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6 duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
    >
      {/* Content */}
    </DialogPanel>
  </div>
</Dialog>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom modal with ReactDOM.createPortal | Headless UI Dialog with built-in portal | 2020-2021 | Eliminated manual portal management, focus trap, scroll lock implementation |
| Shared dialog component with conditional content | Multiple dialog components | Modern React best practices | Each dialog is self-contained, easier to maintain, better TypeScript support |
| Form validation in visual-only prototypes | HTML semantic inputs without validation | Ongoing | Semantic inputs (type="email", "tel") provide mobile UX benefits without validation overhead |
| Manual focus management with useRef | Headless UI automatic focus with data-autofocus | Headless UI v2+ | Declarative focus targets, no imperative focus() calls |
| CSS-only transitions | Headless UI transition prop with data attributes | Headless UI v2.1 (2024) | Simplified transition API, better performance, easier to implement |

**Deprecated/outdated:**
- **ReactDOM.createPortal for modals**: Still works but unnecessary with Headless UI Dialog
- **document.body.style.overflow = 'hidden'**: Headless UI handles scroll locking with proper padding compensation
- **Manual aria-modal, aria-labelledby attributes**: Headless UI manages automatically
- **Custom focus trap libraries**: Headless UI has built-in focus trap
- **Nested Dialog components**: Headless UI v2.1 supports sibling dialogs, avoid nesting

## Open Questions

1. **Should dialogs close automatically on route navigation?**
   - What we know: Header persists across routes in App Router. Dialog state won't reset automatically.
   - What's unclear: Whether dialogs should stay open when navigating to different pages
   - Recommendation: For Phase 4, allow dialogs to persist. If needed, add useEffect with pathname in future phase.

2. **Should we extract shared dialog styling into a component?**
   - What we know: All three dialogs use same glassmorphic styling pattern
   - What's unclear: Whether Publishers/Agents dialogs are identical enough to merge
   - Recommendation: Create three separate components for Phase 4 (clear, simple). Consider shared base component in future refactor if needed.

3. **Do we need transitions for Phase 4 MVP?**
   - What we know: Transitions are optional, enhance UX but not required for functionality
   - What's unclear: Whether smooth animations are in scope for Phase 4
   - Recommendation: Implement without transitions first (simpler, faster). Add transition prop later if desired.

4. **Should inputs have placeholder text or labels?**
   - What we know: Placeholders shown in requirements. Labels better for accessibility.
   - What's unclear: Design preference for Phase 4
   - Recommendation: Use placeholders for Phase 4 (matches requirements). Future phase can add proper labels above inputs.

## Sources

### Primary (HIGH confidence)
- [Headless UI Dialog Documentation](https://headlessui.com/react/dialog) - Official API, code examples, accessibility features
- [Headless UI Menu Documentation](https://headlessui.com/react/menu) - Official Menu component patterns
- [MDN: input type="email"](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email) - Email input specification
- [MDN: input type="tel"](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/tel) - Phone input specification
- [Tailwind CSS Backdrop Blur](https://tailwindcss.com/docs/backdrop-blur) - Official backdrop-filter utilities

### Secondary (MEDIUM confidence)
- [Headless UI v2.1 Release Notes](https://tailwindcss.com/blog/2024-06-21-headless-ui-v2-1) - Transition API and multi-dialog support
- [Headless UI GitHub: Dialog Issues](https://github.com/tailwindlabs/headlessui/issues?q=dialog) - Common pitfalls and solutions
- [How to Use Dialog Component with Headless UI and Tailwind](https://plainenglish.io/blog/how-to-use-the-dialog-component-with-headless-ui-and-tailwind-css-f8f11edcaf06) - Community patterns
- [Glassmorphism with Tailwind CSS](https://flyonui.com/blog/glassmorphism-with-tailwind-css/) - Glassmorphic styling patterns

### Tertiary (LOW confidence)
- [Various WebSearch Results] - General React dialog patterns, form best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @headlessui/react 2.2.9 already installed and in use. Dialog component is stable, mature, official solution.
- Architecture: HIGH - Official Headless UI documentation provides complete patterns. Verified with existing Header.tsx implementation. Pattern matches existing Menu usage.
- Pitfalls: MEDIUM-HIGH - Pitfalls documented from official Headless UI GitHub issues (focus trap, backdrop), MDN specs (input types), and Next.js patterns (client components, state management).

**Research date:** 2026-02-11
**Valid until:** 2026-05-11 (90 days - stable technology, Headless UI mature and well-maintained)
