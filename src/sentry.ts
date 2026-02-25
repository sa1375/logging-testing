// src/sentry.ts

import * as Sentry from '@sentry/nestjs';
import type { AppLogger } from './logger/app-logger.service';

export function initSentry(logger: AppLogger) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    // Keep app running without Sentry, but make misconfiguration obvious.
    logger.warn(
      '[sentry] SENTRY_DSN is not set. Error events will not be sent to Sentry.',
    );
    return;
  }

  Sentry.init({
    dsn,
    // environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // Adjust this value in production to control the volume of performance data sent to Sentry
  });
}
