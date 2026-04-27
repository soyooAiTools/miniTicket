// entrypoint
import 'reflect-metadata';
import './common/env/register-runtime-env';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.setGlobalPrefix('api');

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const host = process.env.HOST;

  if (host) {
    await app.listen(port, host);
    return;
  }

  await app.listen(port);
}

void bootstrap();
