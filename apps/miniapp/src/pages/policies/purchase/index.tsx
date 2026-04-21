import { Text } from '@tarojs/components';

import { PageHero, PageShell, SectionHeading, SurfaceCard } from '../../../components/ui';

export default function PurchasePolicyPage() {
  return (
    <PageShell dense>
      <PageHero title='购票规则' />

      <SurfaceCard>
        <SectionHeading title='实名购票' />
        <Text className='calendar-item__meta'>
          所有订单均需实名购票，观演人信息提交后将参与出票履约。
        </Text>
        <Text className='calendar-item__meta'>
          下单前请核对姓名、证件号和手机号，并确保与入场证件一致。
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title='确认时效' />
        <Text className='calendar-item__meta'>
          电子票最晚演出前三天确认，纸质票最晚演出前七天确认。
        </Text>
        <Text className='calendar-item__meta'>
          请在时效内完成确认，以免影响后续票务处理。
        </Text>
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading title='信息错误处理' />
        <Text className='calendar-item__meta'>
          演出前三天内，如因用户信息错误导致无法录入，将按规则扣除 20% 服务费。
        </Text>
        <Text className='calendar-item__meta'>
          如需售后，请以订单详情页中的实际开放状态为准。
        </Text>
      </SurfaceCard>
    </PageShell>
  );
}
