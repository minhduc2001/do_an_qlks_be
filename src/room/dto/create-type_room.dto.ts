import { ToNumber, ToNumbers, Trim } from '@/base/decorators/common.decorator';
import { UploadFilesDto } from '@/shared/dtos/common.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
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
  parent: string;

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

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsPositive({ each: true })
  @IsArray()
  @ToNumbers()
  feature_rooms: number[];

  @ApiPropertyOptional({ example: [''] })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  images: string[];
}
