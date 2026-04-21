# Ticketing Miniapp UI Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current miniapp into a more premium official ticketing product by merging the duplicated discovery surfaces, removing explanatory filler copy, and upgrading typography and page hierarchy without changing core business flows.

**Architecture:** Keep the current Taro miniapp logic and API integration, but reshape the presentation layer around a stricter design system. The main changes are structural and visual: collapse `Home` and `Events` into one discovery model, simplify bottom navigation, update shared UI primitives so they can render with minimal copy, and then rewrite the major pages against those primitives.

**Tech Stack:** Taro 4, React 18, TypeScript, Vitest, WeChat miniapp runtime, existing shared contracts

---

## Proposed File Structure

- `D:/miniTicket/.impeccable.md`
  Responsibility: persist the approved design context so future UI work keeps the same brand direction.
- `D:/miniTicket/docs/superpowers/specs/2026-04-21-ticketing-miniapp-ui-revamp-design.md`
  Responsibility: record the approved structure, typography, and copy rules.
- `D:/miniTicket/apps/miniapp/src/app.config.ts`
  Responsibility: page registration and the long-term handling of the `events` route.
- `D:/miniTicket/apps/miniapp/src/ui/navigation.ts`
  Responsibility: the bottom-nav model and route map.
- `D:/miniTicket/apps/miniapp/src/ui/navigation.spec.ts`
  Responsibility: prevent regressions in the simplified tab structure.
- `D:/miniTicket/apps/miniapp/src/styles/theme.css`
  Responsibility: global tokens for spacing, surfaces, and upgraded typography hierarchy.
- `D:/miniTicket/apps/miniapp/src/components/ui/AppBottomNav.tsx`
  Responsibility: simplified tab bar without descriptive subtitles.
- `D:/miniTicket/apps/miniapp/src/components/ui/PageHero.tsx`
  Responsibility: title-first hero with optional compact meta, not narrative copy.
- `D:/miniTicket/apps/miniapp/src/components/ui/SectionHeading.tsx`
  Responsibility: compact section headers that work without description text.
- `D:/miniTicket/apps/miniapp/src/components/ui/PosterEventCard.tsx`
  Responsibility: poster-led card that does not depend on body description text.
- `D:/miniTicket/apps/miniapp/src/components/ui/EmptyState.tsx`
  Responsibility: minimal placeholder patterns that can render title-only states.
- `D:/miniTicket/apps/miniapp/src/pages/home/index.tsx`
  Responsibility: the single primary discovery surface.
- `D:/miniTicket/apps/miniapp/src/pages/events/index.tsx`
  Responsibility: compatibility route that reuses or redirects to the unified discovery surface.
- `D:/miniTicket/apps/miniapp/src/pages/event-detail/index.tsx`
  Responsibility: purchase-first detail page with lower copy density.
- `D:/miniTicket/apps/miniapp/src/pages/orders/index.tsx`
  Responsibility: trust-first order list without redundant explanations.
- `D:/miniTicket/apps/miniapp/src/pages/order-detail/index.tsx`
  Responsibility: compact order fact surface.
- `D:/miniTicket/apps/miniapp/src/pages/me/index.tsx`
  Responsibility: quiet tools page with minimal text.
- `D:/miniTicket/apps/miniapp/src/pages/viewers/index.tsx`
  Responsibility: viewer management list with reduced helper text.
- `D:/miniTicket/apps/miniapp/src/pages/viewers/form.tsx`
  Responsibility: grouped viewer form with only essential guidance.
- `D:/miniTicket/apps/miniapp/src/pages/after-sales/index.tsx`
  Responsibility: procedural service page with only decision-relevant copy.

## Task 1: Lock Navigation And Typography Foundations

**Files:**
- Modify: `D:/miniTicket/apps/miniapp/src/ui/navigation.ts`
- Modify: `D:/miniTicket/apps/miniapp/src/ui/navigation.spec.ts`
- Modify: `D:/miniTicket/apps/miniapp/src/styles/theme.css`
- Modify: `D:/miniTicket/apps/miniapp/src/components/ui/AppBottomNav.tsx`

- [ ] **Step 1: Write or update failing navigation tests**

```ts
import { describe, expect, it } from 'vitest';

import { buildAppNavigation } from './navigation';

describe('buildAppNavigation', () => {
  it('keeps only home, orders, and me as primary tabs', () => {
    expect(buildAppNavigation('home').map((item) => item.key)).toEqual([
      'home',
      'orders',
      'me',
    ]);
  });
});
```

- [ ] **Step 2: Run the navigation tests to verify failure**

Run: `corepack pnpm --filter miniapp test -- src/ui/navigation.spec.ts`
Expected: FAIL because the current nav still includes `events`.

- [ ] **Step 3: Update navigation model and bottom-nav rendering**

```ts
export type AppNavKey = 'home' | 'orders' | 'me';

const APP_NAVIGATION_ITEMS = [
  { key: 'home', label: 'Home', url: '/pages/home/index' },
  { key: 'orders', label: 'Orders', url: '/pages/orders/index' },
  { key: 'me', label: 'Me', url: '/pages/me/index' },
];
```

```tsx
<Text className='app-nav__label'>{item.label}</Text>
```

- [ ] **Step 4: Upgrade typography tokens in the theme**

```css
:root {
  --font-display: "Baskerville", "Times New Roman", "Songti SC", "STSong", serif;
  --font-ui: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.page-hero__title,
.section-heading__title,
.poster-card__overlay-title {
  font-family: var(--font-display);
}

.app-shell,
.detail-list__value,
.calendar-item__meta {
  font-family: var(--font-ui);
}
```

- [ ] **Step 5: Run the navigation tests again**

