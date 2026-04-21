import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tarojs/components', () => ({
  Text: 'text',
  View: 'view',
}));

globalThis.React = React;

import { EmptyState } from './EmptyState';
import { PageHero } from './PageHero';

describe('UI primitives', () => {
  it('renders hero metadata in a dedicated compact slot', () => {
    const element = PageHero({
      meta: 'On sale now',
      title: 'Top picks',
    } as never);

    expect(JSON.stringify(element)).toContain('page-hero__meta');
    expect(JSON.stringify(element)).toContain('On sale now');
  });

  it('omits the empty-state description block when no description is provided', () => {
    const element = EmptyState({
      title: 'No orders yet',
    } as never);

    expect(JSON.stringify(element)).not.toContain('empty-state__description');
  });
});
