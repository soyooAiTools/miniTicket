import type { PropsWithChildren } from 'react';

import { Button } from '@tarojs/components';

type PrimaryButtonProps = PropsWithChildren<{
  disabled?: boolean;
  formType?: 'submit' | 'reset';
  loading?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}>;

export function PrimaryButton({
  children,
  disabled = false,
  formType,
  loading = false,
  onClick,
  variant = 'primary',
}: PrimaryButtonProps) {
  const className =
    variant === 'primary'
      ? 'primary-button'
      : variant === 'secondary'
        ? 'primary-button primary-button--secondary'
        : 'primary-button primary-button--ghost';

  return (
    <Button
      className={className}
      disabled={disabled}
      formType={formType}
      loading={loading}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
