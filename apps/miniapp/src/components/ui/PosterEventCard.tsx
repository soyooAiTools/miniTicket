import type { ReactNode } from 'react';

import { Image, Text, View } from '@tarojs/components';

import type { StatusMeta } from '../../ui/status';
import { StatusChip } from './StatusChip';

type PosterEventCardProps = {
  coverImageUrl?: string;
  description?: string;
  eyebrow?: string;
  footer?: ReactNode;
  metaLine?: string;
  onClick?: () => void;
  secondaryMeta?: string;
  statusMeta: StatusMeta;
  title: string;
};

export function PosterEventCard({
  coverImageUrl,
  description,
  eyebrow,
  footer,
  metaLine,
  onClick,
  secondaryMeta,
  statusMeta,
  title,
}: PosterEventCardProps) {
  return (
    <View className='poster-card fade-stagger' hoverClass='none' onClick={onClick}>
      <View className='poster-card__cover'>
        {coverImageUrl ? (
          <Image
            className='poster-card__image'
            mode='aspectFill'
            src={coverImageUrl}
          />
        ) : (
          <View className='poster-card__placeholder'>
            <Text className='poster-card__placeholder-text'>{title}</Text>
          </View>
        )}
        <View className='poster-card__cover-meta'>
          <View>
            {eyebrow ? <Text className='poster-card__eyebrow'>{eyebrow}</Text> : null}
            <Text className='poster-card__overlay-title'>{title}</Text>
          </View>
          <StatusChip meta={statusMeta} />
        </View>
      </View>

      <View className='poster-card__content'>
        {(metaLine || secondaryMeta) && (
          <View className='poster-card__meta-row'>
            <View>
              {metaLine ? <Text className='poster-card__meta'>{metaLine}</Text> : null}
              {secondaryMeta ? (
                <Text className='poster-card__meta'>{secondaryMeta}</Text>
              ) : null}
            </View>
          </View>
        )}
        {description ? (
          <Text className='poster-card__description'>{description}</Text>
        ) : null}
        {footer ? <View className='poster-card__footer'>{footer}</View> : null}
      </View>
    </View>
  );
}
