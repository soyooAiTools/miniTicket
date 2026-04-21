import { UnauthorizedException } from '@nestjs/common';
import { createHash, scryptSync } from 'node:crypto';

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

  it('creates an admin session for valid credentials', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      createdAt: new Date('2026-04-20T08:00:00.000Z'),
      email: 'ops@miniticket.local',
      enabled: true,
      id: 'seed-admin-ops',
      name: '现场运营',
      passwordHash: hashPassword('Ops12345!', 'seed-admin-ops'),
      role: 'OPERATIONS',
      updatedAt: new Date('2026-04-20T08:00:00.000Z'),
    });
    (prismaMock.adminSession.create as jest.Mock).mockResolvedValue({
      id: 'admin_session_001',
    });

    const service = new AdminAuthService(prismaMock);
    const result = await service.login({
      email: 'ops@miniticket.local',
      password: 'Ops12345!',
    });

    expect(result.sessionToken).toHaveLength(64);
    expect(result.user).toMatchObject({
      email: 'ops@miniticket.local',
      enabled: true,
      id: 'seed-admin-ops',
      name: '现场运营',
      role: 'OPERATIONS',
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'ops@miniticket.local',
      },
    });
    expect(prismaMock.adminSession.create).toHaveBeenCalledWith({
      data: {
        expiresAt: new Date('2026-04-21T20:00:00.000Z'),
        tokenHash: hashToken(result.sessionToken),
        userId: 'seed-admin-ops',
      },
    });
  });

  it('rejects disabled users', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'disabled@miniticket.local',
      enabled: false,
      id: 'seed-admin-disabled',
      name: '已停用账号',
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
      name: '现场运营',
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
