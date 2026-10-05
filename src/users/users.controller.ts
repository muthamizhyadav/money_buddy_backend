import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './schemas/user.schema';

@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(User)
@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({
    description: 'Current user profile',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: getSchemaPath(User) },
      },
    },
  })
  getMe(@Req() req: Request) {
    return {
      user: req.user,
    };
  }
}
