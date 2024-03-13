import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { StringToArray, ToNumber } from '@base/decorators/common.decorator';

export abstract class ListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @ToNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @ToNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  sortBy?: [string, string][];

  @ApiProperty({ required: false })
  @IsOptional()
  @StringToArray()
  searchBy?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, type: 'text' })
  @IsOptional()
  filter?: { [column: string]: string | string[] };

  @ApiProperty({ required: false })
  @IsOptional()
  select?: string[];

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  path?: string;
}

export class UploadFileDto {
  @ApiProperty({ required: false })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  @IsOptional()
  file: string;
}

export class UploadFilesDto {
  @ApiProperty({
    required: false,
    type: 'array',
    description: 'File to upload',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  files: string[];
}
