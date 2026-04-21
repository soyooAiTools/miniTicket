import type { PropsWithChildren } from 'react';

import { View } from '@tarojs/components';

type SurfaceCardProps = PropsWithChildren<{
  muted?: boolean;
}>;

export function SurfaceCard({ children, muted = false }: SurfaceCardProps) {
  return (
    <View className={muted ? 'surface-card surface-card--muted' : 'surface-card'}>
      {children}
    </View>
  );
}
