import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
  UpdateExpenseIncomeDto,
  UpdateRecurringDto,
} from './dto/create-expense-income.dto';
import { ExpenseIncome } from './schemas/expense.income.schema';
import { Goal } from './schemas/goals.schema';
import { Recurring } from './schemas/recurring.schema';

@ApiTags('income-and-expenses')
@ApiBearerAuth()
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a single income / expense entry' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({ type: ExpenseIncome })
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.incomeandexpensessService.findOne(user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an income or expense entry' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({ type: ExpenseIncome })
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updateExpenseIncomeDto: UpdateExpenseIncomeDto,
  ) {
    return this.incomeandexpensessService.update(
      user.userId,
      id,
      updateExpenseIncomeDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income or expense entry' })
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

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete a savings goal' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Goal deleted successfully' },
      },
    },
  })
  RemoveGoal(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.incomeandexpensessService.RemoveGoal(user.userId, id);
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

  @Patch('recurring/:id')
  @ApiOperation({ summary: 'Update a recurring payment' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({ type: Recurring })
  UpdateRecurring(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updateRecurringDto: UpdateRecurringDto,
  ) {
    return this.incomeandexpensessService.UpdateRecurring(
      user.userId,
      id,
      updateRecurringDto,
    );
  }

  @Delete('recurring/:id')
  @ApiOperation({ summary: 'Delete a recurring payment' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Recurring payment deleted' },
      },
    },
  })
  RemoveRecurring(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.incomeandexpensessService.RemoveRecurring(user.userId, id);
  }
}
