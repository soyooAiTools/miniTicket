import { Image, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useMemo, useState } from 'react';

import type {
  EventDetail,
  EventSession,
  EventTicketTier,
} from '../../../../../packages/contracts/src';
import {
  EmptyState,
  PageShell,
  PrimaryButton,
  SectionHeading,
  StatusChip,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import {
  formatCompactDateTime,
  formatCurrencyCny,
  formatSaleWindow,
} from '../../ui/formatters';
import {
  getShowcaseEventDetail,
  shouldUseShowcaseContent,
} from '../../ui/showcase-data';
import { getSaleStatusMeta, getTicketTypeLabel } from '../../ui/status';

export default function EventDetailPage() {
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTierId, setSelectedTierId] = useState('');

  useLoad((params) => {
    if (shouldUseShowcaseContent()) {
      const result = getShowcaseEventDetail(params?.id);
      setEventDetail(result);
      setSelectedSessionId(result.sessions[0]?.id ?? '');
      setSelectedTierId(result.sessions[0]?.ticketTiers[0]?.id ?? '');
      return;
    }

    if (!params?.id) {
      return;
    }

    void request<EventDetail>({
      url: `/catalog/events/${params.id}`,
    })
      .then((result) => {
        setEventDetail(result);
        setSelectedSessionId(result.sessions[0]?.id ?? '');
        setSelectedTierId(result.sessions[0]?.ticketTiers[0]?.id ?? '');
      })
      .catch(() => {
        Taro.showToast({
          icon: 'none',
          title: '加载演出失败',
        });
      });
  });

  const selectedSession = useMemo(
    () =>
      eventDetail?.sessions.find((session) => session.id === selectedSessionId) ??
      eventDetail?.sessions[0] ??
      null,
    [eventDetail, selectedSessionId],
  );
  const selectedTier = useMemo(
    () =>
      selectedSession?.ticketTiers.find((tier) => tier.id === selectedTierId) ??
      selectedSession?.ticketTiers[0] ??
      null,
    [selectedSession, selectedTierId],
  );

  const handlePurchase = () => {
    if (!selectedTier) {
      Taro.showToast({
        icon: 'none',
        title: '请先选择票档',
      });
      return;
    }

    void Taro.navigateTo({
      url: `/pages/viewers/index?tierId=${selectedTier.id}&ticketType=${selectedTier.ticketType}`,
    });
  };

  if (!eventDetail) {
    return (
      <PageShell dense>
        <SurfaceCard>
          <EmptyState title='演出加载中' />
        </SurfaceCard>
      </PageShell>
    );
  }

  const saleStatusMeta = getSaleStatusMeta(eventDetail.saleStatus);

  return (
    <PageShell dense>
      <View className='detail-hero fade-stagger'>
        <View className='detail-hero__media'>
          {eventDetail.coverImageUrl ? (
            <Image
              className='detail-hero__image'
              mode='aspectFill'
              src={eventDetail.coverImageUrl}
            />
          ) : (
            <View className='detail-hero__placeholder'>
              <Text className='detail-hero__placeholder-title'>{eventDetail.title}</Text>
            </View>
          )}
          <View className='detail-hero__status'>
            <StatusChip meta={saleStatusMeta} />
          </View>
          <View className='detail-hero__content'>
            <Text className='detail-hero__eyebrow'>演出详情</Text>
            <Text className='detail-hero__title'>{eventDetail.title}</Text>
            <View className='detail-hero__meta-stack'>
              <Text className='detail-hero__meta'>
                {eventDetail.city} · {eventDetail.venueName}
              </Text>
              <Text className='detail-hero__meta'>
                {selectedSession
                  ? `开演 ${formatCompactDateTime(selectedSession.startsAt)}`
                  : '场次待定'}
              </Text>
              <Text className='detail-hero__price'>
                起售价 {formatCurrencyCny(eventDetail.minPrice)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <SurfaceCard>
        <SectionHeading title='购票信息' />
        <View className='meta-grid'>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>场馆</Text>
            <Text className='meta-grid__value'>{eventDetail.venueName}</Text>
          </View>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>城市</Text>
            <Text className='meta-grid__value'>{eventDetail.city}</Text>
          </View>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>状态</Text>
            <Text className='meta-grid__value'>{saleStatusMeta.label}</Text>
          </View>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>售后</Text>
            <Text className='meta-grid__value'>
              {eventDetail.refundEntryEnabled ? '已开放' : '未开放'}
            </Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title='场次与票档' />
        {eventDetail.sessions.map((session: EventSession) => {
          const sessionSelected = session.id === selectedSession?.id;

          return (
            <View
              key={session.id}
              className='detail-tier'
              onClick={() => {
                setSelectedSessionId(session.id);
                setSelectedTierId(session.ticketTiers[0]?.id ?? '');
              }}
            >
              <Text className='detail-tier__title'>
                {session.name}
                {sessionSelected ? ' · 已选中' : ''}
              </Text>
              <Text className='detail-tier__meta'>
                开演 {formatCompactDateTime(session.startsAt)}
              </Text>
              <Text className='detail-tier__meta'>
                开售 {formatSaleWindow(session.saleStartsAt, session.saleEndsAt)}
              </Text>
              {sessionSelected ? (
                <View style={{ marginTop: '16px' }}>
                  {session.ticketTiers.map((tier: EventTicketTier) => (
                    <View
                      key={tier.id}
                      className='detail-tier'
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedTierId(tier.id);
                      }}
                      style={{
                        background:
                          tier.id === selectedTier?.id
                            ? 'rgba(227, 238, 252, 0.96)'
                            : 'rgba(246, 250, 255, 0.88)',
                      }}
                    >
                      <Text className='detail-tier__title'>
                        {tier.name}
                        {tier.id === selectedTier?.id ? ' · 当前票档' : ''}
                      </Text>
                      <Text className='detail-tier__meta'>
                        {formatCurrencyCny(tier.price)} · 库存 {tier.inventory} ·{' '}
                        {getTicketTypeLabel(tier.ticketType)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading title='购票规则' />
        <Text className='calendar-item__meta'>
          下单前请确认观演人信息与证件一致。
        </Text>
        <Text className='calendar-item__meta'>
          售后入口以订单状态和活动规则为准。
        </Text>
      </SurfaceCard>

      <StickyActionBar>
        <PrimaryButton onClick={handlePurchase}>
          {selectedTier ? `选择观演人 · ${selectedTier.name}` : '选择票档后继续'}
        </PrimaryButton>
      </StickyActionBar>
    </PageShell>
  );
}
