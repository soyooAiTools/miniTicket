export type AppNavKey = 'home' | 'events' | 'orders' | 'me';

type AppNavigationItem = {
  active: boolean;
  key: AppNavKey;
  label: string;
  url: string;
};

const APP_NAVIGATION_ITEMS: Omit<AppNavigationItem, 'active'>[] = [
  {
    key: 'home',
    label: '首页',
    url: '/pages/home/index',
  },
  {
    key: 'orders',
    label: '订单',
    url: '/pages/orders/index',
  },
  {
    key: 'me',
    label: '我的',
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
