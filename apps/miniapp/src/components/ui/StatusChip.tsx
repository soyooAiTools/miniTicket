import { Text } from '@tarojs/components';

import type { StatusMeta } from '../../ui/status';

type StatusChipProps = {
  meta: StatusMeta;
};

export function StatusChip({ meta }: StatusChipProps) {
  return (
    <Text className={`status-chip status-chip--${meta.tone}`}>{meta.label}</Text>
  );
}
