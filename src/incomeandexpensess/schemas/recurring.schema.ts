import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type RecurringDocument = HydratedDocument<Recurring>;

@Schema({
  timestamps: true,
})
export class Recurring {
  @Prop({
    type: String,
    default: uuidv4,
  })
  _id!: string;

  @Prop({
    type: String,
    required: true,
  })
  userId!: string;

  @Prop({
    type: String,
    required: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
  })
  ammount!: string;

  @Prop({
    type: String,
    required: true,
  })
  frequency!: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isdone!: boolean;
}


export const RecurringSchema =
  SchemaFactory.createForClass(Recurring);