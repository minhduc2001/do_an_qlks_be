import { ToNumber } from '@/base/decorators/common.decorator';
import { EPaymentType } from '@/bill/bill.constant';
import { EGender } from '@/user/user.constant';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
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

export class CmsCreateBookingDto {
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
  checkin: Date;

  @ApiProperty({ example: dayjs().startOf('month').format('YYYY-MM-DD') })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  checkout: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EPaymentType)
  @ToNumber()
  payment_type: EPaymentType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value && value.trim())
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value && value.trim())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value && value.trim())
  cccd: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value && value.trim())
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value && value.trim())
  address: string;

  @ApiProperty({})
  @IsNotEmpty()
  @IsEnum(EGender)
  @ToNumber()
  gender: EGender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @ToNumber()
  id: number;
}
