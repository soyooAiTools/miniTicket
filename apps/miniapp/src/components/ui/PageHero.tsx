import type { PropsWithChildren, ReactNode } from 'react';

import { Text, View } from '@tarojs/components';

type PageHeroProps = PropsWithChildren<{
  description?: string;
  eyebrow?: string;
  footer?: ReactNode;
  title: string;
}>;

export function PageHero({
  children,
  description,
  eyebrow,
  footer,
  title,
}: PageHeroProps) {
  return (
    <View className='page-hero'>
      {eyebrow ? <Text className='page-hero__eyebrow'>{eyebrow}</Text> : null}
      <Text className='page-hero__title'>{title}</Text>
      {description ? (
        <Text className='page-hero__description'>{description}</Text>
      ) : null}
      {children}
      {footer}
    </View>
  );
}
