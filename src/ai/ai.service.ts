import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { AiUsage, AiUsageDocument } from './schemas/ai-usage.schema';

export interface AiQuotaPayload {
  kind: string;
  dayKey: string;
  allowed: boolean;
  usedAt?: Date;
  resetsAt: string;
  remainingToday: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

const CHAT_SYSTEM = [
  'You are MoneyBuddy, a friendly personal finance coach inside an Indian budgeting app.',
  'Currency is Indian Rupees (INR).',
  'Answer the user question directly using their real transaction snapshot when useful.',
  'Be practical and specific: give numbers, categories and concrete next steps.',
  'Keep it under 160 words, plain text, no markdown headers, no bullet symbols.',
  'Never invent transactions that are not in the snapshot. If data is missing, say so briefly.',
].join(' ');

const PLAN_SYSTEM = [
  'You are MoneyBuddy, a personal finance coach inside an Indian budgeting app.',
  'Currency is Indian Rupees (INR).',
  'Using only the financial snapshot provided, build a realistic monthly budget plan.',
  'Return ONLY a JSON object, no markdown fences, with exactly these keys:',
  'summary (string, 1-2 sentences),',
  'limits (array of 4-6 objects with category (string), amount (number, monthly rupee limit), note (string under 60 words)),',
  'savings (object with target (number, rupees the user can realistically save this month) and note (string)),',
  'risks (array of 2-4 short strings about spending risks you actually see in the data),',
  'checklist (array of 3-5 short strings the user can do this week).',
  'Amounts must be numbers, never strings, and must follow from the data shown.',
].join(' ');

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectModel(AiUsage.name)
    private readonly usageModel: Model<AiUsageDocument>,
    @InjectModel(ExpenseIncome.name)
    private readonly transactionModel: Model<ExpenseIncomeDocument>,
    @InjectModel(Goal.name)
    private readonly goalModel: Model<GoalDocument>,
    @InjectModel(Recurring.name)
    private readonly recurringModel: Model<RecurringDocument>,
  ) {}

  private clock(tzOffsetMinutes: number): {
    dayKey: string;
    resetsAt: string;
    localTime: string;
  } {
    const offset = Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0;
    const local = new Date(Date.now() + offset * 60000);
    const dayKey = [
      local.getUTCFullYear(),
      String(local.getUTCMonth() + 1).padStart(2, '0'),
      String(local.getUTCDate()).padStart(2, '0'),
    ].join('-');

    const nextMidnight = new Date(
      Date.UTC(
        local.getUTCFullYear(),
        local.getUTCMonth(),
        local.getUTCDate() + 1,
      ) -
        offset * 60000,
    );
    const localReset = new Date(nextMidnight.getTime() + offset * 60000);
    const localTime = `${String(localReset.getUTCHours()).padStart(2, '0')}:${String(
      localReset.getUTCMinutes(),
    ).padStart(2, '0')}`;

    return {
      dayKey,
      resetsAt: nextMidnight.toISOString(),
      localTime,
    };
  }

  private quotaError(tzOffsetMinutes: number, usedAt?: Date): HttpException {
    const { resetsAt, localTime, dayKey } = this.clock(tzOffsetMinutes);
    return new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: `You have already used today's free MoneyBuddy AI. Your next one unlocks at ${localTime}.`,
        dayKey,
        usedAt,
        resetsAt,
        remainingToday: 0,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  async status(
    userId: string,
    tzOffsetMinutes: number,
  ): Promise<AiQuotaPayload> {
    const { dayKey, resetsAt } = this.clock(tzOffsetMinutes);
    const existing = await this.usageModel
      .findOne({ userId, dayKey })
      .exec();

    return {
      kind: existing?.kind ?? 'chat',
      dayKey,
      allowed: !existing,
      usedAt: existing?.createdAt,
      resetsAt,
      remainingToday: existing ? 0 : 1,
    };
  }

  private async reserve(
    userId: string,
    kind: string,
    tzOffsetMinutes: number,
  ): Promise<AiUsageDocument> {
    const { dayKey } = this.clock(tzOffsetMinutes);
    try {
      return await this.usageModel.create({ userId, dayKey, kind });
    } catch (error) {
      const code = (error as { code?: number })?.code;
      if (code === 11000) {
        const existing = await this.usageModel
          .findOne({ userId, dayKey })
          .exec();
        throw this.quotaError(tzOffsetMinutes, existing?.createdAt);
      }
      throw error;
    }
  }

  private async release(usage: AiUsageDocument): Promise<void> {
    try {
      await this.usageModel.deleteOne({ _id: usage._id }).exec();
    } catch (error) {
      this.logger.warn(`Could not release AI quota: ${String(error)}`);
    }
  }

  private async callGroq(messages: ChatMessage[]): Promise<string> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'MoneyBuddy AI is not configured on the server yet.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const model = this.config.get<string>('GROQ_MODEL') || DEFAULT_MODEL;

    let response: Response;
    try {
      response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 1200,
          messages,
        }),
        signal: AbortSignal.timeout(60000),
      });
    } catch (error) {
      this.logger.error(`Groq request failed: ${String(error)}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'MoneyBuddy AI could not be reached. Please try again.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Groq ${response.status}: ${body.slice(0, 400)}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'MoneyBuddy AI could not answer right now. Please try again.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'MoneyBuddy AI returned an empty answer. Please try again.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return content;
  }

  private async buildSnapshot(userId: string): Promise<string> {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [transactions, goals, recurring] = await Promise.all([
      this.transactionModel
        .find({ userId, date: { $gte: since } })
        .sort({ date: -1 })
        .limit(500)
        .lean()
        .exec(),
      this.goalModel.find({ userId }).lean().exec(),
      this.recurringModel.find({ userId }).lean().exec(),
    ]);

    const income = transactions.filter((t) => t.type === 'income');
    const expenses = transactions.filter((t) => t.type === 'expense');
    const sum = (list: { amount?: number }[]) =>
      Math.round(
        list.reduce((total, item) => total + Number(item.amount ?? 0), 0),
      );

    const byCategory = new Map<string, number>();
    for (const expense of expenses) {
      const key = expense.category || 'Other';
      byCategory.set(key, (byCategory.get(key) ?? 0) + Number(expense.amount ?? 0));
    }
    const categories = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, amount]) => `${name} Rs.${Math.round(amount)}`)
      .join(', ');

    const byMonth = new Map<string, { income: number; expense: number }>();
    for (const item of transactions) {
      const month = new Date(item.date).toISOString().slice(0, 7);
      const bucket = byMonth.get(month) ?? { income: 0, expense: 0 };
      if (item.type === 'income') bucket.income += Number(item.amount ?? 0);
      else bucket.expense += Number(item.amount ?? 0);
      byMonth.set(month, bucket);
    }
    const months = [...byMonth.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(
        ([month, bucket]) =>
          `${month}: income Rs.${Math.round(bucket.income)} spend Rs.${Math.round(bucket.expense)}`,
      )
      .join('; ');

    const recent = transactions
      .slice(0, 15)
      .map((item) => {
        const date = new Date(item.date).toISOString().slice(0, 10);
        return `${date} ${item.type} ${item.category} Rs.${Math.round(
          Number(item.amount ?? 0),
        )}${item.notes ? ` (${item.notes})` : ''}`;
      })
      .join('; ');

    const accounts = new Map<string, number>();
    for (const item of transactions) {
      const key = item.receivedIn || 'Unknown';
      accounts.set(key, (accounts.get(key) ?? 0) + 1);
    }
    const accountMix = [...accounts.entries()]
      .map(([name, count]) => `${name} x${count}`)
      .join(', ');

    const goalLines = goals
      .map((goal) => {
        const prefix = `Savings: ${goal.goal}`;
        const saved = transactions
          .filter(
            (item) =>
              item.type === 'income' &&
              (item.notes ?? '').toLowerCase().startsWith(prefix.toLowerCase()),
          )
          .reduce((total, item) => total + Number(item.amount ?? 0), 0);
        return `${goal.goal}: Rs.${Math.round(saved)} saved of Rs.${Math.round(
          Number(goal.amount ?? 0),
        )} target`;
      })
      .join('; ');

    const recurringLines = recurring
      .slice(0, 15)
      .map(
        (item) =>
          `${item.name} Rs.${Math.round(
            Number(item.amount ?? item.ammount ?? 0),
          )} ${item.frequency}${item.isdone ? ' (paid this cycle)' : ''}`,
      )
      .join(', ');

    const lines = [
      `Currency: INR. Snapshot covers the last 90 days.`,
      `Income (90 days): Rs.${sum(income)} from ${income.length} entries.`,
      `Spending (90 days): Rs.${sum(expenses)} from ${expenses.length} entries.`,
      months ? `Month by month: ${months}.` : '',
      categories ? `Spend by category: ${categories}.` : '',
      accountMix ? `Payment mix: ${accountMix}.` : '',
      recent ? `Recent transactions: ${recent}.` : '',
      goalLines ? `Goals: ${goalLines}.` : '',
      recurringLines ? `Recurring payments: ${recurringLines}.` : '',
      !transactions.length
        ? 'No transactions recorded yet for this user.'
        : '',
    ].filter(Boolean);

    return lines.join('\n');
  }

  async chat(
    userId: string,
    question: string,
    tzOffsetMinutes: number,
  ): Promise<AiQuotaPayload & { reply: string }> {
    const { dayKey, resetsAt } = this.clock(tzOffsetMinutes);
    const existing = await this.usageModel.findOne({ userId, dayKey }).exec();
    if (existing) {
      throw this.quotaError(tzOffsetMinutes, existing.createdAt);
    }

    const usage = await this.reserve(userId, 'chat', tzOffsetMinutes);
    try {
      const snapshot = await this.buildSnapshot(userId);
      const reply = await this.callGroq([
        { role: 'system', content: CHAT_SYSTEM },
        {
          role: 'user',
          content: `FINANCIAL SNAPSHOT\n${snapshot}\n\nUser question: ${question}`,
        },
      ]);

      return {
        reply,
        kind: 'chat',
        dayKey,
        allowed: false,
        usedAt: usage.createdAt,
        resetsAt,
        remainingToday: 0,
      };
    } catch (error) {
      await this.release(usage);
      throw error;
    }
  }

  async budgetPlan(
    userId: string,
    tzOffsetMinutes: number,
  ): Promise<AiQuotaPayload & { plan: Record<string, unknown> }> {
    const { dayKey, resetsAt } = this.clock(tzOffsetMinutes);
    const existing = await this.usageModel.findOne({ userId, dayKey }).exec();
    if (existing) {
      throw this.quotaError(tzOffsetMinutes, existing.createdAt);
    }

    const usage = await this.reserve(userId, 'budget', tzOffsetMinutes);
    try {
      const snapshot = await this.buildSnapshot(userId);
      const raw = await this.callGroq([
        { role: 'system', content: PLAN_SYSTEM },
        {
          role: 'user',
          content: `FINANCIAL SNAPSHOT\n${snapshot}\n\nBuild my monthly budget plan now.`,
        },
      ]);

      return {
        plan: this.parsePlan(raw),
        kind: 'budget',
        dayKey,
        allowed: false,
        usedAt: usage.createdAt,
        resetsAt,
        remainingToday: 0,
      };
    } catch (error) {
      await this.release(usage);
      throw error;
    }
  }

  private parsePlan(raw: string): Record<string, unknown> {
    const cleaned = raw
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (error) {
      this.logger.warn(`Plan was not valid JSON: ${String(error)}`);
    }

    return {
      summary: cleaned.slice(0, 600),
      limits: [],
      savings: {},
      risks: [],
      checklist: [],
    };
  }
}
