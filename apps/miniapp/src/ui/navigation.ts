export type AppNavKey = 'home' | 'events' | 'orders' | 'me';

type AppNavigationItem = {
  active: boolean;
  description: string;
  key: AppNavKey;
  label: string;
  url: string;
};

const APP_NAVIGATION_ITEMS: Omit<AppNavigationItem, 'active'>[] = [
  {
    description: 'Discover',
    key: 'home',
    label: 'Home',
    url: '/pages/home/index',
  },
  {
    description: 'Browse',
    key: 'events',
    label: 'Events',
    url: '/pages/events/index',
  },
  {
    description: 'Track',
    key: 'orders',
    label: 'Orders',
    url: '/pages/orders/index',
  },
  {
    description: 'Tools',
    key: 'me',
    label: 'Me',
    url: '/pages/me/index',
  },
];

export function buildAppNavigation(activeKey: AppNavKey) {
  return APP_NAVIGATION_ITEMS.map((item) => ({
    ...item,
    active: item.key === activeKey,
  }));
}

export type { AppNavigationItem };
