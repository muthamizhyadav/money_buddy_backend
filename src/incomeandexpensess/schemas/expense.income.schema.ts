import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ExpenseIncomeDocument = HydratedDocument<ExpenseIncome>;

@Schema({
  timestamps: true,
})
export class ExpenseIncome {
  @Prop({
    type: String,
    default: uuidv4,
  })
  _id!: string;

  @Prop({
    type: Number,
    required: true,
    min: 0.01,
  })
  amount!: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  category!: string;

  @Prop({
    type: String,
    trim: true,
  })
  notes?: string;

  @Prop({
    type: Date,
    required: true,
  })
  date!: Date;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  userId!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['income', 'expense'],
    index: true,
  })
  type!: 'income' | 'expense';

  @Prop({
    type: Boolean,
    default: false,
  })
  isRecurring!: boolean;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  receivedIn!: string;
}

export const ExpenseIncomeSchema =
  SchemaFactory.createForClass(ExpenseIncome);

ExpenseIncomeSchema.index({
  userId: 1,
  date: -1,
});

ExpenseIncomeSchema.index({
  userId: 1,
  type: 1,
  date: -1,
});

ExpenseIncomeSchema.index({
  userId: 1,
  category: 1,
  date: -1,
});