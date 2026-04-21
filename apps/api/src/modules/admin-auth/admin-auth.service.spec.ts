import { UnauthorizedException } from '@nestjs/common';
import { createHash, scryptSync } from 'node:crypto';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { AdminAuthService } from './admin-auth.service';

function hashPassword(password: string, seed: string) {
  const salt = createHash('sha256')
    .update(`admin-seed:${seed}`)
    .digest('hex')
    .slice(0, 32);

  const hash = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hash}`;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

describe('AdminAuthService', () => {
  const prismaMock = {
    adminSession: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(
      Date.parse('2026-04-21T08:00:00.000Z'),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a compact user payload after login', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'ops@miniticket.local',
      enabled: true,
      id: 'seed-admin-ops',
      name: 'Ops Lead',
      passwordHash: hashPassword('Ops12345!', 'seed-admin-ops'),
      role: 'OPERATIONS',
    });
    (prismaMock.adminSession.create as jest.Mock).mockResolvedValue({
      id: 'admin_session_001',
    });

    const service = new AdminAuthService(prismaMock);
    const result = await service.login({
      email: 'ops@miniticket.local',
      password: 'Ops12345!',
    });

    expect(result.user).toEqual({
      email: 'ops@miniticket.local',
      id: 'seed-admin-ops',
      name: 'Ops Lead',
      role: 'OPERATIONS',
    });
    expect(result.user).not.toHaveProperty('enabled');
    expect(result.user).not.toHaveProperty('createdAt');
    expect(result.user).not.toHaveProperty('updatedAt');
    expect(prismaMock.adminSession.create).toHaveBeenCalledWith({
      data: {
        expiresAt: new Date('2026-04-21T20:00:00.000Z'),
        tokenHash: hashToken(result.sessionToken),
        userId: 'seed-admin-ops',
      },
    });
  });

  it('returns a compact admin principal from the session guard', async () => {
    (prismaMock.adminSession.findFirst as jest.Mock).mockResolvedValue({
      user: {
        createdAt: new Date('2026-04-20T08:00:00.000Z'),
        email: 'ops@miniticket.local',
        enabled: true,
        id: 'seed-admin-ops',
        name: 'Ops Lead',
        role: 'OPERATIONS',
        updatedAt: new Date('2026-04-20T08:00:00.000Z'),
      },
    });

    const guard = new AdminSessionGuard(prismaMock);
    const request: any = {
      headers: {
        cookie: 'mini_ticket_admin_session=session-token-123',
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as never;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.admin).toEqual({
      email: 'ops@miniticket.local',
      id: 'seed-admin-ops',
      name: 'Ops Lead',
      role: 'OPERATIONS',
    });
    expect(request.admin).not.toHaveProperty('enabled');
    expect(request.admin).not.toHaveProperty('createdAt');
    expect(request.admin).not.toHaveProperty('updatedAt');
    expect(prismaMock.adminSession.findFirst).toHaveBeenCalledWith({
      select: {
        user: {
          select: {
            email: true,
            enabled: true,
            id: true,
            name: true,
            role: true,
          },
        },
      },
      where: {
        expiresAt: {
          gt: expect.any(Date),
        },
        tokenHash: hashToken('session-token-123'),
      },
    });
  });

  it('rejects disabled users', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'disabled@miniticket.local',
      enabled: false,
      id: 'seed-admin-disabled',
      name: 'Disabled User',
      passwordHash: hashPassword('Admin123!', 'seed-admin-disabled'),
      role: 'ADMIN',
    });

    const service = new AdminAuthService(prismaMock);

    await expect(
      service.login({
        email: 'disabled@miniticket.local',
        password: 'Admin123!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prismaMock.adminSession.create).not.toHaveBeenCalled();
  });

  it('rejects invalid passwords', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'ops@miniticket.local',
      enabled: true,
      id: 'seed-admin-ops',
      name: 'Ops Lead',
      passwordHash: hashPassword('Ops12345!', 'seed-admin-ops'),
      role: 'OPERATIONS',
    });

    const service = new AdminAuthService(prismaMock);

    await expect(
      service.login({
        email: 'ops@miniticket.local',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prismaMock.adminSession.create).not.toHaveBeenCalled();
  });

  it('clears all admin sessions for the signed-in user', async () => {
    const service = new AdminAuthService(prismaMock);

    await service.logout('seed-admin-ops');

    expect(prismaMock.adminSession.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'seed-admin-ops',
      },
    });
  });
});
