# Ticketing Miniapp UI Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current miniapp from a functional demo into a polished, high-efficiency official ticketing platform UI without changing the core purchase and order flows.

**Architecture:** Keep the current Taro miniapp business logic and API integration, but introduce a proper presentation layer made of shared design tokens, reusable UI components, page-level layout shells, and pure helper modules for status and formatting. Use `frontend-slides` only for visual reference, then ship the real UI in `apps/miniapp`.

**Tech Stack:** Taro 4, React 18, TypeScript, Vitest, WeChat miniapp runtime, existing shared contracts

---

## Proposed File Structure

- `apps/miniapp/src/app.tsx`
  Responsibility: load shared global theme styles once.
- `apps/miniapp/src/styles/theme.css`
  Responsibility: define app-wide color, spacing, radius, shadow, and motion tokens plus base utility classes.
- `apps/miniapp/src/ui/formatters.ts`
  Responsibility: centralize date, price, and text formatting for event and order surfaces.
- `apps/miniapp/src/ui/status.ts`
  Responsibility: map sale status, order status, and ticket type to user-facing labels and style variants.
- `apps/miniapp/src/ui/home-sections.ts`
  Responsibility: build homepage ranking and sale-calendar slices from event data.
- `apps/miniapp/src/ui/*.spec.ts`
  Responsibility: verify formatter and status behavior before UI composition.
- `apps/miniapp/src/components/ui/PageShell.tsx`
  Responsibility: provide the light premium page scaffold and section rhythm.
- `apps/miniapp/src/components/ui/PageHero.tsx`
  Responsibility: render page title, supporting copy, and optional quick actions.
- `apps/miniapp/src/components/ui/SurfaceCard.tsx`
  Responsibility: render the shared quiet card surface.
- `apps/miniapp/src/components/ui/StatusChip.tsx`
  Responsibility: render reusable state tags.
- `apps/miniapp/src/components/ui/PosterEventCard.tsx`
  Responsibility: render the poster-led event card used across homepage, events, and order/event surfaces.
- `apps/miniapp/src/components/ui/SectionHeading.tsx`
  Responsibility: standardize section label, title, and trailing actions.
- `apps/miniapp/src/components/ui/PrimaryButton.tsx`
  Responsibility: standardize primary and secondary button appearance.
- `apps/miniapp/src/components/ui/EmptyState.tsx`
  Responsibility: standardize empty and loading-friendly placeholders.
- `apps/miniapp/src/components/ui/StickyActionBar.tsx`
  Responsibility: standardize sticky bottom action areas on action-driven pages.
- `apps/miniapp/src/pages/home/index.tsx`
  Responsibility: platform homepage with hot sale, upcoming, ranking, and sale calendar.
- `apps/miniapp/src/pages/events/index.tsx`
  Responsibility: full event discovery page with list rhythm and quick filters.
- `apps/miniapp/src/pages/event-detail/index.tsx`
  Responsibility: poster-first event detail with sessions, tiers, and purchase-first structure.
- `apps/miniapp/src/pages/orders/index.tsx`
  Responsibility: status-led order center.
- `apps/miniapp/src/pages/order-detail/index.tsx`
  Responsibility: trust-first order detail page.
- `apps/miniapp/src/pages/payment-result/index.tsx`
  Responsibility: clear three-state payment result feedback.
- `apps/miniapp/src/pages/me/index.tsx`
  Responsibility: high-efficiency tools dashboard.
- `apps/miniapp/src/pages/viewers/index.tsx`
  Responsibility: viewer list management surface.
- `apps/miniapp/src/pages/viewers/form.tsx`
  Responsibility: viewer create form with clearer field grouping and guidance.
- `apps/miniapp/src/pages/after-sales/index.tsx`
  Responsibility: procedural after-sales request page.
- `apps/miniapp/src/app.config.ts`
  Responsibility: register any new asset references and optional tab/navigation updates.

## Task 1: Establish UI Helpers With Tests

**Files:**
- Create: `apps/miniapp/src/ui/formatters.ts`
- Create: `apps/miniapp/src/ui/status.ts`
- Create: `apps/miniapp/src/ui/home-sections.ts`
- Create: `apps/miniapp/src/ui/formatters.spec.ts`
- Create: `apps/miniapp/src/ui/status.spec.ts`
- Create: `apps/miniapp/src/ui/home-sections.spec.ts`

- [ ] **Step 1: Write the failing formatter tests**

