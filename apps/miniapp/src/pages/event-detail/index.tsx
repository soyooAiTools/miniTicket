import { Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useMemo, useState } from 'react';

import type {
  EventDetail,
  EventSession,
  EventTicketTier,
} from '../../../../../packages/contracts/src';
import {
  EmptyState,
  PageHero,
  PageShell,
  PosterEventCard,
  PrimaryButton,
  SectionHeading,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import {
  formatCompactDateTime,
  formatCurrencyCny,
  formatSaleWindow,
} from '../../ui/formatters';
import { getSaleStatusMeta } from '../../ui/status';

export default function EventDetailPage() {
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTierId, setSelectedTierId] = useState('');

  useLoad((params) => {
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
          title: '加载演出详情失败',
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
          <EmptyState
            description='平台正在同步演出详情，请稍后重新进入。'
            title='正在加载演出信息'
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  return (
    <PageShell dense>
      <PageHero
        description='先确认场次和票档，再进入观演人选择与支付。'
        eyebrow='Event detail'
        title='演出详情'
      />

      <PosterEventCard
        coverImageUrl={eventDetail.coverImageUrl}
        description={eventDetail.description ?? '官方票务平台已同步该演出的完整信息。'}
        eyebrow={`${eventDetail.city} · ${eventDetail.venueName}`}
        metaLine={`起售价 ${formatCurrencyCny(eventDetail.minPrice)}`}
        secondaryMeta={
          selectedSession ? formatCompactDateTime(selectedSession.startsAt) : '场次待定'
        }
        statusMeta={getSaleStatusMeta(eventDetail.saleStatus)}
        title={eventDetail.title}
      />

      <SurfaceCard>
        <SectionHeading
          description='当前页面优先展示会直接影响购票决策的核心信息。'
          eyebrow='Overview'
          title='演出信息'
        />
        <View className='meta-grid'>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>演出城市</Text>
            <Text className='meta-grid__value'>{eventDetail.city}</Text>
          </View>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>演出场馆</Text>
            <Text className='meta-grid__value'>{eventDetail.venueName}</Text>
          </View>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>当前状态</Text>
            <Text className='meta-grid__value'>
              {getSaleStatusMeta(eventDetail.saleStatus).label}
            </Text>
          </View>
          <View className='meta-grid__item'>
            <Text className='meta-grid__label'>退款入口</Text>
            <Text className='meta-grid__value'>
              {eventDetail.refundEntryEnabled ? '已开放' : '暂未开放'}
            </Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description='先选场次，再从场次里确认票档。'
          eyebrow='Sessions'
          title='场次与票档'
        />
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
                开演时间 {formatCompactDateTime(session.startsAt)}
              </Text>
              <Text className='detail-tier__meta'>
                销售窗口 {formatSaleWindow(session.saleStartsAt, session.saleEndsAt)}
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
                        {formatCurrencyCny(tier.price)} · 库存 {tier.inventory} · {tier.ticketType === 'PAPER_TICKET' ? '纸质票' : '电子票'}
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
        <SectionHeading
          description='把介绍和规则放在购票决策之后，保持转化优先。'
          eyebrow='Notes'
          title='购票说明'
        />
        <Text className='calendar-item__meta'>
          观演人信息提交后将进入实名履约流程，请在支付前确认信息准确。
        </Text>
        <Text className='calendar-item__meta'>
          电子票最晚演出前三天确认，纸质票最晚演出前七天确认。
        </Text>
        <Text className='calendar-item__meta'>
          如需售后，请以订单详情页中的实际开放状态为准。
        </Text>
      </SurfaceCard>

      <StickyActionBar>
        <PrimaryButton onClick={handlePurchase}>
          {selectedTier ? `选择观演人并继续 ${selectedTier.name}` : '选择票档后继续'}
        </PrimaryButton>
      </StickyActionBar>
    </PageShell>
  );
}
