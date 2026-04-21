const compactDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const compactDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
});

function toValidDate(value: string) {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCurrencyCny(value: number) {
  return `${value} RMB`;
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
    return `${formatCompactDate(startAt)} - ${formatCompactDate(endAt)}`;
  }

  if (startAt) {
    return `Starts ${formatCompactDate(startAt)}`;
  }

  if (endAt) {
    return `Ends ${formatCompactDate(endAt)}`;
  }

  return 'Schedule to be announced';
}
