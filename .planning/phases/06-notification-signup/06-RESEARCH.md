# Phase 6: Notification Signup - Research

**Researched:** 2026-02-15
**Domain:** Form validation, dialog UI, accessible error handling, Server Actions
**Confidence:** HIGH

## Summary

Phase 6 builds a notification signup dialog with inline validation, accessible error announcements, and database persistence. The research confirms that Next.js 15's Server Actions with React 19's `useActionState` hook provide a modern, progressively-enhanced form submission pattern. Headless UI Dialog (already in package.json) handles accessible modal management with built-in focus trapping and keyboard navigation. Client-side validation triggers on blur, with ARIA live regions announcing errors to screen readers.

The critical technical pattern combines controlled form state for validation UX with uncontrolled form submission to Server Actions, enabling progressive enhancement (works without JavaScript). Supabase's upsert with `onConflict` handles duplicate email submissions gracefully by updating existing records rather than throwing errors. Zod provides runtime validation on the server, catching malicious/malformed inputs before database writes.

**Primary recommendation:** Use Server Actions (not Route Handlers) for form submission, validate with Zod on server + simple pattern matching on client, implement `useActionState` for error display, and use `useFormStatus` to disable submit button during pending state.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dialog trigger & form layout:**
- Sign In/Up button in header uses **primary/filled style** — stands out as a call to action
- Form collects two fields: **Name** (single field, not first/last split) and **Email**
- Clicking the button opens a dialog (exact type — modal vs slide-in — is Claude's discretion)

**Validation & error display:**
- Validation triggers **on blur** (when user leaves a field)
- Error messages appear **below each field** (inline, not summary)
- Error text only — no red border or visual field indicator beyond the message
- Submit button is **disabled until all fields are valid**
- ARIA live regions announce errors for screen readers (per success criteria)

**Post-submission flow:**
- On successful submit, the dialog **replaces the form with a confirmation message** (same dialog stays open)
- Confirmation message: **"Check your email"** — directs them to verify
- No resend option — keep it simple
- Dialog closes only via **manual close** (X button or click outside) — no auto-close

**Returning visitor handling:**
- Duplicate email submissions show the **same "check your email" confirmation** — don't reveal whether the email already exists (privacy-safe)
- How to handle a returning user who clicks the button is Claude's discretion (session/cookie detection vs always showing form)
- After sign-in (post-verification), the header button **changes to show the user's name**
- Clicking the name shows a **simple dropdown with their email and a Sign Out option**

### Claude's Discretion

- Dialog type (modal overlay vs slide-in panel)
- Form layout and spacing
- Exact confirmation message copy and any illustration/icon
- Returning user detection approach (session-based vs always show form and catch at submit)
- Loading/submitting state indicator on the form

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@headlessui/react` | 2.2.9+ | Dialog/modal component | Already in package.json, official Tailwind companion, handles accessibility |
| `zod` | Latest | Server-side schema validation | De facto standard for TypeScript validation, type-safe, composable schemas |
| `@supabase/ssr` | 0.8.0+ | Database client for Server Actions | Already installed (Phase 5), server-side Supabase client |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React 19 built-ins | N/A | `useActionState`, `useFormStatus` | Form state management and pending indicators |
| Next.js 15 Server Actions | N/A | Form submission handler | Default for form mutations (not Route Handlers) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions | Route Handlers (POST /api/signup) | Route Handlers work but Server Actions provide progressive enhancement and simpler type safety |
| Zod | Custom validation functions | Zod provides type inference, better error messages, composable schemas |
| `useActionState` | Manual `useState` + `useTransition` | `useActionState` handles state + pending in one hook, cleaner API |
| Headless UI Dialog | Radix UI Dialog or custom modal | Radix is equivalent, Headless UI already installed |

**Installation:**
```bash
npm install zod
```

---

## Architecture Patterns

### Recommended File Structure
```
src/
├── app/
│   └── actions/
│       └── signup.ts              # Server Action for signup mutation
├── components/
│   ├── dialogs/
│   │   └── SignupDialog.tsx       # Signup form dialog (Client Component)
│   └── layout/
│       └── Header.tsx             # Updated with Sign In/Up button state
└── lib/
    └── validations/
        └── signup.ts               # Shared Zod schema
```

### Pattern 1: Server Action with Progressive Enhancement
**What:** Form submits to Server Action using `action` prop, works without JavaScript, enhanced with `useActionState` when JS loads.

**When to use:** All form submissions (this is the standard Next.js 15 pattern).

**Example:**
```typescript
// src/app/actions/signup.ts
// Source: https://nextjs.org/docs/app/guides/forms
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
})

