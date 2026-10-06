import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AiService } from './ai.service';
import { AiChatDto, AiPlanDto } from './dto/ai.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const quotaSchema = {
  type: 'object',
  properties: {
    kind: { type: 'string', example: 'chat' },
    dayKey: { type: 'string', example: '2026-10-06' },
    allowed: { type: 'boolean', example: true },
    usedAt: { type: 'string', format: 'date-time', nullable: true },
    resetsAt: { type: 'string', format: 'date-time' },
    remainingToday: { type: 'integer', example: 1 },
  },
};

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Daily MoneyBuddy AI quota for the current user',
  })
  @ApiOkResponse({ schema: quotaSchema })
  status(
    @CurrentUser() user: { userId: string },
    @Query('tzOffsetMinutes') tzOffsetMinutes?: string,
  ) {
    const offset = Number.parseInt(tzOffsetMinutes ?? '0', 10);
    return this.aiService.status(
      user.userId,
      Number.isFinite(offset) ? offset : 0,
    );
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Ask MoneyBuddy AI one question (1 free use per day)',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        reply: { type: 'string' },
        kind: { type: 'string', example: 'chat' },
        dayKey: { type: 'string', example: '2026-10-06' },
        allowed: { type: 'boolean', example: false },
        usedAt: { type: 'string', format: 'date-time', nullable: true },
        resetsAt: { type: 'string', format: 'date-time' },
        remainingToday: { type: 'integer', example: 0 },
      },
    },
  })
  chat(@CurrentUser() user: { userId: string }, @Body() dto: AiChatDto) {
    return this.aiService.chat(user.userId, dto.question, dto.tzOffsetMinutes);
  }

  @Post('budget')
  @ApiOperation({
    summary: 'Generate a Groq powered budget plan (1 free use per day)',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        plan: { type: 'object' },
        kind: { type: 'string', example: 'budget' },
        dayKey: { type: 'string', example: '2026-10-06' },
        allowed: { type: 'boolean', example: false },
        usedAt: { type: 'string', format: 'date-time', nullable: true },
        resetsAt: { type: 'string', format: 'date-time' },
        remainingToday: { type: 'integer', example: 0 },
      },
    },
  })
  budget(@CurrentUser() user: { userId: string }, @Body() dto: AiPlanDto) {
    return this.aiService.budgetPlan(user.userId, dto.tzOffsetMinutes);
  }
}
