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

export class CreateExpenseIncomeDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  date!: string;

  @IsIn(['income', 'expense'])
  type!: 'income' | 'expense';

  @IsBoolean()
  isRecurring!: boolean;

  @IsString()
  @IsNotEmpty()
  receivedIn!: string;
}

export class GoalDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  goal!: string;
}

export class RecurringDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  frequency!: string;
}
