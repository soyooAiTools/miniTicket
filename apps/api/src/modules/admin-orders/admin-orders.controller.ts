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

import { AdminOrdersService } from './admin-orders.service';

type CreateOrderNoteBody = {
  content: string;
};

type CreateOrderFlagBody = {
  note?: string;
  type: string;
};

function parseCreateOrderNoteBody(body: unknown): CreateOrderNoteBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('备注内容不能为空。');
  }

  const content = (body as { content?: unknown }).content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new BadRequestException('备注内容不能为空。');
  }

  return {
    content,
  };
}

function parseCreateOrderFlagBody(body: unknown): CreateOrderFlagBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('异常标记类型不能为空。');
  }

  const type = (body as { type?: unknown }).type;
  const note = (body as { note?: unknown }).note;

  if (typeof type !== 'string' || !type.trim()) {
    throw new BadRequestException('异常标记类型不能为空。');
  }

  if (note !== undefined && typeof note !== 'string') {
    throw new BadRequestException('异常标记备注格式不正确。');
  }

  return {
    ...(typeof note === 'string' ? { note } : {}),
    type,
  };
}

@Controller('admin/orders')
@UseGuards(AdminSessionGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  async listOrders() {
    return {
      items: await this.adminOrdersService.listOrders(),
    };
  }

  @Get(':orderId')
  async getOrderDetail(@Param('orderId') orderId: string) {
    return this.adminOrdersService.getOrderDetail(orderId);
  }

  @Post(':orderId/notes')
  async addNote(
    @Param('orderId') orderId: string,
    @Body() body: unknown,
    @CurrentAdmin() admin: CurrentAdminPrincipal,
  ) {
    return this.adminOrdersService.addNote(
      orderId,
      parseCreateOrderNoteBody(body),
      admin,
    );
  }

  @Post(':orderId/flags')
  async addFlag(
    @Param('orderId') orderId: string,
    @Body() body: unknown,
    @CurrentAdmin() admin: CurrentAdminPrincipal,
  ) {
    return this.adminOrdersService.addFlag(
      orderId,
      parseCreateOrderFlagBody(body),
      admin,
    );
  }
}
