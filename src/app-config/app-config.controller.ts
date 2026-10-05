import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { Public } from '../common/decorators/public.decorator';

@ApiTags('app')
@Public()
@Controller('app')
export class AppConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('config')
  @ApiOperation({
    summary: 'App version and force update configuration',
  })
  @ApiOkResponse({
    description: 'Version policy used by the mobile clients',
    schema: {
      type: 'object',
      properties: {
        appName: { type: 'string', example: 'MoneyBuddy' },
        latestVersion: { type: 'string', example: '1.1.0' },
        minVersion: { type: 'string', example: '1.0.0' },
        forceUpdate: { type: 'boolean', example: false },
        storeUrl: { type: 'string' },
        updateMessage: { type: 'string' },
        maintenanceMode: { type: 'boolean', example: false },
      },
    },
  })
  getConfig() {
    return {
      appName: this.configService.get<string>('APP_NAME') ?? 'MoneyBuddy',
      latestVersion:
        this.configService.get<string>('APP_LATEST_VERSION') ?? '1.0.0',
      minVersion: this.configService.get<string>('APP_MIN_VERSION') ?? '1.0.0',
      forceUpdate:
        (this.configService.get<string>('APP_FORCE_UPDATE') ?? 'false') ===
        'true',
      storeUrl:
        this.configService.get<string>('APP_STORE_URL') ??
        'https://play.google.com/store/apps/details?id=com.moneybuddy.app',
      updateMessage:
        this.configService.get<string>('APP_UPDATE_MESSAGE') ??
        'A new version of MoneyBuddy is available. Please update to continue.',
      maintenanceMode:
        (this.configService.get<string>('APP_MAINTENANCE') ?? 'false') ===
        'true',
    };
  }
}
