import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ExpenseIncome,
  ExpenseIncomeDocument,
} from '../incomeandexpensess/schemas/expense.income.schema';
import { Goal, GoalDocument } from '../incomeandexpensess/schemas/goals.schema';
import {
  Recurring,
  RecurringDocument,
} from '../incomeandexpensess/schemas/recurring.schema';
import { Receipt, ReceiptDocument } from '../receipts/schemas/receipt.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

export interface ExportFile {
  content: string;
  filename: string;
  contentType: string;
}

const CSV_COLUMNS = [
  'id',
  'date',
  'type',
  'category',
  'amount',
  'receivedIn',
  'isRecurring',
  'notes',
];

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(ExpenseIncome.name)
    private readonly transactionModel: Model<ExpenseIncomeDocument>,
    @InjectModel(Goal.name)
    private readonly goalModel: Model<GoalDocument>,
    @InjectModel(Recurring.name)
    private readonly recurringModel: Model<RecurringDocument>,
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async build(userId: string, format: 'csv' | 'json'): Promise<ExportFile> {
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const transactions = await this.transactionModel
        .find({ userId })
        .sort({ date: -1 })
        .lean()
        .exec();

      return {
        content: `\uFEFF${this.toCsv(transactions)}`,
        filename: `moneybuddy-transactions-${stamp}.csv`,
        contentType: 'text/csv; charset=utf-8',
      };
    }

    const [user, transactions, goals, recurring, receipts] =
      await Promise.all([
        this.userModel.findById(userId).lean().exec(),
        this.transactionModel
          .find({ userId })
          .sort({ date: -1 })
          .lean()
          .exec(),
        this.goalModel.find({ userId }).lean().exec(),
        this.recurringModel.find({ userId }).lean().exec(),
        this.receiptModel.find({ userId }).lean().exec(),
      ]);

    const payload = {
      app: 'MoneyBuddy',
      exportedAt: new Date().toISOString(),
      user: user
        ? {
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null,
      counts: {
        transactions: transactions.length,
        goals: goals.length,
        recurring: recurring.length,
        receipts: receipts.length,
      },
      transactions,
      goals,
      recurring,
      receipts,
    };

    return {
      content: JSON.stringify(payload, null, 2),
      filename: `moneybuddy-backup-${stamp}.json`,
      contentType: 'application/json; charset=utf-8',
    };
  }

  private toCsv(rows: unknown[]): string {
    const lines = [CSV_COLUMNS.join(',')];

    for (const row of rows) {
      const record = (row ?? {}) as Record<string, unknown>;
      lines.push(
        CSV_COLUMNS.map((column) => this.escape(record[column])).join(','),
      );
    }

    return lines.join('\r\n');
  }

  private escape(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';

    const text = String(value);
    if (/[",\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }
}
