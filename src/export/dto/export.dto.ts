import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ExportDto {
  @ApiProperty({ enum: ['csv', 'json'], example: 'csv' })
  @IsIn(['csv', 'json'])
  format!: 'csv' | 'json';
}
