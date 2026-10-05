import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseIncomeDto {
  @ApiProperty({ example: 150.5, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'Groceries' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 'Weekly shopping', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2026-10-05' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  @IsIn(['income', 'expense'])
  type!: 'income' | 'expense';

  @ApiProperty({ example: false })
  @IsBoolean()
  isRecurring!: boolean;

  @ApiProperty({ example: 'Bank' })
  @IsString()
  @IsNotEmpty()
  receivedIn!: string;
}

export class GoalDto {
  @ApiProperty({ example: 5000, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'New laptop' })
  @IsString()
  @IsNotEmpty()
  goal!: string;
}

export class RecurringDto {
  @ApiProperty({ example: 'Netflix' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 499, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'monthly' })
  @IsString()
  @IsNotEmpty()
  frequency!: string;
}
