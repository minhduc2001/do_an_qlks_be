import { ToNumber, ToNumbers, Trim } from '@/base/decorators/common.decorator';
import { UploadFilesDto } from '@/shared/dtos/common.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateTypeRoomDto extends UploadFilesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @ToNumber()
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @ToNumber()
  parent: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @ToNumber()
  contains: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @ToNumber()
  area: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  type_bed: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  checkin: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  checkout: string;

  @ValidateIf(({ values }) => !!values)
  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsPositive({ each: true })
  @IsArray()
  @ToNumbers()
  feature_rooms: number[];

  @ValidateIf(({ values }) => !!values)
  @ApiPropertyOptional({ example: [''] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => value && value.toString().split(','))
  @IsArray()
  images: string[];
}
