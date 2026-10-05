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
import { ApiProperty, PartialType } from '@nestjs/swagger';

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

export class UpdateExpenseIncomeDto extends PartialType(CreateExpenseIncomeDto) {}

export class UpdateRecurringDto {
  @ApiProperty({ example: 'Netflix', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 499, minimum: 0.01, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiProperty({ example: 'monthly', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  frequency?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isdone?: boolean;
}
