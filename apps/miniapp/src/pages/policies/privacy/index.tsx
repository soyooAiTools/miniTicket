import { Text } from '@tarojs/components';

import { PageHero, PageShell, SectionHeading, SurfaceCard } from '../../../components/ui';

export default function PrivacyPolicyPage() {
  return (
    <PageShell dense>
      <PageHero title='隐私政策' />

      <SurfaceCard>
        <SectionHeading title='信息使用' />
        <Text className='calendar-item__meta'>
          平台仅为支持购票、实名验证、订单查询和售后服务收集必要信息。
        </Text>
        <Text className='calendar-item__meta'>
          信息将限定在票务业务范围内使用，不会擅自扩展到其他用途。
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title='收集范围' />
        <Text className='calendar-item__meta'>
          包括手机号、实名信息、订单信息及必要的设备信息，用于完成购票与通知。
        </Text>
        <Text className='calendar-item__meta'>
          平台会尽量减少非必要字段收集，并按业务时效保存数据。
        </Text>
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading title='用户权利' />
        <Text className='calendar-item__meta'>
          你可以查看、修改或申请处理部分账号与订单信息。
        </Text>
        <Text className='calendar-item__meta'>
          与实名票务履约直接相关的信息，将按平台规则和监管要求处理。
        </Text>
      </SurfaceCard>
    </PageShell>
  );
}
