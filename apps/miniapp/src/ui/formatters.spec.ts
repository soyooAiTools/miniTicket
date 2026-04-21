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
