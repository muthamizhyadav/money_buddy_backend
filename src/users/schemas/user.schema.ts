import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    default: uuidv4,
  })
  _id!: string;

  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    required: true,
  })
  password!: string;

  @Prop({
    default: 'user',
  })
  role!: string;

  @Prop({
    default: true,
  })
  isActive!: boolean;

  @Prop({
    required: false,
    trim: true,
  })
  adhaar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
