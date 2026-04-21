import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export type AdminAuditActionInput = {
  action: string;
  actorUserId: string;
  payload?: Prisma.InputJsonValue;
  targetId: string;
  targetType: string;
};

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService | PrismaClient) {}

  recordAction(input: AdminAuditActionInput) {
    return this.prisma.adminAuditLog.create({
      data: {
        action: input.action,
        payload: input.payload,
        targetId: input.targetId,
        targetType: input.targetType,
        userId: input.actorUserId,
      },
    });
  }
}
