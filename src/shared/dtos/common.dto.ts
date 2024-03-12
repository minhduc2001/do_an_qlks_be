import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { StringToArray } from '@base/decorators/common.decorator';

export abstract class ListDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
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

  @ApiProperty({ required: false })
  @IsOptional()
  path: string;
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