```ts
// apps/miniapp/src/ui/formatters.spec.ts
import { describe, expect, it } from 'vitest';

import {
  formatCompactDate,
  formatCurrencyCny,
  formatSaleWindow,
} from './formatters';

describe('formatters', () => {
  it('formats integer price as cny label', () => {
    expect(formatCurrencyCny(399)).toBe('399 RMB');
  });

  it('formats iso time into compact date copy', () => {
    expect(formatCompactDate('2026-05-01T19:30:00.000Z')).toContain('2026');
  });

  it('builds sale window copy when both start and end exist', () => {
    expect(
      formatSaleWindow('2026-05-01T10:00:00.000Z', '2026-05-02T18:00:00.000Z'),
    ).toContain('2026');
  });
});
```

- [ ] **Step 2: Write the failing status tests**

```ts
// apps/miniapp/src/ui/status.spec.ts
import { describe, expect, it } from 'vitest';

import { getOrderStatusMeta, getSaleStatusMeta } from './status';

describe('status meta', () => {
  it('maps on-sale status to a highlighted meta object', () => {
    expect(getSaleStatusMeta('ON_SALE')).toMatchObject({
      tone: 'accent',
      label: 'On sale',
    });
  });

  it('maps pending fulfillment orders to trust-oriented copy', () => {
    expect(getOrderStatusMeta('PAID_PENDING_FULFILLMENT')).toMatchObject({
      tone: 'info',
      label: 'Pending fulfillment',
    });
  });
});
```

- [ ] **Step 3: Write the failing homepage section tests**

```ts
// apps/miniapp/src/ui/home-sections.spec.ts
import { describe, expect, it } from 'vitest';

import { buildHomeCollections } from './home-sections';

describe('buildHomeCollections', () => {
  it('splits events into hot sale and upcoming sections', () => {
    const result = buildHomeCollections([
      { id: '1', minPrice: 399, saleStatus: 'ON_SALE', title: 'A' },
      { id: '2', minPrice: 299, saleStatus: 'UPCOMING', title: 'B' },
    ] as never[]);

    expect(result.hotSale).toHaveLength(1);
    expect(result.upcoming).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Run the helper tests to verify they fail**

Run: `corepack pnpm --filter miniapp test -- src/ui`

Expected: FAIL because the helper modules do not exist yet.

- [ ] **Step 5: Implement the helper modules**

```ts
// apps/miniapp/src/ui/status.ts
import type { OrderStatus, SaleStatus } from '../../../../../packages/contracts/src';

export type StatusMeta = {
  label: string;
  tone: 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger';
};

export function getSaleStatusMeta(status: SaleStatus): StatusMeta {
  if (status === 'ON_SALE') return { label: 'On sale', tone: 'accent' };
  if (status === 'UPCOMING') return { label: 'Coming soon', tone: 'info' };
  return { label: 'Sold out', tone: 'neutral' };
}
```

```ts
// apps/miniapp/src/ui/formatters.ts
export function formatCurrencyCny(value: number) {
  return `${value} RMB`;
}
```

- [ ] **Step 6: Run the helper tests to verify they pass**

Run: `corepack pnpm --filter miniapp test -- src/ui`

Expected: PASS for the new helper tests.

## Task 2: Build The Shared Miniapp UI System

**Files:**
- Modify: `apps/miniapp/src/app.tsx`
- Create: `apps/miniapp/src/styles/theme.css`
- Create: `apps/miniapp/src/components/ui/PageShell.tsx`
- Create: `apps/miniapp/src/components/ui/PageHero.tsx`
- Create: `apps/miniapp/src/components/ui/SurfaceCard.tsx`
- Create: `apps/miniapp/src/components/ui/SectionHeading.tsx`
- Create: `apps/miniapp/src/components/ui/StatusChip.tsx`
- Create: `apps/miniapp/src/components/ui/PosterEventCard.tsx`
- Create: `apps/miniapp/src/components/ui/PrimaryButton.tsx`
- Create: `apps/miniapp/src/components/ui/EmptyState.tsx`
- Create: `apps/miniapp/src/components/ui/StickyActionBar.tsx`

- [ ] **Step 1: Load a global theme stylesheet in the app entry**

```tsx
// apps/miniapp/src/app.tsx
import './styles/theme.css';
```

- [ ] **Step 2: Define the shared design tokens and base classes**

```css
/* apps/miniapp/src/styles/theme.css */
:root {
  --bg-page: #f4f8fc;
  --bg-surface: rgba(255, 255, 255, 0.88);
  --text-strong: #0f1728;
  --text-muted: #64748b;
  --line-soft: rgba(148, 163, 184, 0.18);
  --accent: #274b7a;
  --accent-soft: #e3eefc;
  --radius-xl: 28px;
  --radius-lg: 22px;
  --shadow-soft: 0 18px 48px rgba(102, 132, 173, 0.12);
}
```

- [ ] **Step 3: Add the shared shell, card, chip, and poster components**

```tsx
// apps/miniapp/src/components/ui/PageShell.tsx
import { View } from '@tarojs/components';

