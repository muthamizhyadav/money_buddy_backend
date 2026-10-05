import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @ApiProperty({ example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @Prop({
    type: String,
    default: uuidv4,
  })
  _id!: string;

  @ApiProperty({ example: 'John Doe' })
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @ApiProperty({ example: 'user@example.com' })
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @ApiProperty({ writeOnly: true, example: 'secret123' })
  @Prop({
    required: true,
  })
  password!: string;

  @ApiProperty({ example: 'user' })
  @Prop({
    default: 'user',
  })
  role!: string;

  @ApiProperty({ example: true })
  @Prop({
    default: true,
  })
  isActive!: boolean;

  @ApiProperty({ required: false, example: '1234-5678-9012' })
  @Prop({
    required: false,
    trim: true,
  })
  adhaar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
