// src/sentry/sentry-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import type { Request, Response } from 'express';
import { AppLogger } from 'src/logger/app-logger.service';
import { requestContext } from 'src/logger/request-context';

type RequestWithId = Request & { requestId?: string };

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();

    const store = requestContext.getStore();
    const headerRequestId = request?.headers?.['x-request-id'];
    const requestId =
      request?.requestId ??
      store?.requestId ??
      (typeof headerRequestId === 'string'
        ? headerRequestId
        : Array.isArray(headerRequestId)
          ? headerRequestId[0]
          : undefined);

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : 500;

    const shouldCapture = !isHttp || status >= 500;

    if (shouldCapture) {
      const eventId = Sentry.withScope((scope) => {
        scope.setTag('request_id', requestId ?? 'missing');
        scope.setContext('http', {
          method: request.method,
          url: request.originalUrl,
          status,
        });
        return Sentry.captureException(exception);
      });

      this.logger.error(
        { event: 'sentry_capture', eventId, requestId, status, err: exception },
        '[sentry] captured exception',
      );
    } else {
      this.logger.warn(
        { event: 'sentry_skip', requestId, status },
        '[sentry] skipped (expected http error)',
      );
    }

    // response
    if (isHttp) {
      response
        .status(status)
        .json({ statusCode: status, message: exception.message });
    } else {
      response
        .status(500)
        .json({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
