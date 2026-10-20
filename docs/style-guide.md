# Continua Style Guide

Reference implementation: `../questionaire` (the prototype app). This guide extracts the visual design system from that prototype for use in the production Continua build.

## Logo

Located at `/public/logo.png`. A colorful arc of short dashed segments in rainbow colors (red, orange, yellow, green, blue, purple, magenta) arranged in a semicircle above the word "Continua" in a clean typeface. Transparent background.

In the header, the logo renders at **72x48px** and links to the home page.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-foreground` | `rgb(7, 7, 8)` | Near-black, used for all body text |
| `--color-muted` | `rgb(7, 7, 8)` | Semantic alias for secondary text (currently same as foreground) |
| `--color-accent` | `rgba(67, 117, 237, 0.92)` | Blue — header background, top of gradient |
| `--color-accent-light` | `rgba(169, 137, 236, 0.92)` | Purple — middle of gradient |
| `--color-border` | `rgba(255, 255, 255, 0.3)` | Semi-transparent white borders |
| `--color-card` | `rgba(255, 255, 255, 0.77)` | Semi-transparent white card backgrounds (glassmorphism) |
| `--color-card-solid` | `#ffffff` | Solid white for hover states |
| `--color-background` | `transparent` | Body background is a gradient, not a solid |

### Background Gradient

The entire page uses a fixed, full-viewport linear gradient:

```css
background: linear-gradient(
  180deg,
  rgba(67, 117, 237, 0.92) 0%,      /* Blue */
  rgba(169, 137, 236, 0.92) 35.14%, /* Purple */
  rgb(229, 158, 221) 100%           /* Pink */
);
background-attachment: fixed;
```

The gradient stays stationary as the user scrolls. There is no dark mode.

## Typography

### Font

**Inter** (Google Fonts), loaded via `@font-face` from `fonts.gstatic.com`. Two weights:
- **400** (Regular) — body text
- **700** (Bold) — headings, buttons, labels

### Base Styles (on `body`)

```css
font-family: "Inter", sans-serif;
font-size: 16px;
line-height: 1.6em;
letter-spacing: -0.02em;
font-weight: 400;
```

### Type Scale

| Size | Weight | Usage |
|------|--------|-------|
| 48px / 64px at `md` | Bold | Home page main heading |
| 28px / 36px at `md` | Bold | Home page subtitle |
| 32px | Bold | Page headings |
| 24px | Bold | Section headings, score labels |
| 20px | Bold | Sub-section headings |
| 18px / 20px at `md` | Normal | Home page body text |
| 16px (base) | Bold/Normal | Card titles, body text |
| 14px (`text-sm`) | Various | Secondary text, button labels, descriptions |
| 12px (`text-xs`) | Bold | Sort toggles, badges |
| 10px | Bold, uppercase, `tracking-wide` | Category labels, question numbers |

### Paragraph Spacing

```css
p + p { margin-top: 20px; }
```

## Layout

### Overall Structure

```
┌──────────────────────────────┐
│         Header (fixed)       │
├──────────────────────────────┤
│                              │
│     Main Content (centered)  │
│     max-w: 375px → 720px    │
│     px: 24px                 │
│     pt: 80px (clears header) │
│                              │
└──────────────────────────────┘
```

- **No footer.** No sidebar.
- Single centered column, mobile-first.
- `max-width: 375px` on mobile (iPhone width), `720px` at the `md` (768px) breakpoint.

### Spacing Patterns

- Major page sections: `gap-8` (32px)
- Card lists: `gap-3` (12px)
- Question lists: `gap-6` (24px)

## Header

Fixed to top of viewport. Full width, but content constrained to `720px` centered.

```
Background: rgba(67, 117, 237, 0.92) + backdrop-blur
Padding: px-4 py-3

┌─────────────────────────────────────────────┐
│  [Logo]          [Who ▾] [What ▾] [Sign In] │
└─────────────────────────────────────────────┘
```

- **Logo** (left): 72x48px, links to home.
- **Navigation** (right): Three pill-shaped buttons in a row with `gap-2`.

### Navigation Pills

```
Background: rgba(255, 255, 255, 0.2)
Hover: rgba(255, 255, 255, 0.35)
Shape: rounded-full (pill)
Padding: px-4 py-1.5
Text: 14px, bold, white
+ backdrop-blur
```

### Dropdown Panels

Triggered on click (not hover). Only one dropdown open at a time. Click outside closes.

```
Background: rgba(255, 255, 255, 0.95)
Shape: rounded-xl
Padding: p-2
Shadow: shadow-lg + backdrop-blur
Min width: 180px
Position: absolute, below the trigger button
```

Each dropdown item:
```
Padding: px-3 py-2
Text: 14px, foreground color
Shape: rounded-lg
Hover: bg-[rgba(0, 0, 0, 0.05)]
```

The header does **not** collapse into a hamburger menu on mobile — the same horizontal pills appear at all screen sizes.

## Component Patterns

### Cards (Glassmorphism)

The primary surface pattern. Semi-transparent white over the gradient background.

```
Background: rgba(255, 255, 255, 0.77)
Shape: rounded-xl
Padding: p-5 (or p-4, p-6)
Interactive hover: bg-white + shadow-lg
```

### Buttons

**Primary action:**
```
bg-[rgba(255,255,255,0.77)] rounded-xl px-4 py-4
text-sm font-bold text-foreground
hover: bg-white
```

**Secondary action:**
```
bg-[rgba(255,255,255,0.4)] rounded-xl px-4 py-4
text-sm font-bold text-foreground
hover: bg-[rgba(255,255,255,0.6)]
```

**Disabled:**
```
cursor-not-allowed
bg-[rgba(255,255,255,0.3)]
text-[rgba(7,7,8,0.4)]
```

### Category Labels

```
text-[10px] font-bold uppercase tracking-wide text-muted
```

Used for section markers, question numbers, and contextual labels.

### Progress Bar

```
Track: h-1.5 rounded-full bg-[rgba(0,0,0,0.08)]
Fill: bg-foreground
Animation: transition-all duration-300
```

## Responsive Design

Mobile-first. Only one breakpoint: **`md` (768px)**.

| Property | Mobile | `md` (768px+) |
|----------|--------|---------------|
| Content max-width | 375px | 720px |
| Main heading | 48px | 64px |
| Subtitle | 28px | 36px |
| Body text | 18px | 20px |

No `sm`, `lg`, `xl`, or `2xl` breakpoints are used. The app is designed as a narrow single-column layout that widens slightly on larger screens.

## Technology

- **Framework:** Next.js (App Router) with React, TypeScript
- **Styling:** Tailwind CSS v4 (configured via CSS `@theme` directive, not `tailwind.config.js`)
- **Fonts:** Inter via `@font-face`
- **No component library** — all UI is hand-built with Tailwind utilities
- **No icon library** — no icons are currently used
