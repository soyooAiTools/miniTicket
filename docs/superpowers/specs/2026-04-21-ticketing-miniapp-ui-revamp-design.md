# Ticketing Miniapp UI Revamp Design

## Overview

This spec defines the first full UI revamp for the `miniTicket` miniapp. The current app is functionally useful but visually reads like a product demo. The goal of this redesign is to turn it into a credible, efficient, official-looking ticketing platform for large concerts and idol performances.

The redesign will keep the existing business flows and API contracts, but replace the current ad hoc page styling with a coherent product UI system. The selected direction is a `high-efficiency platform` rather than an editorial campaign site or a single-event landing page.

`frontend-slides` is in scope as a visual exploration aid for mockups and design direction review, but not as the production implementation model. The production UI will still be built in the existing Taro miniapp codebase.

## Product Direction

### Positioning

The miniapp should feel like:

- an official ticketing platform
- efficient enough for frequent purchase behavior
- visually polished enough to avoid a demo or template feel
- suitable for large concerts, idol performances, and recurring event operations

The miniapp should not feel like:

- a one-off event campaign microsite
- a content magazine
- a fan community product
- a generic tools-only admin surface

### Chosen Design Direction

The approved direction is:

- platform type: official ticketing platform home, supporting multiple events at once
- visual tone: light, crisp, premium, and restrained
- primary palette bias: ice white and very light blue-gray
- visual emphasis: large poster-led event cards
- interaction character: efficient first, with light premium motion
- homepage priority: first-screen impact plus clear ticketing entry points

### Success Criteria

The redesign is successful when:

- the homepage immediately reads as an official ticketing platform
- users can identify what is on sale, what is coming soon, and where to act within seconds
- event cards, detail pages, and orders feel consistent and intentionally designed
- the purchase path feels clearer and more trustworthy than the current demo-like version
- the app remains easy to extend for future event operations

## Goals And Non-Goals

### Goals

- establish a full miniapp UI system instead of page-by-page styling
- redesign all customer-facing pages in the miniapp
- prioritize ticket discovery, purchase conversion, and order clarity
- introduce consistent motion, spacing, status language, and card behavior
- preserve the existing business logic and flow structure where possible

### Non-Goals

- changing backend contracts or core purchase rules
- turning the homepage into a content-heavy editorial experience
- adding social/community features
- redesigning the admin console in this phase
- building a marketing slide deck as the shipping product surface

## Information Architecture

### Bottom Navigation

The miniapp will use four persistent tabs:

- `Home`
- `Events`
- `Orders`
- `Me`

This split gives the product a stable platform structure:

- `Home` is the operational entry point
- `Events` is the complete browse-and-filter surface
- `Orders` is the fulfillment and status surface
- `Me` is the tools and service surface

### Task Pages

Supporting task pages remain outside the main tab bar:

- event detail page
- checkout / confirm payment page
- payment result page
- order detail page
- viewers page
- viewer form page
- after-sales page
- purchase policy page
- privacy policy page

## Core Page Designs

### Home

The homepage is the front door of the platform, not a single featured campaign page.

#### Structure

- top search and city switch area
- hot selling event stream
- upcoming sale section
- hot ranking module
- sale calendar module

#### Role

The homepage should help users answer:

- what is worth buying now
- what is about to open
- what is popular
- what is opening soon

#### Visual Behavior

- single-column large poster cards
- large image first, then compact metadata
- strong rhythm through spacing rather than dense copy
- platform modules use quiet containers so posters remain the primary visual focus

### Events

The events page is the full browsing and finding surface.

#### Structure

- compact filter and sort bar at the top
- single-column poster-led event list
- clearer metadata density than the homepage

#### Required Metadata Per Card

- event title
- city
- venue
- date or schedule label
- sale status
- starting price

#### Role

This page is optimized for finding, comparing, and entering detail pages quickly. It should feel more operational than the homepage, but still visually premium.

### Event Detail

The detail page should prioritize conversion before long-form content.

#### First Screen

- large poster
- event title
- city, venue, and time
- sale status
- primary purchase button or ticket-tier entry

#### Secondary Sections

- sessions and ticket tiers
- inventory and sale-state hints
- event introduction
- purchase notes
- refund rules

#### Sticky Action Area

The page should use a persistent action zone near the bottom with state-based behavior:

- `Buy Now`
- `Coming Soon`
- `Sold Out`
- `View Order`

The first screen should answer whether the event can be purchased right now and how to proceed.

## Transaction And Service Pages

### Checkout

The checkout page should be focused, low-noise, and action-led.

#### Structure

- selected tier and quantity summary
- viewer confirmation area
- condensed purchase and refund notes
- fixed primary payment button

This page should reduce visual variety and keep users oriented around finishing the payment flow.

### Payment Result

The payment result page should clearly communicate one of three states:

- payment successful, waiting for fulfillment
- payment processing
- payment failed

Each state must provide an unambiguous next action:

- view order
- return to homepage
- retry payment

### Orders

The orders page should help users understand fulfillment progress quickly.

#### Structure

- status tabs: pending payment, pending fulfillment, completed, after-sales
- order cards with poster thumbnail and primary metadata
- state-aware action buttons

#### Card Fields

- event poster thumbnail
- event title
- session time
- order amount
- order state
- primary action

### Order Detail

The order detail page is a trust page and should be optimized for clarity.

#### Structure

- primary status block
- event and session information
- tier and viewer information
- state-aware action area

This page should feel reliable and structured, with minimal decorative noise.

### After-Sales

The after-sales page should be procedural and calm.

#### Structure

- order summary
- refund rule summary
- reason selection and note input
- current handling progress
- outcome feedback

The focus is clarity and reassurance rather than expressive design.

