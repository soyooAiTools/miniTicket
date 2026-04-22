import { request } from './request';

export type AdminDashboardRecentAction = {
  action: string;
  actorName: string;
  createdAt: string;
  targetId: string;
  targetType: string;
};

export type AdminDashboardSummary = {
  activeEventCount: number;
  flaggedOrderCount: number;
  pendingRefundCount: number;
  recentActions: AdminDashboardRecentAction[];
  upcomingEventCount: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNonNegativeInteger(value: unknown, fieldName: string) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid admin dashboard summary field: ${fieldName}`);
  }

  return value;
}

function toStringField(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid admin dashboard summary field: ${fieldName}`);
  }

  return value;
}

function resolveActorName(value: UnknownRecord) {
  if (typeof value.actorName === 'string' && value.actorName.trim().length > 0) {
    return value.actorName;
  }

  if (isRecord(value.actor) && typeof value.actor.name === 'string') {
    const actorName = value.actor.name.trim();

    if (actorName.length > 0) {
      return actorName;
    }
  }

  throw new Error('Invalid admin dashboard summary field: recentActions.actorName');
}

function normalizeRecentAction(value: unknown): AdminDashboardRecentAction {
  if (!isRecord(value)) {
    throw new Error('Invalid admin dashboard summary field: recentActions[]');
  }

  return {
    action: toStringField(value.action, 'recentActions.action'),
    actorName: resolveActorName(value),
    createdAt: toStringField(value.createdAt, 'recentActions.createdAt'),
    targetId: toStringField(value.targetId, 'recentActions.targetId'),
    targetType: toStringField(value.targetType, 'recentActions.targetType'),
  };
}

function normalizeSummary(payload: unknown): AdminDashboardSummary {
  if (!isRecord(payload)) {
    throw new Error('Invalid admin dashboard summary payload');
  }

  const recentActions = Array.isArray(payload.recentActions)
    ? payload.recentActions.map(normalizeRecentAction)
    : [];

  return {
    activeEventCount: toNonNegativeInteger(
      payload.activeEventCount,
      'activeEventCount',
    ),
    flaggedOrderCount: toNonNegativeInteger(
      payload.flaggedOrderCount,
      'flaggedOrderCount',
    ),
    pendingRefundCount: toNonNegativeInteger(
      payload.pendingRefundCount,
      'pendingRefundCount',
    ),
    recentActions,
    upcomingEventCount: toNonNegativeInteger(
      payload.upcomingEventCount,
      'upcomingEventCount',
    ),
  };
}

export async function getAdminDashboardSummary() {
  const payload = await request<unknown>('/admin/dashboard/summary');
  return normalizeSummary(payload);
}
