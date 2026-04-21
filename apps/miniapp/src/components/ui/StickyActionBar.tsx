import type { PropsWithChildren } from 'react';

import { View } from '@tarojs/components';

export function StickyActionBar({ children }: PropsWithChildren) {
  return <View className='sticky-action-bar'>{children}</View>;
}
