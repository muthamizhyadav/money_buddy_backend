import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import {
  ExpenseIncome,
  ExpenseIncomeSchema,
} from '../incomeandexpensess/schemas/expense.income.schema';
import { Goal, GoalSchema } from '../incomeandexpensess/schemas/goals.schema';
import {
  Recurring,
  RecurringSchema,
} from '../incomeandexpensess/schemas/recurring.schema';
import { Receipt, ReceiptSchema } from '../receipts/schemas/receipt.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExpenseIncome.name, schema: ExpenseIncomeSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Recurring.name, schema: RecurringSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
