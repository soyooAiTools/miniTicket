import type { ReactNode } from 'react';

import { Text, View } from '@tarojs/components';

type EmptyStateProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <View className='empty-state'>
      <Text className='empty-state__title'>{title}</Text>
      {description ? (
        <Text className='empty-state__description'>{description}</Text>
      ) : null}
      {action}
    </View>
  );
}
