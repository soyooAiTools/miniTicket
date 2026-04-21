import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function readRelative(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

describe('miniapp layout regressions', () => {
  it('keeps primary tab pages free of top summary pill rows', () => {
    const homePage = readRelative('../pages/home/index.tsx');
    const ordersPage = readRelative('../pages/orders/index.tsx');
    const mePage = readRelative('../pages/me/index.tsx');

    expect(homePage).not.toContain('pill-row');
    expect(ordersPage).not.toContain('pill-row');
    expect(mePage).not.toContain('pill-row');
  });

  it('anchors floating navigation and action bars inside the safe area', () => {
    const themeCss = readRelative('../styles/theme.css');

    expect(themeCss).toContain('safe-area-inset-bottom');
    expect(themeCss).toMatch(/app-shell[\s\S]*padding: 24px 24px calc\(/);
    expect(themeCss).toMatch(/app-nav[\s\S]*bottom: calc\(/);
    expect(themeCss).toMatch(/sticky-action-bar[\s\S]*bottom: calc\(/);
  });

  it('keeps the event detail page on its own stable hero layout', () => {
    const detailPage = readRelative('../pages/event-detail/index.tsx');
    const themeCss = readRelative('../styles/theme.css');

    expect(detailPage).not.toContain('PosterEventCard');
    expect(detailPage).not.toContain('PageHero');
    expect(detailPage).toContain("className='detail-hero fade-stagger'");
    expect(detailPage).toContain("SectionHeading title='场次与票档'");
    expect(themeCss).toContain('.detail-hero__content');
  });
});
