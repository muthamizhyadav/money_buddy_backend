import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  
  
  import { CreateExpenseIncomeDto } from './dto/create-expense-income.dto';
import { ExpenseIncome, ExpenseIncomeDocument } from './schemas/expense.income.schema';
  
  @Injectable()
  export class IncomeandexpensessService {
    constructor(
      @InjectModel(ExpenseIncome.name)
      private readonly expenseIncomeModel: Model<ExpenseIncomeDocument>,
    ) {}
  
    /**
     * Create income / expense
     */
    async create(
      userId: string,
      dto: CreateExpenseIncomeDto,
    ): Promise<ExpenseIncomeDocument> {
      const transaction = new this.expenseIncomeModel({
        ...dto,
        userId,
        date: new Date(dto.date),
      });
  
      return transaction.save();
    }
  
    async findAll(userId: string): Promise<ExpenseIncomeDocument[]> {
      return this.expenseIncomeModel
        .find({ userId })
        .sort({ date: -1 })
        .exec();
    }
  
    async findOne(
      userId: string,
      id: string,
    ): Promise<ExpenseIncomeDocument> {
      const transaction = await this.expenseIncomeModel
        .findOne({
          _id: id,
          userId,
        })
        .exec();
  
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
  
      return transaction;
    }
  

    async remove(
      userId: string,
      id: string,
    ): Promise<{ message: string }> {
      const transaction = await this.expenseIncomeModel
        .findOneAndDelete({
          _id: id,
          userId,
        })
        .exec();
  
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
  
      return {
        message: 'Transaction deleted successfully',
      };
    }
  }