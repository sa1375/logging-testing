// src/app.controller.ts

import { Controller, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AppService } from './app.service';
import { AppLogger } from './logger/app-logger.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
    private readonly logger: AppLogger,
  ) {}

  @Get('/users/:userId')
  findUser(@Param('userId') userId: string) {
    return this.usersService.findUser(userId);
  }

  @Get('/users-test-catch')
  forceCatchScenario() {
    return this.usersService.findUser('force-error');
  }

  @Get('/logger-redact-test')
  loggerRedactTest(@Req() req: Request): string {
    this.logger.log(
      { event: 'logger_redact_test', req },
      'redact test route hit',
    );
    return 'redact test route works';
  }

  @Get('boom')
  boom() {
    return this.appService.boom();
  }

  @Get('sentry-ping')
  sentryPing() {
    return this.appService.sentryPing();
  }
}
