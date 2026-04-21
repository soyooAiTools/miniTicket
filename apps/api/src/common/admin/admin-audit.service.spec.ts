import { AdminAuditService } from './admin-audit.service';

describe('AdminAuditService', () => {
  const prismaMock = {
    adminAuditLog: {
      create: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes an adminAuditLog row for a signed-in actor', async () => {
    (prismaMock.adminAuditLog.create as jest.Mock).mockResolvedValue({
      action: 'ADMIN_LOGIN',
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      id: 'audit_001',
      payload: {
        sessionId: 'admin_session_001',
      },
      targetId: 'admin_session_001',
      targetType: 'ADMIN_SESSION',
      userId: 'seed-admin-ops',
    });

    const service = new AdminAuditService(prismaMock);
    const result = await service.recordAction({
      action: 'ADMIN_LOGIN',
      actorUserId: 'seed-admin-ops',
      payload: {
        sessionId: 'admin_session_001',
      },
      targetId: 'admin_session_001',
      targetType: 'ADMIN_SESSION',
    });

    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'ADMIN_LOGIN',
        payload: {
          sessionId: 'admin_session_001',
        },
        targetId: 'admin_session_001',
        targetType: 'ADMIN_SESSION',
        userId: 'seed-admin-ops',
      },
    });
    expect(result).toEqual({
      action: 'ADMIN_LOGIN',
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      id: 'audit_001',
      payload: {
        sessionId: 'admin_session_001',
      },
      targetId: 'admin_session_001',
      targetType: 'ADMIN_SESSION',
      userId: 'seed-admin-ops',
    });
  });
});
