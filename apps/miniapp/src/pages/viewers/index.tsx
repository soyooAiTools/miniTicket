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
import { getShowcaseViewers, shouldUseShowcaseContent } from '../../ui/showcase-data';

type ViewerItem = {
  id: string;
  mobile: string;
  name: string;
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
    if (shouldUseShowcaseContent()) {
      setItems(
        getShowcaseViewers().map((viewer) => ({
          id: viewer.id,
          mobile: viewer.mobile,
          name: viewer.name,
        })),
      );
      return;
    }

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
        meta={
          isSelectionMode ? (
            <Text className='calendar-item__meta'>已选 {selectedCount} 人</Text>
          ) : undefined
        }
        title={isSelectionMode ? '选择观演人' : '观演人'}
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
            title='暂无观演人'
          />
        </SurfaceCard>
      ) : (
        items.map((item) => {
          const active = selectedIds.includes(item.id);

          return (
            <SurfaceCard key={item.id} muted={active}>
              <View onClick={() => (isSelectionMode ? toggleViewer(item.id) : undefined)}>
                <Text className='section-heading__title'>{item.name}</Text>
                <Text className='calendar-item__meta'>{item.mobile}</Text>
                {isSelectionMode ? (
                  <Text className='calendar-item__meta'>
                    {active ? '已选中' : '点击选择'}
                  </Text>
                ) : null}
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
            {selectedCount === 0 ? '选择观演人后继续' : `继续支付 · 已选 ${selectedCount} 人`}
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
