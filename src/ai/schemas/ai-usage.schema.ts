import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AiUsageDocument = HydratedDocument<AiUsage>;

@Schema({
  timestamps: true,
  collection: 'ai_usages',
})
export class AiUsage {
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
    index: true,
  })
  userId!: string;

  @ApiProperty({ example: '2026-10-06' })
  @Prop({
    type: String,
    required: true,
  })
  dayKey!: string;

  @ApiProperty({ enum: ['chat', 'budget'], example: 'chat' })
  @Prop({
    type: String,
    enum: ['chat', 'budget'],
    default: 'chat',
  })
  kind!: string;

  @ApiProperty({ example: '2026-10-06T04:12:00.000Z' })
  createdAt?: Date;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);

AiUsageSchema.index(
  { userId: 1, dayKey: 1 },
  { unique: true },
);
