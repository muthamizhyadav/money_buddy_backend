import { Module } from '@nestjs/common';
import { IncomeandexpensessController } from './incomeandexpensess.controller';
import { IncomeandexpensessService } from './incomeandexpensess.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExpenseIncome,
  ExpenseIncomeSchema,
} from './schemas/expense.income.schema';
import { Goal, GoalSchema } from './schemas/goals.schema';
import { Recurring, RecurringSchema } from './schemas/recurring.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExpenseIncome.name, schema: ExpenseIncomeSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Recurring.name, schema: RecurringSchema },
    ]),
  ],
  controllers: [IncomeandexpensessController],
  providers: [IncomeandexpensessService],
})
export class IncomeandexpensessModule {}
