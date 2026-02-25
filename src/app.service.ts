import { Injectable } from '@nestjs/common';
import { AppLogger } from './logger/app-logger.service';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class AppService {
  constructor(private logger: AppLogger) {}

  getUsers() {
    throw new Error('Method not implemented.');
  }
  boom() {
    this.logger.log(
      { hasDsn: Boolean(process.env.SENTRY_DSN) },
      'sentry env check',
    );

    throw new Error('Test Sentry error');
  }

  async sentryPing() {
    const eventId = Sentry.captureMessage('manual sentry ping', 'error');
    await Sentry.flush(2000);
    this.logger.log({ event: 'sentry_ping', eventId }, 'sentry ping sent');
    return { ok: true, eventId };
  }
}
