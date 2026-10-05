import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ExpenseIncomeDocument = HydratedDocument<ExpenseIncome>;

@Schema({
  timestamps: true,
})
export class ExpenseIncome {
  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({
    type: String,
    default: uuidv4,
  })
  _id!: string;

  @ApiProperty({ example: 150.5, minimum: 0.01 })
  @Prop({
    type: Number,
    required: true,
    min: 0.01,
  })
  amount!: number;

  @ApiProperty({ example: 'Groceries' })
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  category!: string;

  @ApiProperty({ required: false, example: 'Weekly shopping' })
  @Prop({
    type: String,
    trim: true,
  })
  notes?: string;

  @ApiProperty({ example: '2026-10-05T00:00:00.000Z' })
  @Prop({
    type: Date,
    required: true,
  })
  date!: Date;

  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({
    type: String,
    required: true,
    index: true,
  })
  userId!: string;

  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  @Prop({
    type: String,
    required: true,
    enum: ['income', 'expense'],
    index: true,
  })
  type!: 'income' | 'expense';

  @ApiProperty({ example: false })
  @Prop({
    type: Boolean,
    default: false,
  })
  isRecurring!: boolean;

  @ApiProperty({ example: 'Bank' })
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  receivedIn!: string;
}

export const ExpenseIncomeSchema = SchemaFactory.createForClass(ExpenseIncome);

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
