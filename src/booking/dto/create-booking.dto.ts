import { ToNumber } from '@/base/decorators/common.decorator';
import { EPaymentType } from '@/bill/bill.constant';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsPositive } from 'class-validator';
import * as dayjs from 'dayjs';

export class CreateBookingDto {
  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  @ToNumber()
  quantity: number;

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  @ToNumber()
  type_room_id: number;

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

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EPaymentType)
  @ToNumber()
  payment_method: EPaymentType;
}
