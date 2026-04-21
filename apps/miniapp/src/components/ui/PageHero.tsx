import type { PropsWithChildren, ReactNode } from 'react';

import { Text, View } from '@tarojs/components';

type PageHeroProps = PropsWithChildren<{
  description?: string;
  eyebrow?: string;
  footer?: ReactNode;
  meta?: ReactNode;
  title: string;
}>;

export function PageHero({
  children,
  description,
  eyebrow,
  footer,
  meta,
  title,
}: PageHeroProps) {
  return (
    <View className='page-hero'>
      {eyebrow ? <Text className='page-hero__eyebrow'>{eyebrow}</Text> : null}
      <Text className='page-hero__title'>{title}</Text>
      {meta ? <View className='page-hero__meta'>{meta}</View> : null}
      {description ? (
        <Text className='page-hero__description'>{description}</Text>
      ) : null}
      {children}
      {footer}
    </View>
  );
}
