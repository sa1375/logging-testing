// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app-logger.service';
import { RequestContextInterceptor } from './logger/request-context.interceptor';

async function bootstrap() {
  /**
   * Create the NestJS application instance.
   *
   * bufferLogs: true
   * → Buffers all logs internally until a custom logger is attached.
   *   This prevents losing logs during application initialization.
   */
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Retrieve the custom AppLogger instance from Nest's dependency injection container.
  const logger = app.get(AppLogger);

  // Replace Nest's default logger with our custom structured logger (Pino-based).
  app.useLogger(logger);
  app.useGlobalInterceptors(new RequestContextInterceptor());

  const port = process.env.PORT || 3000;

  await app.listen(port);

  logger.log({ event: 'startup', port }, 'service started');
}

bootstrap();
