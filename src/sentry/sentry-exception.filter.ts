// src/sentry/sentry-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { Response } from 'express';
import { AppLogger } from 'src/logger/app-logger.service';

@Catch() // Catch all exceptions
export class SentryExceptionFilter implements ExceptionFilter {
  constructor(private logger: AppLogger) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // Get the HTTP context
    const response = ctx.getResponse<Response>();

    const eventId = Sentry.captureException(exception); // Captures an exception event and sends it to Sentry.
    await Sentry.flush(2000);
    // Temporary delivery diagnostic while validating Sentry pipeline.
    this.logger.error(`[sentry] captured exception, eventId=${eventId}`);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
    } else {
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
