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