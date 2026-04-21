import type { EventCatalogSummary } from '../../../../../packages/contracts/src';

type HomeCollections = {
  catalog: EventCatalogSummary[];
  hotSale: EventCatalogSummary[];
  ranking: EventCatalogSummary[];
  saleCalendar: EventCatalogSummary[];
  upcoming: EventCatalogSummary[];
};

function byMinPriceDescending(
  left: Pick<EventCatalogSummary, 'minPrice'>,
  right: Pick<EventCatalogSummary, 'minPrice'>,
) {
  return right.minPrice - left.minPrice;
}

function getSalePriority(saleStatus: EventCatalogSummary['saleStatus']) {
  switch (saleStatus) {
    case 'ON_SALE':
      return 0;
    case 'UPCOMING':
      return 1;
    default:
      return 2;
  }
}

function compareCatalogItems(left: EventCatalogSummary, right: EventCatalogSummary) {
  const salePriorityDelta =
    getSalePriority(left.saleStatus) - getSalePriority(right.saleStatus);

  if (salePriorityDelta !== 0) {
    return salePriorityDelta;
  }

  const priceDelta = byMinPriceDescending(left, right);

  if (priceDelta !== 0) {
    return priceDelta;
  }

  return left.title.localeCompare(right.title, 'zh-CN');
}

export function buildHomeCollections(
  events: EventCatalogSummary[],
): HomeCollections {
  const catalog = [...events].sort(compareCatalogItems);
  const hotSale = catalog.filter((event) => event.saleStatus === 'ON_SALE');
  const upcoming = catalog.filter((event) => event.saleStatus === 'UPCOMING');

  return {
    catalog,
    hotSale,
    ranking: [...hotSale].slice(0, 3),
    saleCalendar: upcoming.slice(0, 4),
    upcoming,
  };
}
