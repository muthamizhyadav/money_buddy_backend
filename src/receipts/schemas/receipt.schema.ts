import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ReceiptDocument = HydratedDocument<Receipt>;

@Schema({ timestamps: true })
export class ReceiptItem {
  @ApiProperty({ example: 'Masala Dosa' })
  @Prop({ type: String, required: true })
  name!: string;

  @ApiProperty({ example: 2, required: false })
  @Prop({ type: Number, required: false })
  quantity?: number;

  @ApiProperty({ example: 120, required: false })
  @Prop({ type: Number, required: false })
  price?: number;
}

export const ReceiptItemSchema = SchemaFactory.createForClass(ReceiptItem);

@Schema({ timestamps: true })
export class Receipt {
  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({ type: String, default: uuidv4 })
  _id!: string;

  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @ApiProperty({ example: 'Saravana Bhavan', required: false })
  @Prop({ type: String, trim: true })
  merchant?: string;

  @ApiProperty({ example: 450.5, required: false })
  @Prop({ type: Number, required: false })
  total?: number;

  @ApiProperty({ example: 'INR' })
  @Prop({ type: String, default: 'INR' })
  currency!: string;

  @ApiProperty({ example: '2026-10-05T00:00:00.000Z', required: false })
  @Prop({ type: Date, required: false })
  date?: Date;

  @ApiProperty({ type: [ReceiptItem], required: false })
  @Prop({ type: [ReceiptItemSchema], default: [] })
  items!: ReceiptItem[];

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  rawText?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  fileName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  mimeType?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number, required: false })
  sizeBytes?: number;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

ReceiptSchema.index({ userId: 1, createdAt: -1 });