export function PageShell({ children }: { children: React.ReactNode }) {
  return <View className='app-shell'>{children}</View>;
}
```

- [ ] **Step 4: Build the miniapp to verify the shared layer compiles**

Run: `corepack pnpm --filter miniapp build:weapp`

Expected: PASS.

## Task 3: Redesign Home, Events, And Event Detail

**Files:**
- Modify: `apps/miniapp/src/pages/home/index.tsx`
- Modify: `apps/miniapp/src/pages/events/index.tsx`
- Modify: `apps/miniapp/src/pages/event-detail/index.tsx`

- [ ] **Step 1: Move Home to the new platform structure**

```tsx
// apps/miniapp/src/pages/home/index.tsx
// render:
// - search/city hero
// - hot sale cards
// - upcoming sale section
// - hot ranking
// - sale calendar
```

- [ ] **Step 2: Move Events to the new single-column discovery flow**

```tsx
// apps/miniapp/src/pages/events/index.tsx
// render:
// - quick filter row
// - poster-led event list
// - clearer metadata than homepage
```

- [ ] **Step 3: Move Event Detail to a purchase-first layout**

```tsx
// apps/miniapp/src/pages/event-detail/index.tsx
// render:
// - poster hero
// - time / venue / state
// - session and tier cards
// - intro and rules sections
// - sticky purchase action
```

- [ ] **Step 4: Build the miniapp to verify the three pages compile**

Run: `corepack pnpm --filter miniapp build:weapp`

Expected: PASS.

## Task 4: Redesign Orders, Order Detail, And Payment Result

**Files:**
- Modify: `apps/miniapp/src/pages/orders/index.tsx`
- Modify: `apps/miniapp/src/pages/order-detail/index.tsx`
- Modify: `apps/miniapp/src/pages/payment-result/index.tsx`

- [ ] **Step 1: Reshape Orders into a status-led center**
- [ ] **Step 2: Reshape Order Detail into a trust-first detail surface**
- [ ] **Step 3: Reshape Payment Result into clear three-state feedback**
- [ ] **Step 4: Build the miniapp**

Run: `corepack pnpm --filter miniapp build:weapp`

Expected: PASS.

## Task 5: Redesign Me, Viewers, Viewer Form, And After-Sales

**Files:**
- Modify: `apps/miniapp/src/pages/me/index.tsx`
- Modify: `apps/miniapp/src/pages/viewers/index.tsx`
- Modify: `apps/miniapp/src/pages/viewers/form.tsx`
- Modify: `apps/miniapp/src/pages/after-sales/index.tsx`

- [ ] **Step 1: Turn Me into a tool-oriented dashboard**
- [ ] **Step 2: Move Viewers list to card-based management**
- [ ] **Step 3: Move Viewer Form to grouped field sections**
- [ ] **Step 4: Move After-Sales to a procedural service page**
- [ ] **Step 5: Build the miniapp**

Run: `corepack pnpm --filter miniapp build:weapp`

Expected: PASS.

## Task 6: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run miniapp tests**

Run: `corepack pnpm --filter miniapp test`

Expected: PASS.

- [ ] **Step 2: Run workspace lint**

Run: `corepack pnpm lint`

Expected: PASS.

- [ ] **Step 3: Run the miniapp production build**

Run: `corepack pnpm --filter miniapp build:weapp`

Expected: PASS.

- [ ] **Step 4: Run a devtools smoke check**

Expected review points:
- homepage renders with the new light premium system
- events page renders poster-led list
- event detail first screen is purchase-first
- orders and me pages no longer read like demo screens

## Plan Self-Review

### Spec Coverage

- high-efficiency platform direction: covered in Tasks 2-5
- light premium visual system: covered in Task 2
- poster-led cards and key page redesigns: covered in Tasks 3-5
- motion/status/formatting consistency: covered in Tasks 1-2
- preserving business flow: reflected in page modifications rather than API changes

### Placeholder Scan

- no `TODO` or `TBD` markers remain
- each task names exact files and verification commands
- implementation order follows the approved spec instead of page-local restyling

### Type Consistency

- all status helpers point back to the existing shared contract enums
- pricing and event time display stay centralized in `formatters.ts`
- homepage ranking and sale calendar derive from the same event summary shape
