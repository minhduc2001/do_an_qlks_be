import { ToNumber, Trim } from '@/base/decorators/common.decorator';
import { UploadFileDto } from '@/shared/dtos/common.dto';
import { EState } from '@/shared/enum/common.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import * as dayjs from 'dayjs';

export class CreatePromotionDto extends UploadFileDto {
  @ApiProperty({ example: 'Giặt đồ' })
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiPropertyOptional({ example: 'Giặt quần áo' })
  @IsOptional()
  @IsString()
  @Trim()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  image: string;

  @ApiProperty({ example: dayjs().startOf('month').format('YYYY-MM-DD') })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  start_date: Date;

  @ApiProperty({ example: dayjs().startOf('month').format('YYYY-MM-DD') })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  end_date: Date;

  @ApiProperty({ example: 1.2 })
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  discount: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsPositive()
  @ToNumber()
  quantity: number;

  @ApiPropertyOptional({ enum: EState, example: EState.Active })
  @IsOptional()
  @IsEnum(EState)
  @ToNumber()
  state: EState;
}
