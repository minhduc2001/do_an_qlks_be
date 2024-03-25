import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class StatsRevenueTimeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  start_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  end_date: Date;
}
