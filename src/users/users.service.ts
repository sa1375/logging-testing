// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class UsersService {
  constructor(private readonly logger: AppLogger) {}

  async findUser(userId: string) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate async operation
    this.logger.log({ event: 'user_fetch_start', userId }, 'fetching user ...');

    // مثال خطا
    try {
      // Deterministic test path to verify catch-block logging.
      if (userId === 'force-error') {
        throw new Error('forced failure for catch-block test');
      }

      const user = { id: userId };
      this.logger.log({ event: 'user_fetch_done', userId }, 'user fetched');
      return user;
    } catch (err: unknown) {
      this.logger.error('INSIDE CATCH findUser()', err);

      if (err instanceof Error) {
        this.logger.error(
          { event: 'user_fetch_failed', userId, err },
          'found error while fetching user',
        );
        throw err;
      } else {
        this.logger.error(
          { event: 'user_fetch_failed', userId, err },
          'found unknown error while fetching user',
        );
        throw new Error('Unknown error occurred while fetching user');
      }
    }
  }
}
