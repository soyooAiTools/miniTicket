import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import {
  CurrentAdmin,
  type CurrentAdminPrincipal,
} from '../../common/auth/current-admin.decorator';

import { AdminRefundsService } from './admin-refunds.service';

type ApproveRefundBody = {
  note?: string;
};

type RejectRefundBody = {
  reason: string;
};

type ProcessRefundBody = {
  note?: string;
};

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function parseApproveRefundBody(body: unknown): ApproveRefundBody {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const note = normalizeOptionalText((body as { note?: unknown }).note);

  return note ? { note } : {};
}

function parseRejectRefundBody(body: unknown): RejectRefundBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('驳回原因不能为空。');
  }

  const reason = (body as { reason?: unknown }).reason;

  if (typeof reason !== 'string' || !reason.trim()) {
    throw new BadRequestException('驳回原因不能为空。');
  }

  return {
    reason,
  };
}

function parseProcessRefundBody(body: unknown): ProcessRefundBody {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const note = normalizeOptionalText((body as { note?: unknown }).note);

  return note ? { note } : {};
}

@Controller('admin/refunds')
@UseGuards(AdminSessionGuard)
export class AdminRefundsController {
  constructor(private readonly adminRefundsService: AdminRefundsService) {}

  @Get()
  async listRefunds() {
    return {
      items: await this.adminRefundsService.listRefunds(),
    };
  }

  @Get(':refundId')
  async getRefundDetail(@Param('refundId') refundId: string) {
    return this.adminRefundsService.getRefundDetail(refundId);
  }

  @Post(':refundId/approve')
  async approveRefund(
    @Param('refundId') refundId: string,
    @Body() body: unknown,
    @CurrentAdmin() admin: CurrentAdminPrincipal,
  ) {
    return this.adminRefundsService.approveRefund(
      refundId,
      parseApproveRefundBody(body),
      admin,
    );
  }

  @Post(':refundId/reject')
  async rejectRefund(
    @Param('refundId') refundId: string,
    @Body() body: unknown,
    @CurrentAdmin() admin: CurrentAdminPrincipal,
  ) {
    return this.adminRefundsService.rejectRefund(
      refundId,
      parseRejectRefundBody(body),
      admin,
    );
  }

  @Post(':refundId/process')
  async processRefund(
    @Param('refundId') refundId: string,
    @Body() body: unknown,
    @CurrentAdmin() admin: CurrentAdminPrincipal,
  ) {
    return this.adminRefundsService.processRefund(
      refundId,
      parseProcessRefundBody(body),
      admin,
    );
  }
}
