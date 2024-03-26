import { Trim } from '@/base/decorators/common.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StatsRevenueTimeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  startDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  endDate: string;
}
