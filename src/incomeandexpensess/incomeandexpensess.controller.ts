import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { IncomeandexpensessService } from './incomeandexpensess.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateExpenseIncomeDto,
  GoalDto,
  RecurringDto,
} from './dto/create-expense-income.dto';

@Controller('incomeandexpensess')
export class IncomeandexpensessController {
  constructor(
    private readonly incomeandexpensessService: IncomeandexpensessService,
  ) {}

  @Post('create')
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
  findAll(@CurrentUser() user: { userId: string }) {
    return this.incomeandexpensessService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.incomeandexpensessService.findOne(user.userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.incomeandexpensessService.remove(user.userId, id);
  }

  @Post('goals')
  CreateGoal(
    @CurrentUser() user: { userId: string },
    @Body() goalDto: GoalDto,
  ) {
    return this.incomeandexpensessService.CreateGoal(user.userId, goalDto);
  }

  @Get('goals')
  GetGoals(@CurrentUser() user: { userId: string }) {
    return this.incomeandexpensessService.GetGoals(user.userId);
  }

  @Post('recurring')
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
  GetRecurring(@CurrentUser() user: { userId: string }) {
    return this.incomeandexpensessService.GetRecurring(user.userId);
  }
}