### Me

The `Me` page should be a high-efficiency tool panel rather than a member identity center.

#### Structure

- lightweight user summary area
- quick actions
- service and support section

#### Core Entries

- my orders
- viewers
- after-sales
- purchase policy
- privacy policy
- support / contact

### Viewers

The viewers experience should be clean and form-driven.

#### Structure

- viewers list with concise identity display
- create, edit, and delete actions
- clean form page with strong real-name guidance

## Visual System

### Visual Keywords

- official
- efficient
- light premium
- poster-led
- restrained

### Palette Direction

The palette should use:

- ice white as the primary canvas
- very light blue-gray for secondary surfaces
- soft silver-gray for separators and neutral controls
- one restrained accent for key action emphasis
- restrained status colors for sale and order states

The app should avoid:

- heavy black-and-gold stage styling as the primary theme
- loud gradient marketing surfaces
- e-commerce red/orange urgency overload
- visually dense dark UI

### Poster Strategy

Large posters are the main emotional layer of the interface. Platform surfaces should be designed to frame posters, not compete with them.

This means:

- single-column large poster cards on home and events
- strong card proportions
- clean text blocks below or overlaid with careful contrast
- minimal unnecessary chrome around cards

### Typography Strategy

The miniapp should favor a system-safe typography approach suitable for WeChat mini programs:

- clean sans-serif rendering
- strong hierarchy through weight, size, and spacing
- restrained uppercase or tracking treatments only for section labels

The design should not depend on custom webfont loading for core quality.

## Motion System

Motion should support hierarchy and quality without slowing task completion.

### Approved Motion Types

- card fade-in and rise on first paint
- subtle image and text stagger on key entry surfaces
- gentle pressed, hover-like, and status transitions
- light filter-result transitions
- state transitions on buttons and order statuses

### Motion Rules

- no heavy theatrical transitions
- no flashy scale bursts or aggressive parallax
- motion should guide attention, not become the message
- loading and empty states should feel calm and polished

## Component System

The redesign should be built around reusable miniapp components rather than one-off page styling.

### Priority Components

- large poster event card
- status chip
- top search and filter strip
- session and ticket-tier selector
- sticky purchase action bar
- order status card
- tool entry card
- standardized empty, loading, and error states

### Shared Layout Rules

- consistent page gutters and section spacing
- consistent card radius families
- consistent quiet surface treatment
- consistent primary and secondary button styles
- consistent status language across event, order, and refund flows

## Content Modules

The homepage should include only two platform-style support modules beyond event feeds:

- sale calendar
- hot ranking

This keeps the product platform-like without drifting into editorial complexity.

## Implementation Guidance

### Production UI Delivery Model

The production miniapp UI will be delivered in the existing `apps/miniapp` Taro codebase, not as HTML slide output.

The workflow is:

1. use `frontend-slides` to generate a small number of high-fidelity visual references for alignment
2. extract the approved visual rules into miniapp design tokens and reusable page patterns
3. implement reusable Taro components for cards, shells, filters, sticky actions, and state views
4. recompose the existing pages around those components while preserving the business flow

This keeps the redesign practical:

- `frontend-slides` helps us decide what the product should look like
- Taro components are how the real miniapp ships

### Recommended Build Order

1. establish global tokens, spacing rules, surfaces, and button patterns
2. build the core event card and status chip components
3. redesign Home, Events, and Event Detail
4. redesign Checkout, Payment Result, Orders, and Order Detail
5. redesign Me, Viewers, and After-Sales
6. align empty, loading, and failure states

### Visual Exploration Workflow

Before implementation, `frontend-slides` can be used to generate HTML visual explorations for:

- homepage directions
- event card system
- event detail first-screen layouts

Those artifacts should be treated as alignment tools and references. The final shipping UI should be implemented in Taro-native page and component code.

### UI System Build Strategy

The miniapp redesign should introduce a proper presentation layer instead of continuing with page-local inline styles.

The expected structure is:

- shared design tokens for color, spacing, radius, elevation, and motion timing
- shared layout shells for page scaffolding and section rhythm
- reusable domain components such as poster event cards, status chips, filter bars, sticky purchase bars, order cards, and state placeholders
- page rewrites that swap the current ad hoc presentation for the new system without changing core purchase and order logic

The implementation should favor:

- preserving the existing request and navigation flow
- moving styling into reusable components and shared style files
- incremental rollout by purchase-critical page groups

The implementation should avoid:

- mixing experimental HTML-only mockup code into the miniapp runtime
- redesigning every page independently with unique styles
- coupling the visual revamp to backend contract changes

## Testing And Verification Expectations

The redesign should include:

- page-level verification in WeChat DevTools
- responsive checks across common miniapp viewport sizes
- verification that the purchase flow remains intact
- regression checks for state-driven order and payment views
- shared component consistency checks where feasible

## Risks

### Risk: Too Cold Or Too Corporate

A light official palette can drift into generic finance-product UI. Large posters and careful motion are the main counterbalance.

### Risk: Too Decorative

Trying to reintroduce “concert atmosphere” too aggressively can make the platform feel promotional instead of trustworthy. Decorative effects should remain secondary to clarity.

### Risk: Inconsistent Rollout

If pages are restyled individually without shared components and tokens, the app will still feel like a demo. The redesign must be system-first.

## Final Direction Summary

The approved target is a `high-efficiency official ticketing platform` miniapp with:

- light premium surfaces
- ice-white and blue-gray foundation
- large poster-led single-column event cards
- strong purchase clarity
- operational homepage modules
- calm premium motion
- tool-oriented support and account pages

This should produce a miniapp that feels suitable for real concert ticketing operations, not just feature demonstration.
