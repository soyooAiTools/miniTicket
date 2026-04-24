import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'authorized-ticketing-api',
    };
  }

  @Get('ping')
  ping() {
    return { pong: true };
  }
}
