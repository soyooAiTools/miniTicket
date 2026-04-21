const compactDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

const compactDateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'numeric',
  year: 'numeric',
});

function toValidDate(value: string) {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCurrencyCny(value: number) {
  return `¥${value}`;
}

export function formatCompactDate(value: string) {
  const parsed = toValidDate(value);

  return parsed ? compactDateFormatter.format(parsed) : value;
}

export function formatCompactDateTime(value: string) {
  const parsed = toValidDate(value);

  return parsed ? compactDateTimeFormatter.format(parsed) : value;
}

export function formatSaleWindow(startAt?: string, endAt?: string) {
  if (startAt && endAt) {
    return `${formatCompactDate(startAt)} 至 ${formatCompactDate(endAt)}`;
  }

  if (startAt) {
    return `${formatCompactDate(startAt)} 开售`;
  }

  if (endAt) {
    return `${formatCompactDate(endAt)} 截止`;
  }

  return '待公布';
}
