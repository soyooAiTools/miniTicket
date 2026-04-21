import Taro, { useDidShow } from '@tarojs/taro';

import { PageShell } from '../../components/ui';

export default function EventsPage() {
  useDidShow(() => {
    void Taro.reLaunch({ url: '/pages/home/index' });
  });

  return <PageShell />;
}
