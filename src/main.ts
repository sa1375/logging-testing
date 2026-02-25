// src/main.ts

// import './instrument';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app-logger.service';
import { RequestContextInterceptor } from './logger/request-context.interceptor';
import { initSentry } from './sentry';
import { SentryExceptionFilter } from './sentry/sentry-exception.filter';

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
  initSentry(logger);

  // Replace Nest's default logger with our custom structured logger (Pino-based).
  app.useLogger(logger);
  app.useGlobalInterceptors(new RequestContextInterceptor());

  app.useGlobalFilters(new SentryExceptionFilter(logger));

  const port = process.env.PORT || 3000;

  await app.listen(port);

  logger.log({ event: 'startup', port }, 'service started');
}

bootstrap();
