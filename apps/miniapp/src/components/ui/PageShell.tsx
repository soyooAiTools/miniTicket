import type { PropsWithChildren } from 'react';

import { View } from '@tarojs/components';

type PageShellProps = PropsWithChildren<{
  dense?: boolean;
}>;

export function PageShell({ children, dense = false }: PageShellProps) {
  return (
    <View className={dense ? 'app-shell app-shell--dense' : 'app-shell'}>
      {children}
    </View>
  );
}
