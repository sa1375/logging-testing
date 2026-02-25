// src/sentry.ts

import * as Sentry from '@sentry/nestjs';
import type { AppLogger } from './logger/app-logger.service';

export function initSentry(logger: AppLogger) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.warn(
      { event: 'sentry_disabled' },
      '[sentry] SENTRY_DSN is not set. Events will not be sent.',
    );
    return;
  }

  const environment =
    process.env.SENTRY_ENV || process.env.NODE_ENV || 'development';

  const isProd = environment === 'production';

  Sentry.init({
    dsn,
    environment,
    release: process.env.RELEASE, // e.g. api@<git_sha>
    tracesSampleRate: isProd ? 0.05 : 0.1,

    beforeSend(event) {
      // Drop non-actionable events if they somehow slip through
      const status = event?.contexts?.response?.status_code;
      if (typeof status === 'number' && status < 500) return null;

      // Optional: remove sensitive request headers if present
      if (event.request?.headers) {
        delete (event.request.headers as any).authorization;
        delete (event.request.headers as any).cookie;
      }
      return event;
    },
  });

  logger.log(
    { event: 'sentry_enabled', environment, release: process.env.RELEASE },
    '[sentry] initialized',
  );
}