export async function signupAction(prevState: any, formData: FormData) {
  // Validate input with Zod
  const validatedFields = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email } = validatedFields.data

  // Insert to database with upsert to handle duplicates
  const supabase = await createClient()
  const { error } = await supabase
    .from('contacts')
    .upsert(
      { email: email.toLowerCase(), name, signed_up_at: new Date().toISOString() },
      { onConflict: 'email', ignoreDuplicates: false }
    )

  if (error) {
    return { errors: { form: ['Something went wrong. Please try again.'] } }
  }

  return { success: true }
}
```

### Pattern 2: Client-Side Validation on Blur
**What:** Controlled form state tracks touched fields, validates on blur, displays errors inline.

**When to use:** When user leaves a field (provides immediate feedback without waiting for submit).

**Example:**
```typescript
// src/components/dialogs/SignupDialog.tsx
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { signupAction } from '@/app/actions/signup'
import { useState } from 'react'

export default function SignupDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [state, formAction] = useActionState(signupAction, null)
  const [touched, setTouched] = useState({ name: false, email: false })
  const [clientErrors, setClientErrors] = useState({ name: '', email: '' })

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address'
    return ''
  }

  const validateName = (name: string) => {
    if (!name) return 'Name is required'
    if (name.length > 100) return 'Name too long'
    return ''
  }

  const handleBlur = (field: 'name' | 'email', value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = field === 'email' ? validateEmail(value) : validateName(value)
    setClientErrors(prev => ({ ...prev, [field]: error }))
  }

  const isValid = !clientErrors.name && !clientErrors.email && touched.name && touched.email

  if (state?.success) {
    return (
      <Dialog open={isOpen} onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <DialogPanel>
            <DialogTitle>Check your email</DialogTitle>
            <p>We've sent a verification link to your email address.</p>
            <button onClick={onClose}>Close</button>
          </DialogPanel>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel>
          <DialogTitle>Sign up for launch notifications</DialogTitle>
          <form action={formAction}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                onBlur={(e) => handleBlur('name', e.target.value)}
                aria-invalid={touched.name && !!clientErrors.name}
                aria-describedby={touched.name && clientErrors.name ? 'name-error' : undefined}
              />
              {touched.name && clientErrors.name && (
                <p id="name-error" role="alert" aria-live="polite">{clientErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                onBlur={(e) => handleBlur('email', e.target.value)}
                aria-invalid={touched.email && !!clientErrors.email}
                aria-describedby={touched.email && clientErrors.email ? 'email-error' : undefined}
              />
              {touched.email && clientErrors.email && (
                <p id="email-error" role="alert" aria-live="polite">{clientErrors.email}</p>
              )}
            </div>
            <SubmitButton disabled={!isValid} />
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={disabled || pending}>
      {pending ? 'Signing up...' : 'Sign up'}
    </button>
  )
}
```

### Pattern 3: ARIA Live Regions for Error Announcements
**What:** Error messages use `role="alert"` and `aria-live="polite"` to announce changes to screen readers.

**When to use:** All inline error messages (required by success criteria).

**Example:**
```tsx
{touched.email && clientErrors.email && (
  <p
    id="email-error"
    role="alert"
    aria-live="polite"
    className="text-sm text-red-600"
  >
    {clientErrors.email}
  </p>
)}
```

**Key attributes:**
- `role="alert"` — Equivalent to `aria-live="assertive"` + `aria-atomic="true"`
- `aria-live="polite"` — Announces after current speech finishes (less disruptive for form errors)
- `aria-describedby` — Links input to error message for context
- `aria-invalid="true"` — Marks input as invalid when error exists

### Pattern 4: Upsert for Duplicate Handling
**What:** Use Supabase upsert with `onConflict` to update existing records instead of throwing unique constraint errors.

**When to use:** When duplicate email submissions should silently succeed (privacy-safe, per user constraints).

**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/upsert
const { error } = await supabase
  .from('contacts')
  .upsert(
    {
      email: email.toLowerCase(),
      name,
      signed_up_at: new Date().toISOString()
    },
    {
      onConflict: 'email',  // Matches unique index on LOWER(email)
      ignoreDuplicates: false  // Update existing record instead of ignoring
    }
  )
```

**Important:** The migration created a unique index on `LOWER(email)`, so use `email.toLowerCase()` for consistency.

### Pattern 5: Preventing Double Submission
**What:** `useFormStatus` provides `pending` boolean to disable submit button during Server Action execution.

**When to use:** All forms with Server Actions.

**Example:**
```typescript
// Source: https://react.dev/reference/react-dom/hooks/useFormStatus
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={disabled || pending}>
      {pending ? 'Signing up...' : 'Sign up'}
    </button>
  )
}
```

**Key insight:** `useFormStatus` must be called in a **child component** of the `<form>`, not the component that renders the form itself.

### Anti-Patterns to Avoid

- **Don't use Route Handlers for form submission:** Server Actions provide progressive enhancement and simpler DX. Route Handlers are for external APIs only.
- **Don't validate only on client:** Always validate on server with Zod. Client validation is UX enhancement, not security.
- **Don't use `aria-live="assertive"` for form errors:** Too disruptive. Use `role="alert"` or `aria-live="polite"`.
- **Don't show errors before blur:** Showing errors while typing is jarring UX. Wait for blur event.
- **Don't use red borders alone:** Must include text error message for accessibility. User constraint specifies "Error text only".
- **Don't auto-close confirmation dialog:** User constraint specifies manual close only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email validation regex | Custom regex from scratch | Zod's `.email()` or simple pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Email validation is deceptively complex (RFC 5322 spec is 3600 lines). Zod's validator is battle-tested. |
| Form state management | Manual `useState` for every field | `useActionState` + controlled state for validation only | `useActionState` handles submission state + errors in one hook. |
| Accessible modal | Custom focus trap + escape handler | Headless UI Dialog | Focus trapping, Escape key, click-outside, scroll lock, screen reader announcements all built-in. |
| Duplicate email detection | Try/catch on insert error | Supabase upsert with `onConflict` | Upsert is atomic and race-condition safe. Error handling reveals timing info (security issue). |
| Loading states | Manual boolean flags | `useFormStatus` hook | React 19 built-in, integrates with Server Actions, handles race conditions. |

**Key insight:** Form validation, accessibility, and error handling have subtle edge cases (screen reader compatibility, keyboard navigation, race conditions). Use proven libraries and React built-ins rather than custom solutions.

---

## Common Pitfalls

### Pitfall 1: Client-Only Validation
**What goes wrong:** Developer validates email/name on client with JavaScript but skips server validation. Attacker bypasses client validation with curl/Postman, inserting malicious data or breaking database constraints.

**Why it happens:** Assumption that client validation is "enough" since most users won't bypass it.

**How to avoid:**
- ALWAYS validate on server with Zod before database writes
- Treat client validation as UX enhancement only, never security
- Use same Zod schema on server and client (DRY)

**Warning signs:**
- Server Action inserts `formData.get('email')` directly without validation
- No Zod import in Server Action file
- Database errors bubble up to users

### Pitfall 2: ARIA Live Region Best Practices
**What goes wrong:** Developer adds `aria-live="assertive"` to every error message, causing screen reader to interrupt constantly. Or error message is hidden with `display: none`, so ARIA live region doesn't announce.

**Why it happens:** Misunderstanding of `assertive` vs `polite`, or applying `display: none` for visual hiding.

**How to avoid:**
- Use `role="alert"` or `aria-live="polite"` for form errors (not `assertive`)
- Never hide ARIA live regions with `display: none` or `aria-hidden="true"`
- Use `sr-only` class for visually hidden but screen-reader-accessible content
- Pre-compose error message before inserting into live region

**Warning signs:**
- Screen reader announces errors while user is typing
- Error messages not announced at all
- Errors announced multiple times for single change

### Pitfall 3: Email Case Sensitivity Mismatch
**What goes wrong:** User signs up with `User@Example.com`, then later with `user@example.com`. Database treats these as different emails due to case-sensitive comparison, creating duplicate records despite unique constraint on `LOWER(email)`.

**Why it happens:** Developer inserts email without normalizing to lowercase, even though unique index uses `LOWER(email)`.

**How to avoid:**
- ALWAYS normalize email to lowercase before upsert: `email.toLowerCase()`
- Apply same normalization in client validation for consistency
- Trim whitespace: `email.trim().toLowerCase()`

**Warning signs:**
- User reports "email already in use" but can sign up with different casing
- Duplicate contact records with case-variant emails
- Upsert fails even when email exists

### Pitfall 4: `useFormStatus` Called in Wrong Component
**What goes wrong:** Developer calls `useFormStatus()` in the same component that renders the `<form>`, getting `pending: false` even during submission.

**Why it happens:** React hook limitation — `useFormStatus` must be called in a **child component** of the form to read its pending state.

**How to avoid:**
- Extract submit button to separate component
- Call `useFormStatus()` inside that child component
- Pass disabled state as prop if needed

**Example:**
```tsx
// ❌ WRONG: useFormStatus in same component as <form>
function MyForm() {
  const { pending } = useFormStatus() // Always false!
  return <form><button disabled={pending}>Submit</button></form>
}

// ✅ CORRECT: useFormStatus in child component
function SubmitButton() {
  const { pending } = useFormStatus() // Works!
  return <button type="submit" disabled={pending}>Submit</button>
}
function MyForm() {
  return <form><SubmitButton /></form>
}
```

**Warning signs:**
- Submit button never shows loading state
- Users can double-submit forms
- `pending` is always `false`

### Pitfall 5: Revealing Email Existence Through Errors
**What goes wrong:** Server returns different error messages for "email already exists" vs "invalid email", allowing attackers to enumerate valid email addresses in the system.

**Why it happens:** Developer returns specific error messages for debugging without considering security implications.

**How to avoid:**
- ALWAYS return same success message for duplicate emails (per user constraint: "same 'check your email' confirmation")
- Use upsert instead of insert + error handling
- Never reveal whether email exists in database
- Log suspicious activity (rapid email checking) for security monitoring

**Warning signs:**
- Different error messages for existing vs new emails
- API responses reveal user existence
- Attackers can enumerate email database

### Pitfall 6: Missing Field-Level Error IDs
**What goes wrong:** Error message appears but isn't linked to input via `aria-describedby`, so screen reader users hear "invalid" without knowing why.

**Why it happens:** Developer adds error text but forgets ARIA linking attributes.

**How to avoid:**
- Every error message needs unique `id` (e.g., `"email-error"`)
- Link input to error with `aria-describedby="email-error"` when error exists
- Set `aria-invalid="true"` on input when error is shown
- Only set `aria-describedby` when error exists (conditional attribute)

**Example:**
```tsx
<input
  id="email"
  name="email"
  aria-invalid={!!emailError}
  aria-describedby={emailError ? 'email-error' : undefined}
/>
{emailError && (
  <p id="email-error" role="alert" aria-live="polite">
    {emailError}
  </p>
)}
```

**Warning signs:**
- Screen reader says "invalid" without context
- Error messages not associated with inputs
- Failed accessibility audits

### Pitfall 7: Submit Button Enabled Before All Fields Valid
**What goes wrong:** Submit button is enabled as soon as one field is valid, allowing submission before user fills both name and email.

**Why it happens:** Developer forgets to check all field validations before enabling button.

**How to avoid:**
- Track `touched` state for each field
- Validate each field on blur
- Enable submit only when all fields touched AND all valid
- User constraint: "Submit button is disabled until all fields are valid"

**Example:**
```tsx
const isValid =
  touched.name &&
  touched.email &&
  !clientErrors.name &&
  !clientErrors.email

<button type="submit" disabled={!isValid || pending}>
  Submit
</button>
```

**Warning signs:**
- Button enabled with empty fields
- Form submits with partial data
- Server validation catches missing fields that should be caught on client

---

## Code Examples

Verified patterns from official sources:

### Email Validation Pattern
```typescript
// Source: https://zod.dev/api
import { z } from 'zod'

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .transform(email => email.trim().toLowerCase())

// Usage
const result = emailSchema.safeParse('User@Example.com ')
// result.data === 'user@example.com'
```

### Complete Server Action with Error Handling
```typescript
// Source: https://nextjs.org/docs/app/guides/forms
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').transform(e => e.trim().toLowerCase()),
})

export async function signupAction(prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('contacts')
    .upsert(
      { email, name, signed_up_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

  if (error) {
    console.error('Signup error:', error)
    return { errors: { form: ['Something went wrong. Please try again.'] } }
  }

  return { success: true }
}
```

### Client-Side Form with Accessible Errors
```tsx
// Source: https://headlessui.com/react/dialog
'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'

export default function SignupDialog({ isOpen, onClose }: Props) {
  const [state, formAction] = useActionState(signupAction, null)
  const [touched, setTouched] = useState({ name: false, email: false })
  const [errors, setErrors] = useState({ name: '', email: '' })

  const validateField = (field: 'name' | 'email', value: string) => {
    if (field === 'name') {
      if (!value) return 'Name is required'
      if (value.length > 100) return 'Name too long'
      return ''
    }
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address'
    return ''
  }

  const handleBlur = (field: 'name' | 'email', value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
  }

  const isValid = touched.name && touched.email && !errors.name && !errors.email

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-xl p-6 max-w-md">
          <DialogTitle className="text-lg font-bold">Sign up for notifications</DialogTitle>
          <Description className="text-sm text-gray-600 mt-2">
            Get notified when we launch
          </Description>

          <form action={formAction} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded"
                onBlur={(e) => handleBlur('name', e.target.value)}
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
              />
              {touched.name && errors.name && (
                <p id="name-error" role="alert" aria-live="polite" className="text-sm text-red-600 mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full mt-1 px-3 py-2 border rounded"
                onBlur={(e) => handleBlur('email', e.target.value)}
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              />
              {touched.email && errors.email && (
                <p id="email-error" role="alert" aria-live="polite" className="text-sm text-red-600 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <SubmitButton disabled={!isValid} />
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
    >
      {pending ? 'Signing up...' : 'Sign up'}
    </button>
  )
}
```

### Supabase Upsert with Case-Insensitive Email
```typescript
// Source: https://supabase.com/docs/reference/javascript/upsert
const { error } = await supabase
  .from('contacts')
  .upsert(
    {
      email: email.trim().toLowerCase(),  // Normalize to match LOWER(email) index
      name,
      signed_up_at: new Date().toISOString(),
    },
    {
      onConflict: 'email',  // Refers to unique index idx_contacts_email_unique on LOWER(email)
      ignoreDuplicates: false  // Update existing record instead of ignoring
    }
  )
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useFormState` hook | `useActionState` hook | React 19 (2024) | Renamed for clarity, same functionality |
| Route Handlers for forms | Server Actions | Next.js 13+ (2023) | Progressive enhancement, simpler DX |
| Manual `useState` + `useTransition` | `useFormStatus` hook | React 19 (2024) | Built-in pending state for forms |
| Client-side only validation | Client + server validation with Zod | 2023+ | Security best practice |
| Custom email regex | Zod `.email()` or simple pattern | Always | Avoid regex complexity, use tested solutions |

**Deprecated/outdated:**
- `useFormState`: Renamed to `useActionState` in React 19
- API Routes for mutations: Use Server Actions instead (API Routes for external consumption only)
- `aria-live` without `role="alert"`: Both are needed for best compatibility

---

## Open Questions

1. **Dialog type: Modal overlay vs slide-in panel**
   - What we know: User constraint allows Claude's discretion. Headless UI Dialog supports both patterns via positioning.
   - What's unclear: User preference for modal vs slide-in.
   - Recommendation: Default to centered modal overlay (simpler, more familiar pattern). Slide-in can be explored in future phases.

2. **Returning user detection: Session-based vs always show form**
   - What we know: User constraint allows Claude's discretion. After email verification (Phase 7), header shows user's name.
   - What's unclear: How to detect verified user before Phase 7 completes.
   - Recommendation: For Phase 6, always show signup form. Duplicate submissions handled gracefully via upsert. Add session detection in Phase 7 when auth flow exists.

3. **Loading indicator style during submission**
   - What we know: User constraint allows Claude's discretion. Need visual feedback during Server Action execution.
   - What's unclear: Button text change vs spinner icon preference.
   - Recommendation: Change button text to "Signing up..." (simplest, no icon dependencies). Can enhance with spinner in future iterations.

4. **Confirmation message copy and icon**
   - What we know: User constraint specifies "Check your email" message, allows discretion on exact copy and icon.
   - What's unclear: Whether to include next steps or just confirmation.
   - Recommendation: Keep minimal: "Check your email. We've sent you a verification link." No icon needed for Phase 6 (verification comes in Phase 7).

---

## Sources

### Primary (HIGH confidence)
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms) - Official Server Actions patterns
- [Headless UI Dialog Documentation](https://headlessui.com/react/dialog) - Official Dialog API
- [React useActionState Hook](https://react.dev/reference/react/useActionState) - Official React 19 hook docs
- [React useFormStatus Hook](https://react.dev/reference/react-dom/hooks/useFormStatus) - Official form status docs
- [Supabase Upsert Documentation](https://supabase.com/docs/reference/javascript/upsert) - Official upsert API
- [Zod Documentation](https://zod.dev/api) - Official schema validation docs
- [MDN ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) - Official ARIA standards
- [MDN aria-errormessage](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage) - Official ARIA error handling

### Secondary (MEDIUM confidence)
- [Next.js Server Actions Complete Guide (MakerKit)](https://makerkit.dev/blog/tutorials/nextjs-server-actions) - Production patterns
- [Server Actions vs Route Handlers (MakerKit)](https://makerkit.dev/blog/tutorials/server-actions-vs-route-handlers) - When to use each
- [React 19 useActionState Tutorial (LogRocket)](https://blog.logrocket.com/react-useactionstate/) - Practical examples
- [ARIA Live Regions Guide (A11Y Collective)](https://www.a11y-collective.com/blog/aria-live/) - Accessibility best practices
- [Accessible Form Feedback with Live Regions (Harvard)](https://accessibility.huit.harvard.edu/technique-form-feedback-live-regions) - Screen reader patterns
- [Email Validation JavaScript Guide (ForwardEmail)](https://forwardemail.net/en/blog/docs/email-address-regex-javascript-node-js) - Regex patterns
- [Preventing Double Form Submission (React Query)](https://tkdodo.eu/blog/react-query-and-forms) - Form state management

### Tertiary (LOW confidence, marked for validation)
- [Mastering Form Handling in React 19 (Medium)](https://douiri.org/blog/form-handling-react-19/) - Community patterns
- [React onBlur Event (GeeksforGeeks)](https://www.geeksforgeeks.org/reactjs/react-onblur-event/) - Basic patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified against official docs and package.json
- Architecture patterns: HIGH - Server Actions, useActionState, Headless UI all from official sources
- Pitfalls: HIGH - ARIA patterns from MDN/W3C, Supabase from official docs, email enumeration from security best practices
- Code examples: HIGH - Verified against Next.js 15, React 19, and Supabase official documentation
- Dialog UX decisions: MEDIUM - User constraints allow discretion, recommendations based on common patterns

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - React 19 and Next.js 15 are stable, but patterns evolve)

**Research notes:**
- All official documentation checked for Next.js 15 and React 19 compatibility
- Headless UI already in package.json at v2.2.9 (current)
- Phase 5 completed Supabase setup, database schema includes `contacts` table with `LOWER(email)` unique index
- User constraints clearly define validation UX (on blur, inline errors, disabled submit)
- ARIA live regions required by success criteria 3
- Progressive enhancement enabled by Server Actions (works without JavaScript)
