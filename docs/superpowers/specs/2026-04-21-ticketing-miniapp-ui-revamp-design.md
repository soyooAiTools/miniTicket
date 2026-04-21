# Ticketing Miniapp UI Revamp Design

## Overview

This spec replaces the earlier first-pass miniapp UI revamp direction with a more decisive product direction. The current miniapp is functional, but it still feels like a polished demo instead of a real official ticketing platform. The next iteration should correct that by simplifying the information architecture, stripping explanatory copy, and upgrading the typography and spacing system so the product feels premium rather than merely usable.

The platform positioning remains the same: this is an official ticketing miniapp for large concerts, idol performances, and recurring event operations. What changes in this spec is the execution standard. The miniapp should no longer explain itself with paragraphs. It should communicate through structure, hierarchy, typography, and motion.

## Approved Direction

The approved visual and product direction is:

- product type: official multi-event ticketing platform
- tone: official flagship, light-premium, restrained
- palette: ice white and very light blue-gray
- interaction bias: efficient first, premium second
- emotional layer: large poster-led cards
- typography: mostly official and elevated, with a `7:3` blend of modern Songti-like refinement and condensed poster-like sharpness

The approved structural direction is:

- `Home` and `Events` should be merged in product meaning
- the homepage becomes the single primary discovery surface
- the bottom navigation should be simplified to `Home / Orders / Me`
- the current `Events` route should no longer behave like a separate first-class tab

The approved content direction is:

- remove explanatory or descriptive filler copy across the app
- do not describe what a section already visually communicates
- pages should rely on headlines, hard metadata, state labels, and primary actions
- short labels are acceptable; tutorial-like copy is not

## Product Intent

The miniapp should feel like:

- the official ticketing entrance for high-demand events
- stable enough for repeated purchase behavior
- premium enough to support brand trust
- fast enough that users do not have to read to understand

The miniapp should not feel like:

- a design exercise
- a content-rich editorial product
- a fan community product
- a tooling dashboard pretending to be consumer software
- a demo that explains itself through empty-state and section descriptions

## Success Criteria

The redesign is successful when:

- users understand within one screen that this is a real official ticketing platform
- the homepage already functions as the full ticket-discovery surface
- `Home` and `Events` no longer feel duplicated
- the interface stops relying on descriptive helper copy
- the typography feels intentional and premium rather than default and generic
- the app feels quieter, cleaner, and more trustworthy without becoming bland

## Information Architecture

### Bottom Navigation

The persistent bottom navigation should become:

- `Home`
- `Orders`
- `Me`

This change is not cosmetic. It reflects a clearer product model:

- `Home` becomes the main ticket-discovery and event-browsing surface
- `Orders` remains the fulfillment and after-sales surface
- `Me` remains the service and account tools surface

### Events Route

The `Events` route should not remain a separate destination in the primary product model. To avoid breaking navigation assumptions and old links, the route may still exist technically, but it should resolve to the same content model as `Home` or redirect users into the main discovery surface.

This means:

- no separate bottom-tab emphasis for `Events`
- no duplicated page concept between `Home` and `Events`
- no second discovery page with slightly different wording

### Supporting Pages

These remain outside the bottom navigation:

- event detail
- checkout
- payment result
- order detail
- viewers
- viewer form
- after-sales
- purchase policy
- privacy policy

## Content Strategy

### Copy Reduction Rule

Every customer-facing page should follow one rule:

> If the user can already understand it from the title, layout, card, or state label, do not explain it in body copy.

This affects:

- `PageHero.description`
- `SectionHeading.description`
- card descriptions that restate visible metadata
- tool-entry helper paragraphs
- empty-state paragraphs that narrate obvious absence
- module intros such as “this section helps you…”

### Acceptable Copy

The app should still use short, functional copy where needed:

- page titles
- section titles
- state labels
- primary and secondary actions
- small policy or rule summaries where the user must make a decision
- transactional feedback such as payment, issuance, and refund status

### Unacceptable Copy

The app should avoid:

- “this page helps you…”
- “here you can…”
- “the platform lets you…”
- “we bring together…”
- “official information is synced here…”
- verbose empty-state explanations

The interface should feel confident enough not to narrate itself.

## Typography Strategy

Typography is one of the main reasons the current UI feels low-grade. The redesign should introduce a dual-layer type strategy instead of relying on a generic single-font feeling.

### Title Layer

The title layer should aim for `official advanced` rather than trendy or playful.

The intended feel is:

- mostly official
- slightly poster-like
- calm and sharp rather than dramatic

The visual result should resemble:

- modern Songti-style refinement in rhythm and spacing
- compact, slightly narrowed headline presence
- stronger hierarchy through size and margin rather than decorative treatment

Because miniapp runtime font support is constrained, the implementation should not depend on network-loaded webfonts. The title layer should instead be achieved through:

- a dedicated display font stack where supported
- stronger contrast between title and body typography
- tighter, more deliberate line lengths
- larger heading scale differences
- more disciplined letter and block spacing

### Information Layer

The information layer should remain highly readable:

- clean
- neutral
- uncluttered
- system-safe

