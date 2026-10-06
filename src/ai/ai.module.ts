import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiUsage, AiUsageSchema } from './schemas/ai-usage.schema';
import {
  ExpenseIncome,
  ExpenseIncomeSchema,
} from '../incomeandexpensess/schemas/expense.income.schema';
import { Goal, GoalSchema } from '../incomeandexpensess/schemas/goals.schema';
import {
  Recurring,
  RecurringSchema,
} from '../incomeandexpensess/schemas/recurring.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiUsage.name, schema: AiUsageSchema },
      { name: ExpenseIncome.name, schema: ExpenseIncomeSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Recurring.name, schema: RecurringSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
