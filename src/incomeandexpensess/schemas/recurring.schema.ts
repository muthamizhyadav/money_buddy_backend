import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type RecurringDocument = HydratedDocument<Recurring>;

@Schema({
  timestamps: true,
})
export class Recurring {
  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({
    type: String,
    default: uuidv4,
  })
  _id!: string;

  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({
    type: String,
    required: true,
  })
  userId!: string;

  @ApiProperty({ example: 'Netflix' })
  @Prop({
    type: String,
    required: true,
  })
  name!: string;

  @ApiProperty({ example: '499' })
  @Prop({
    type: String,
    required: true,
  })
  ammount!: string;

  @ApiProperty({ example: 'monthly' })
  @Prop({
    type: String,
    required: true,
  })
  frequency!: string;

  @ApiProperty({ example: false })
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isdone!: boolean;
}

export const RecurringSchema = SchemaFactory.createForClass(Recurring);
