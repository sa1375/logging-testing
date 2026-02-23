// src/logger/app-logger.service.ts

import { Injectable, LoggerService } from '@nestjs/common';
import type { Logger } from 'pino';
import { baseLogger } from './pino';
import { requestContext } from './request-context';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    // If a logger is provided (child case), use it.
    // Otherwise create base service logger.
    this.logger = baseLogger.child({ service: 'api' });
  }

  child(bindings: Record<string, any>) {
    const childLogger = new AppLogger();
    childLogger.logger = this.logger.child(bindings);
    return childLogger;
  }

  /**
   * Returns current request-scoped bindings (if any).
   * Injects requestId from AsyncLocalStorage.
   */
  private getRequestBindings(): Record<string, any> {
    const store = requestContext.getStore();
    return store?.requestId ? { requestId: store.requestId } : {};
  }

  /**
   * Internal helper to avoid duplication.
   */
  private writeLog(
    level: 'info' | 'warn' | 'error' | 'debug' | 'trace',
    message: any,
    optionalParams: any[],
  ) {
    const contextBindings = this.getRequestBindings();

    // Extract real Error if provided
    const err = optionalParams.find((p) => p instanceof Error);

    if (typeof message === 'string') {
      this.logger[level](
        {
          ...contextBindings,
          err,
          extra: optionalParams.length ? optionalParams : undefined,
        },
        message,
      );
    } else {
      this.logger[level]({
        ...contextBindings,
        err,
        ...(typeof message === 'object' ? message : {}),
      });
    }
  }

  log(message: any, ...optionalParams: any[]) {
    this.writeLog('info', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.writeLog('warn', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.writeLog('error', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.writeLog('debug', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    // Nest verbose → map to trace
    this.writeLog('trace', message, optionalParams);
  }
}
