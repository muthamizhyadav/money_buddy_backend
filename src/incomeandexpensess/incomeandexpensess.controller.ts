import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { IncomeandexpensessService } from './incomeandexpensess.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateExpenseIncomeDto,
  GoalDto,
  RecurringDto,
} from './dto/create-expense-income.dto';
import { ExpenseIncome } from './schemas/expense.income.schema';
import { Goal } from './schemas/goals.schema';
import { Recurring } from './schemas/recurring.schema';

@ApiTags('income-and-expenses')
@ApiExtraModels(ExpenseIncome, Goal, Recurring)
@Controller('incomeandexpensess')
export class IncomeandexpensessController {
  constructor(
    private readonly incomeandexpensessService: IncomeandexpensessService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create an income or expense entry' })
  @ApiCreatedResponse({ type: ExpenseIncome })
  create(
    @CurrentUser() user: { userId: string },
    @Body() createExpenseIncomeDto: CreateExpenseIncomeDto,
  ) {
    return this.incomeandexpensessService.create(
      user.userId,
      createExpenseIncomeDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all income and expense entries' })
  @ApiOkResponse({
    description: 'List of transactions, newest first',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(ExpenseIncome) },
    },
  })
  findAll(@CurrentUser() user: { userId: string }) {
    return this.incomeandexpensessService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single income / expense entry' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({ type: ExpenseIncome })
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.incomeandexpensessService.findOne(user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income / expense entry' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Transaction deleted successfully',
        },
      },
    },
  })
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.incomeandexpensessService.remove(user.userId, id);
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create a savings goal' })
  @ApiCreatedResponse({ type: Goal })
  CreateGoal(
    @CurrentUser() user: { userId: string },
    @Body() goalDto: GoalDto,
  ) {
    return this.incomeandexpensessService.CreateGoal(user.userId, goalDto);
  }

  @Get('goals')
  @ApiOperation({ summary: 'List all savings goals' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(Goal) },
    },
  })
  GetGoals(@CurrentUser() user: { userId: string }) {
    return this.incomeandexpensessService.GetGoals(user.userId);
  }

  @Post('recurring')
  @ApiOperation({ summary: 'Create a recurring payment' })
  @ApiCreatedResponse({ type: Recurring })
  CreateRecurring(
    @CurrentUser() user: { userId: string },
    @Body() recurringDto: RecurringDto,
  ) {
    return this.incomeandexpensessService.CreateRecurring(
      user.userId,
      recurringDto,
    );
  }

  @Get('recurring')
  @ApiOperation({ summary: 'List all recurring payments' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(Recurring) },
    },
  })
  GetRecurring(@CurrentUser() user: { userId: string }) {
    return this.incomeandexpensessService.GetRecurring(user.userId);
  }
}
