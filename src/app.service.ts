import { Injectable } from '@nestjs/common';
import { AppLogger } from './logger/app-logger.service';

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
}
