import {
    ConflictException,
    Injectable,
  } from '@nestjs/common';
  
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  
  import {
    User,
    UserDocument,
  } from './schemas/user.schema';
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectModel(User.name)
      private readonly userModel: Model<UserDocument>,
    ) {}
  
    async findByEmail(email: string) {
      return this.userModel
        .findOne({
          email: email.toLowerCase(),
        })
        .select('+password')
        .exec();
    }
  
    async findById(id: string) {
      return this.userModel
        .findById(id)
        .select('-password')
        .exec();
    }
  
    async create(
      name: string,
      email: string,
      password: string,
      role: string,
      adhaar?: string,
    ) {
      const existingUser = await this.findByEmail(email);
  
      if (existingUser) {
        throw new ConflictException(
          'Email already registered',
        );
      }
  
      const user = new this.userModel({
        name,
        email: email.toLowerCase(),
        password,
        role,
        adhaar,
      });
  
      return user.save();
    }
  }