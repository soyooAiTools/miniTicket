import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  adminEventDraftSchema,
  adminEventEditorSchema,
} from '../../../../../packages/contracts/src';
import { AdminSessionGuard } from '../../common/auth/admin-session.guard';

import { AdminEventsService } from './admin-events.service';

function parseEventDraftBody(body: unknown) {
  const parsed = adminEventDraftSchema.safeParse(body);

  if (!parsed.success) {
    throw new BadRequestException(parsed.error.issues[0]?.message);
  }

  return parsed.data;
}

function parseEventEditorBody(body: unknown) {
  const parsed = adminEventEditorSchema.safeParse(body);

  if (!parsed.success) {
    throw new BadRequestException(parsed.error.issues[0]?.message);
  }

  return parsed.data;
}

@Controller('admin/events')
@UseGuards(AdminSessionGuard)
export class AdminEventsController {
  constructor(private readonly adminEventsService: AdminEventsService) {}

  @Get()
  async listEvents() {
    return {
      items: await this.adminEventsService.listEvents(),
    };
  }

  @Post()
  async createEvent(@Body() body: unknown) {
    const parsedBody = parseEventDraftBody(body);

    return this.adminEventsService.createEvent(parsedBody);
  }

  @Patch(':eventId')
  async updateEvent(@Param('eventId') eventId: string, @Body() body: unknown) {
    const parsedBody = parseEventEditorBody(body);

    return this.adminEventsService.updateEvent(eventId, parsedBody);
  }

  @Patch(':eventId/publish')
  async publishEvent(@Param('eventId') eventId: string) {
    return this.adminEventsService.publishEvent(eventId);
  }

  @Patch(':eventId/unpublish')
  async unpublishEvent(@Param('eventId') eventId: string) {
    return this.adminEventsService.unpublishEvent(eventId);
  }
}
