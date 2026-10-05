import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type GoalDocument = HydratedDocument<Goal>;

@Schema({
  timestamps: true,
})
export class Goal {
  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({
    type: String,
    default: uuidv4,
  })
  _id!: string;

  @ApiProperty({ example: 5000, minimum: 0.01 })
  @Prop({
    type: Number,
    required: true,
    min: 0.01,
  })
  amount!: number;

  @ApiProperty({ example: 'New laptop' })
  @Prop({
    type: String,
    required: true,
  })
  goal!: string;

  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({
    type: String,
    required: true,
  })
  userId!: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