This layer is for:

- venue
- city
- time
- price
- order metadata
- viewer information
- policy details

The information layer should never compete with the poster or title layer.

## Visual System

### Palette

The palette should continue using:

- ice white as the primary background
- very light blue-gray for secondary surfaces
- soft cool gray for separators and inputs
- one restrained accent for primary actions
- controlled status colors for sale and order states

The palette should not drift toward:

- generic SaaS blue-on-white
- black-and-gold “luxury” clichés
- heavy dark mode
- warm marketing orange/red urgency

### Surface Language

Surfaces should feel quiet and expensive rather than busy.

The system should prefer:

- fewer card borders
- softer separations
- more space between blocks
- stronger hierarchy in size, not decoration

The system should avoid:

- cards nested inside cards
- too many pills and badges competing with the poster
- dense explanatory text blocks
- obvious “feature section” UI tropes

### Poster Strategy

Posters remain the main emotional layer. The product should frame them rather than compete with them.

This means:

- single-column large poster cards on the main discovery surface
- clean metadata beneath or tightly associated with the poster
- reduced auxiliary copy
- clearer purchase action placement

## Page Design

### Home

`Home` becomes the one real discovery page.

It should combine the roles of the old `Home` and `Events` pages:

- featured or hot-sale event flow
- full discovery list behavior
- small platform modules such as ranking and sale calendar

The page should open directly into value:

- no verbose hero paragraph
- no self-explaining module descriptions
- no duplicated “platform” narration

The top area may still include a compact branded header or platform title, but it should feel like identity and orientation, not marketing copy.

The core structure should be:

- compact top header
- poster-led main event stream
- short ranking module
- short sale-calendar module

If both ranking and calendar remain, they should be compact and data-led.

### Events

The dedicated `Events` page should no longer present itself as a different product surface. It should either:

- reuse the same discovery composition as `Home`, or
- immediately transition into the same experience

The app should not present two separate “browse events” tabs with slightly different descriptions.

### Event Detail

The event detail page should feel much more premium and much less talkative.

The first screen should prioritize:

- poster
- title
- time
- venue
- status
- ticket tier or purchase entry

The page should not start with explanatory copy about how the platform presents official ticket information.

Secondary sections can remain:

- sessions
- ticket tiers
- purchase notes
- refund rules

But they should be visually compressed and better separated through hierarchy instead of descriptive copy.

### Checkout

Checkout should remain calm, compact, and transactional.

It should remove any text that narrates the obvious and instead rely on:

- order summary
- viewer summary
- fee summary
- clear payment action

### Payment Result

Payment result should feel concise and controlled.

It should communicate only:

- result state
- what happens next
- the primary next action

No extra descriptive scaffolding is needed.

### Orders

Orders should feel like a high-trust ledger rather than a tutorial.

The page should emphasize:

- status filtering
- event thumbnail/poster
- key session and amount information
- state-aware actions

Explanatory text around order states should be removed unless it directly affects a decision.

### Order Detail

Order detail should feel precise and minimal.

It should emphasize:

- current order state
- event and ticket information
- payment and fulfillment facts
- refund entry or after-sales status

It should not contain headings or descriptions that explain what order detail is for.

### Me

`Me` should become a quiet tools page, not an explanation-heavy dashboard.

It should include:

- compact personal summary
- direct entry tools
- policy and support links

It should remove:

- narrative copy about how the account center works
- descriptions under each tool entry unless absolutely necessary

### Viewers And After-Sales

These pages should also follow the same copy-reduction discipline:

- stronger field grouping
- cleaner labels
- less helper narration
- only the rule or warning copy required to avoid user mistakes

## Motion

Motion should stay subtle and premium:

- fade and rise on initial page content
- soft state transitions
- calm sticky-bar transitions

Motion should not be used as compensation for weak layout.

## Component Rules

The shared miniapp component layer should be updated to support the new direction:

- `PageHero` should support title-only or title-plus-compact-meta modes
- `SectionHeading` should support title-only mode cleanly
- `AppBottomNav` should become simpler and remove descriptive subtitles
- `PosterEventCard` should reduce description dependence
- empty states should support title-only or title-plus-action patterns

## Implementation Guidance

### Scope

This is a long task because it changes both structure and style:

- information architecture
- navigation
- typography
- copy density
- page composition

The work should be phased, but the system direction must stay consistent.

### Non-Goals

This phase does not change:

- backend contracts
- checkout rules
- payment logic
- refund logic

The change is primarily in how the product is structured and presented.

## Testing And Verification

The redesign must be verified through:

- miniapp build success
- existing miniapp tests
- visual smoke checks in WeChat DevTools
- navigation verification after removing `Events` from the main tab model
- full review of pages for leftover explanatory copy

## Final Summary

The approved target is a quieter, more premium, more official miniapp with:

- one real discovery surface instead of duplicated `Home` and `Events`
- a simplified `Home / Orders / Me` navigation model
- near-total removal of explanatory filler copy
- a more intentional typography system
- more trust and more visual restraint
- stronger poster-first discovery

The result should feel like a credible official ticketing product, not a well-styled demo.
