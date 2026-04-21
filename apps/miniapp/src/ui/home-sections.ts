import type { EventCatalogSummary } from '../../../../../packages/contracts/src';

type HomeCollections = {
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

export function buildHomeCollections(
  events: EventCatalogSummary[],
): HomeCollections {
  const hotSale = events
    .filter((event) => event.saleStatus === 'ON_SALE')
    .sort(byMinPriceDescending);
  const upcoming = events.filter((event) => event.saleStatus === 'UPCOMING');

  return {
    hotSale: hotSale.slice(0, 4),
    ranking: [...hotSale].slice(0, 3),
    saleCalendar: upcoming.slice(0, 4),
    upcoming: upcoming.slice(0, 4),
  };
}
