import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type GoalDocument = HydratedDocument<Goal>;

@Schema({
  timestamps: true,
})
export class Goal {
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
  })
  goal!: string;

  @Prop({
    type: String,
    required: true,
  })
  userId!: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
