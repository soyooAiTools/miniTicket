import type { EventCatalogSummary } from '../../../../../packages/contracts/src';

type NavigateTo = (options: { url: string }) => void;

type HomeEventCardAction = {
  detailUrl: string;
  onNavigate: () => void;
};

export function buildHomeEventCardAction(
  event: EventCatalogSummary,
  navigateTo: NavigateTo,
): HomeEventCardAction {
  const detailUrl = `/pages/event-detail/index?id=${event.id}`;

  return {
    detailUrl,
    onNavigate: () => navigateTo({ url: detailUrl }),
  };
}
