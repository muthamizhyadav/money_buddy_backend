import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  CreateExpenseIncomeDto,
  GoalDto,
  RecurringDto,
  UpdateExpenseIncomeDto,
  UpdateRecurringDto,
} from './dto/create-expense-income.dto';
import {
  ExpenseIncome,
  ExpenseIncomeDocument,
} from './schemas/expense.income.schema';
import { Goal, GoalDocument } from './schemas/goals.schema';
import { Recurring, RecurringDocument } from './schemas/recurring.schema';

@Injectable()
export class IncomeandexpensessService {
  constructor(
    @InjectModel(ExpenseIncome.name)
    private readonly expenseIncomeModel: Model<ExpenseIncomeDocument>,

    @InjectModel(Goal.name)
    private readonly goalModel: Model<GoalDocument>,

    @InjectModel(Recurring.name)
    private readonly recurringModel: Model<RecurringDocument>,
  ) {}

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
    return this.expenseIncomeModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async findOne(userId: string, id: string): Promise<ExpenseIncomeDocument> {
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

  async update(
    userId: string,
    id: string,
    dto: UpdateExpenseIncomeDto,
  ): Promise<ExpenseIncomeDocument> {
    const payload: Record<string, unknown> = { ...dto };

    if (dto.date) {
      payload.date = new Date(dto.date);
    }

    const transaction = await this.expenseIncomeModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: payload },
        { new: true, runValidators: true },
      )
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
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

  async CreateGoal(userId: string, dto: GoalDto): Promise<GoalDocument> {
    const goal = new this.goalModel({
      ...dto,
      userId,
    });
    return goal.save();
  }

  async GetGoals(userId: string): Promise<GoalDocument[]> {
    return this.goalModel.find({ userId }).exec();
  }

  async RemoveGoal(
    userId: string,
    id: string,
  ): Promise<{ message: string }> {
    const goal = await this.goalModel
      .findOneAndDelete({ _id: id, userId })
      .exec();

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return { message: 'Goal deleted successfully' };
  }

  async CreateRecurring(
    userId: string,
    dto: RecurringDto,
  ): Promise<RecurringDocument> {
    const recurring = new this.recurringModel({
      ...dto,
      ammount: String(dto.amount),
      amount: dto.amount,
      isdone: false,
      userId,
    });
    return recurring.save();
  }

  async GetRecurring(userId: string): Promise<RecurringDocument[]> {
    return this.recurringModel.find({ userId }).exec();
  }

  async UpdateRecurring(
    userId: string,
    id: string,
    dto: UpdateRecurringDto,
  ): Promise<RecurringDocument> {
    const payload: Record<string, unknown> = { ...dto };

    if (dto.amount !== undefined) {
      payload.ammount = String(dto.amount);
      payload.amount = dto.amount;
    }

    const recurring = await this.recurringModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: payload },
        { new: true, runValidators: true },
      )
      .exec();

    if (!recurring) {
      throw new NotFoundException('Recurring payment not found');
    }

    return recurring;
  }

  async RemoveRecurring(
    userId: string,
    id: string,
  ): Promise<{ message: string }> {
    const recurring = await this.recurringModel
      .findOneAndDelete({ _id: id, userId })
      .exec();

    if (!recurring) {
      throw new NotFoundException('Recurring payment not found');
    }

    return { message: 'Recurring payment deleted successfully' };
  }
}
