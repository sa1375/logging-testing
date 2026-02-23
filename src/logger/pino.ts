// src/logger/pino.ts

/**
 * This file is responsible for creating and exporting the base application logger.
 * It configures logging level, timestamp format, sensitive data redaction,
 * and pretty-printing behavior depending on the environment.
 */

import pino, { LoggerOptions } from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.refreshToken',
      'user.password',
    ],
    remove: true,
  },

  formatters: {
    level(label) {
      return { level: label };
    },
  },
};

function createDevTransport() {
  try {
    // Avoid startup crash if pino-pretty is not installed.
    require.resolve('pino-pretty');
    return pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    });
  } catch {
    return undefined;
  }
}

export const baseLogger = pino(
  options,
  isProd ? undefined : createDevTransport(),
);
