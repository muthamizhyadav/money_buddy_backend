import { Module } from '@nestjs/common';
import { IncomeandexpensessController } from './incomeandexpensess.controller';
import { IncomeandexpensessService } from './incomeandexpensess.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpenseIncome, ExpenseIncomeSchema } from './schemas/expense.income.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExpenseIncome.name, schema: ExpenseIncomeSchema },
    ]),
  ],
  controllers: [IncomeandexpensessController],
  providers: [IncomeandexpensessService]
})
export class IncomeandexpensessModule {}