Run: `corepack pnpm --filter miniapp test -- src/ui/navigation.spec.ts`
Expected: PASS.

## Task 2: Make Shared UI Primitives Work Without Narrative Copy

**Files:**
- Modify: `D:/miniTicket/apps/miniapp/src/components/ui/PageHero.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/components/ui/SectionHeading.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/components/ui/PosterEventCard.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/components/ui/EmptyState.tsx`

- [ ] **Step 1: Write a failing test for title-only section rendering where practical**

```ts
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { SectionHeading } from '../components/ui/SectionHeading';

it('renders cleanly without description text', () => {
  const html = renderToString(<SectionHeading title='Top picks' />);
  expect(html).toContain('Top picks');
});
```

- [ ] **Step 2: Run the relevant miniapp tests**

Run: `corepack pnpm --filter miniapp test`
Expected: FAIL if any component still assumes descriptive copy is always present.

- [ ] **Step 3: Refactor the shared components to title-first behavior**

```tsx
type PageHeroProps = {
  title: string;
  eyebrow?: string;
  meta?: ReactNode;
  children?: ReactNode;
};
```

```tsx
type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  trailing?: ReactNode;
};
```

```tsx
type EmptyStateProps = {
  title: string;
  action?: ReactNode;
};
```

- [ ] **Step 4: Re-run miniapp tests**

Run: `corepack pnpm --filter miniapp test`
Expected: PASS.

## Task 3: Merge Home And Events Into One Discovery Model

**Files:**
- Modify: `D:/miniTicket/apps/miniapp/src/pages/home/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/events/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/app.config.ts`

- [ ] **Step 1: Rewrite `home` as the only real discovery surface**

Implementation requirements:
- keep the large poster-led list
- remove hero description copy
- keep ranking and sale calendar only if they stay compact
- remove the quick-access block that exists only to explain navigation

- [ ] **Step 2: Make `events` a compatibility route**

Implementation requirement:
- either render the same discovery composition as `home`
- or immediately redirect/relaunch to `/pages/home/index`

- [ ] **Step 3: Keep route registration intact while removing product duplication**

```ts
pages: [
  'pages/home/index',
  'pages/events/index',
  // ...
]
```

The route may stay registered, but it must stop behaving like a separate first-class destination.

- [ ] **Step 4: Build the miniapp**

Run: `corepack pnpm --filter miniapp build:weapp`
Expected: PASS.

## Task 4: Remove Explanatory Copy Across Core Pages

**Files:**
- Modify: `D:/miniTicket/apps/miniapp/src/pages/event-detail/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/orders/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/order-detail/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/me/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/viewers/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/viewers/form.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/after-sales/index.tsx`

- [ ] **Step 1: Audit and remove narrative copy**

Remove patterns such as:
- “this page helps…”
- “here you can…”
- repeated descriptions under section titles
- tool-card helper paragraphs that restate obvious destinations

- [ ] **Step 2: Replace deleted text with stronger hierarchy where needed**

Examples:
- stronger section spacing
- better metadata grouping
- clearer state chip placement
- tighter button placement

- [ ] **Step 3: Preserve rule text only where it is required for decisions**

Allowed examples:
- refund rules
- real-name ticketing warnings
- payment or order state results

- [ ] **Step 4: Run the miniapp build again**

Run: `corepack pnpm --filter miniapp build:weapp`
Expected: PASS.

## Task 5: Tighten High-Trust Visual Quality On Key Pages

**Files:**
- Modify: `D:/miniTicket/apps/miniapp/src/styles/theme.css`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/home/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/event-detail/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/orders/index.tsx`
- Modify: `D:/miniTicket/apps/miniapp/src/pages/order-detail/index.tsx`

- [ ] **Step 1: Increase title/body contrast**

Implementation requirements:
- larger gap between display titles and body text
- shorter line lengths for large titles
- calmer body text color

- [ ] **Step 2: Reduce “demo card” feeling**

Implementation requirements:
- fewer visual dividers
- less repeated small text
- more whitespace around high-value content blocks

- [ ] **Step 3: Make order and detail pages feel more ledger-like**

Implementation requirements:
- emphasize state, amount, and ticket facts
- reduce descriptive scaffolding
- keep sticky actions compact

- [ ] **Step 4: Run lint and tests**

Run: `corepack pnpm lint`
Expected: PASS.

Run: `corepack pnpm test`
Expected: PASS.

## Task 6: Final DevTools Verification

**Files:**
- Verify only

- [ ] **Step 1: Start or confirm local API health**

Run: `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3100/api/health`
Expected: `{"status":"ok","service":"authorized-ticketing-api"}`

- [ ] **Step 2: Start miniapp watch build**

Run: `corepack pnpm --filter miniapp dev:weapp`
Expected: watch compilation succeeds.

- [ ] **Step 3: Review the app in WeChat DevTools**

Expected review points:
- homepage is now the single clear discovery surface
- bottom nav shows only `Home / Orders / Me`
- the app no longer uses narrative descriptive paragraphs
- typography feels more premium and deliberate
- event detail and order detail read cleanly at a glance

## Plan Self-Review

### Spec Coverage

- merged discovery architecture: covered by Task 3
- copy reduction across the app: covered by Task 4
- typography and premium feel: covered by Tasks 1 and 5
- simplified navigation: covered by Task 1
- page-level verification: covered by Task 6

### Placeholder Scan

- no `TODO` or `TBD` markers remain
- commands are explicit
- changed files are named directly
- each task ties back to a concrete product change

### Type Consistency

- nav keys stay aligned between `navigation.ts` and `AppBottomNav.tsx`
- shared components move toward optional descriptive copy rather than requiring it
- page rewrites keep existing route file names and API contracts intact
