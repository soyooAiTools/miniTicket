import type { ReactNode } from 'react';

import { Text, View } from '@tarojs/components';

type SectionHeadingProps = {
  description?: string;
  eyebrow?: string;
  title: string;
  trailing?: ReactNode;
};

export function SectionHeading({
  description,
  eyebrow,
  title,
  trailing,
}: SectionHeadingProps) {
  return (
    <View className='section-heading'>
      <View>
        {eyebrow ? <Text className='section-heading__eyebrow'>{eyebrow}</Text> : null}
        <Text className='section-heading__title'>{title}</Text>
        {description ? (
          <Text className='section-heading__description'>{description}</Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
