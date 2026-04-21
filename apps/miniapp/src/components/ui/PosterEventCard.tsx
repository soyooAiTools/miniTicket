import { Image, Text, View } from '@tarojs/components';

import type { StatusMeta } from '../../ui/status';
import { StatusChip } from './StatusChip';

type PosterEventCardProps = {
  coverImageUrl?: string;
  description?: string;
  eyebrow?: string;
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
          {eyebrow ? <Text className='poster-card__eyebrow'>{eyebrow}</Text> : null}
          <StatusChip meta={statusMeta} />
        </View>
        <View className='poster-card__info-band'>
          <Text className='poster-card__title'>{title}</Text>
          {(metaLine || secondaryMeta) && (
            <View className='poster-card__meta-stack'>
              {metaLine ? <Text className='poster-card__meta'>{metaLine}</Text> : null}
              {secondaryMeta ? (
                <Text className='poster-card__meta'>{secondaryMeta}</Text>
              ) : null}
            </View>
          )}
          {description ? (
            <Text className='poster-card__description'>{description}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
