---
name: Continua
description: Existing visual implementation, with methodology and assessment-notice examples.
colors:
  foreground: "rgb(7, 7, 8)"
  muted: "rgb(107, 114, 128)"
  accent: "rgba(67, 117, 237, 0.92)"
  accent-light: "rgba(169, 137, 236, 0.92)"
  border: "rgba(255, 255, 255, 0.3)"
  card: "rgba(255, 255, 255, 0.77)"
  card-solid: "#ffffff"
typography:
  headline:
    fontFamily: "Lora, Georgia, serif"
  body:
    fontFamily: "Raleway, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.6em"
    letterSpacing: "-0.01em"
---

# Design System: Continua

## Overview

Code-derived snapshot of the existing interface. The scoped examples are the methodology page and assessment limitations notice. Product status comes from [PRODUCT.md](PRODUCT.md); this document adds no visual identity or product commitments.

## Colors

The frontmatter preserves the seven named theme colors in [globals.css](src/app/globals.css). The body uses a fixed vertical gradient: accent at 0%, accent-light at 35.14%, and pink (`rgb(229, 158, 221)`) at 100%. Components also use local white opacity variants; the named card token does not describe every panel.

The methodology panel and footer information links use 90% white backgrounds with foreground text. The limitations notice uses 80% white. These values are observed in [the page](src/app/methodology/page.tsx), [the footer](src/app/layout.tsx), and [the notice](src/components/AssessmentLimitations.tsx).

## Typography

[layout.tsx](src/app/layout.tsx) loads Lora weights 400–700 and Raleway weights 300–700 through Next fonts. Global headings use Lora; body text and controls inherit Raleway. The frontmatter records global defaults, not a new type scale.

On the methodology page, the bold title is 1.875rem, increasing to 2.25rem at the small breakpoint, with 1.25 line height. Section headings are bold 1.5rem. Reading text is 1.125rem with 1.625 line height; the draft line is 1rem. The notice is 0.875rem with 1.625 line height. Global consecutive paragraphs have a 20px gap.

## Layout

The methodology main is centered at a maximum width of 720px with 1.5rem horizontal padding and 3rem top/bottom padding. Its panel has 1.5rem padding, increasing to 2rem at the small breakpoint; sections are separated by 2.25rem. This is a page example, not a universal container rule.

The fixed [header](src/components/layout/Header.tsx) and footer use 720px containers expanding to 960px at the large breakpoint. The shell offsets content by 6rem. Desktop navigation appears at the large breakpoint; smaller screens use a 300px dialog drawer. Related-information and footer links wrap. Utility values resolve from the installed Tailwind theme; the used breakpoints are recorded in the sidecar.

## Elevation & Depth

The global glass-card classes combine translucent white, blur, a pale border, and a light shadow; the interactive variant brightens and lifts on hover. Exact shadow and transition values are in the sidecar, sourced from globals.css. The methodology panel and limitations notice have no explicit shadow or blur.

## Shapes

Observed corners vary by component: methodology and global glass cards use 1rem; the notice and login controls use 0.75rem; footer navigation and header contact fields use 0.5rem. The header chapter-request button is pill-shaped. These are existing component choices, not a prescribed radius scale.

## Components

- **Methodology:** a visible dated draft line states pending legal review. Sections distinguish current scores and predefined labels from planned AI descriptions, observed ranges, and mutual-consent comparison. The closing navigation links to assessment overview and privacy. Source: [page.tsx](src/app/methodology/page.tsx).
- **Assessment limitations:** a labeled aside carries the self-reflection/professional-support notice and a semibold underlined methodology link. The link has a 4px underline offset and a 2px focus-visible outline offset by 4px. Source: [AssessmentLimitations.tsx](src/components/AssessmentLimitations.tsx); a standalone rendering example is in the sidecar.
- **Footer:** labeled information navigation contains methodology and privacy links with the same underline/focus treatment, using foreground text on a translucent white panel. Source: [layout.tsx](src/app/layout.tsx).
- **Forms:** [login-form.tsx](src/app/login/login-form.tsx) uses full-width fields, 85% white fill, a 10% black border, and accent focus borders/rings. Accent buttons use white bold text, reduced opacity when disabled, and pending labels; errors use an alert and successful submission uses a status region. The [header contact form](src/components/layout/Header.tsx) has smaller fields and buttons, so it is not an identical primitive.

No North Star, named rules, synthesized tonal ramps, or additional token scales are established by this snapshot.
