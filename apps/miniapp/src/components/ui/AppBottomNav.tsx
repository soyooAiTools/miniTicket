import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import type { AppNavKey } from '../../ui/navigation';
import { buildAppNavigation } from '../../ui/navigation';

type AppBottomNavProps = {
  activeKey: AppNavKey;
};

export function AppBottomNav({ activeKey }: AppBottomNavProps) {
  const items = buildAppNavigation(activeKey);

  return (
    <View className='app-nav'>
      {items.map((item) => (
        <View
          key={item.key}
          className={item.active ? 'app-nav__item app-nav__item--active' : 'app-nav__item'}
          onClick={() => {
            if (item.active) {
              return;
            }

            void Taro.reLaunch({
              url: item.url,
            });
          }}
        >
          <Text className='app-nav__label'>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
