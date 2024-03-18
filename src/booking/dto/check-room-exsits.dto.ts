import { ToNumber } from '@/base/decorators/common.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsPositive } from 'class-validator';
import * as dayjs from 'dayjs';

export class CheckRoomExitsDto {
  @ApiProperty({ example: dayjs().startOf('month').format('YYYY-MM-DD') })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  check_in: Date;

  @ApiProperty({ example: dayjs().startOf('month').format('YYYY-MM-DD') })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  check_out: Date;
}
