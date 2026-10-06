import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AiChatDto {
  @ApiProperty({
    example: 'How can I cut my food spending this month?',
    maxLength: 600,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  question!: string;

  @ApiProperty({
    example: 330,
    description: 'Client timezone offset from UTC in minutes',
  })
  @IsInt()
  @Min(-840)
  @Max(840)
  tzOffsetMinutes!: number;
}

export class AiPlanDto {
  @ApiProperty({
    example: 330,
    description: 'Client timezone offset from UTC in minutes',
  })
  @IsInt()
  @Min(-840)
  @Max(840)
  tzOffsetMinutes!: number;
}
