import { Text, View } from '@tarojs/components';
import Taro, { useDidShow, useLoad } from '@tarojs/taro';
import { useMemo, useState } from 'react';

import {
  EmptyState,
  PageHero,
  PageShell,
  PrimaryButton,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { ensureSession } from '../../services/session';

type ViewerItem = {
  id: string;
  name: string;
  mobile: string;
};

type ViewersResponse = {
  items: ViewerItem[];
};

type SelectionContext = {
  ticketType: 'E_TICKET' | 'PAPER_TICKET';
  tierId: string;
};

export default function ViewersPage() {
  const [items, setItems] = useState<ViewerItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(
    null,
  );

  useLoad((params) => {
    const tierId = (params?.tierId ?? '').trim();

    if (!tierId) {
      return;
    }

    setSelectionContext({
      ticketType: params?.ticketType === 'PAPER_TICKET' ? 'PAPER_TICKET' : 'E_TICKET',
      tierId,
    });
  });

  const loadViewers = async () => {
    try {
      await ensureSession();
      const response = await request<ViewersResponse>({
        url: '/viewers',
      });

      setItems(response.items ?? []);
    } catch {
      Taro.showToast({
        icon: 'none',
        title: '加载观演人失败',
      });
    }
  };

  useDidShow(() => {
    void loadViewers();
  });

  const selectedCount = selectedIds.length;
  const isSelectionMode = selectionContext !== null;

  const selectedSummary = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)).map((item) => item.name),
    [items, selectedIds],
  );

  const toggleViewer = (viewerId: string) => {
    setSelectedIds((current) =>
      current.includes(viewerId)
        ? current.filter((item) => item !== viewerId)
        : [...current, viewerId],
    );
  };

  const proceedToCheckout = () => {
    if (!selectionContext || selectedIds.length === 0) {
      Taro.showToast({
        icon: 'none',
        title: '请至少选择一位观演人',
      });
      return;
    }

    void Taro.navigateTo({
      url: `/pages/checkout/index?tierId=${selectionContext.tierId}&ticketType=${selectionContext.ticketType}&viewerIds=${selectedIds.join(',')}`,
    });
  };

  return (
    <PageShell dense>
      <PageHero
        description={
          isSelectionMode
            ? '选择参与当前票档购票的实名观演人，然后继续进入支付确认。'
            : '管理常用实名观演人，结算时可以直接选择。'
        }
        eyebrow='Viewers'
        title='观演人管理'
      />

      {items.length === 0 ? (
        <SurfaceCard>
          <EmptyState
            action={
              <View style={{ marginTop: '12px', width: '100%' }}>
                <PrimaryButton
                  onClick={() => Taro.navigateTo({ url: '/pages/viewers/form' })}
                >
                  新增观演人
                </PrimaryButton>
              </View>
            }
            description='先补齐实名观演人信息，后续购票就可以直接选择。'
            title='还没有可用观演人'
          />
        </SurfaceCard>
      ) : (
        items.map((item) => {
          const active = selectedIds.includes(item.id);

          return (
            <SurfaceCard key={item.id} muted={active}>
              <View onClick={() => (isSelectionMode ? toggleViewer(item.id) : undefined)}>
                <Text className='section-heading__title'>{item.name}</Text>
                <Text className='section-heading__description'>{item.mobile}</Text>
                <Text className='calendar-item__meta'>
                  {isSelectionMode
                    ? active
                      ? '已加入本次购票'
                      : '点击加入当前票档'
                    : '实名信息已保存，可在购票时直接复用。'}
                </Text>
              </View>
            </SurfaceCard>
          );
        })
      )}

      <SurfaceCard>
        <PrimaryButton
          variant='secondary'
          onClick={() => Taro.navigateTo({ url: '/pages/viewers/form' })}
        >
          新增观演人
        </PrimaryButton>
      </SurfaceCard>

      {isSelectionMode ? (
        <StickyActionBar>
          <PrimaryButton disabled={selectedCount === 0} onClick={proceedToCheckout}>
            {selectedCount === 0
              ? '选择观演人后继续'
              : `继续支付 · 已选 ${selectedCount} 人`}
          </PrimaryButton>
          {selectedSummary.length > 0 ? (
            <Text
              style={{
                color: '#64748b',
                display: 'block',
                fontSize: '22px',
                marginTop: '10px',
                textAlign: 'center',
              }}
            >
              {selectedSummary.join('、')}
            </Text>
          ) : null}
        </StickyActionBar>
      ) : null}
    </PageShell>
  );
}
