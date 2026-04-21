import { Form, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';

import {
  PageHero,
  PageShell,
  PrimaryButton,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { ensureSession } from '../../services/session';

type CreateViewerPayload = {
  userId: string;
  name: string;
  idCard: string;
  mobile: string;
};

type FormState = {
  idCard: string;
  mobile: string;
  name: string;
};

const INITIAL_FORM_STATE: FormState = {
  idCard: '',
  mobile: '',
  name: '',
};

export default function ViewerFormPage() {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async () => {
    try {
      setIsSubmitting(true);
      await ensureSession();
      await request({
        data: formState satisfies Omit<CreateViewerPayload, 'userId'>,
        method: 'POST',
        url: '/viewers',
      });

      Taro.showToast({
        duration: 800,
        icon: 'success',
        title: '保存成功',
      });

      setTimeout(() => {
        Taro.navigateBack();
      }, 300);
    } catch {
      Taro.showToast({
        icon: 'none',
        title: '保存观演人失败',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell dense>
      <PageHero
        description='实名信息将参与出票履约，请在提交前再次确认姓名、证件号和手机号。'
        eyebrow='Create viewer'
        title='新增观演人'
      />

      <Form onSubmit={submit}>
        <SurfaceCard>
          <Text className='section-heading__eyebrow'>Basic info</Text>
          <Text className='section-heading__title'>实名信息</Text>
          <View style={{ marginTop: '18px' }}>
            <Text className='meta-grid__label'>姓名</Text>
            <Input
              value={formState.name}
              onInput={(event) => updateField('name', event.detail.value)}
              placeholder='请输入真实姓名'
              style={{ marginTop: '10px', paddingBottom: '18px' }}
            />
            <Text className='meta-grid__label'>身份证号</Text>
            <Input
              value={formState.idCard}
              onInput={(event) => updateField('idCard', event.detail.value)}
              placeholder='请输入身份证号'
              style={{ marginTop: '10px', paddingBottom: '18px' }}
            />
            <Text className='meta-grid__label'>手机号</Text>
            <Input
              value={formState.mobile}
              onInput={(event) => updateField('mobile', event.detail.value)}
              placeholder='请输入手机号'
              style={{ marginTop: '10px' }}
            />
          </View>
        </SurfaceCard>

        <SurfaceCard muted>
          <Text className='section-heading__eyebrow'>Notice</Text>
          <Text className='calendar-item__meta'>
            保存后会在购票时直接复用，出票前请勿填写错误信息。
          </Text>
        </SurfaceCard>

        <StickyActionBar>
          <PrimaryButton formType='submit' loading={isSubmitting}>
            保存观演人
          </PrimaryButton>
        </StickyActionBar>
      </Form>
    </PageShell>
  );
}
