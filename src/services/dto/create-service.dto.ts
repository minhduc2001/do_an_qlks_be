import { ToNumber, Trim } from '@/base/decorators/common.decorator';
import { UploadFileDto } from '@/shared/dtos/common.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateServiceDto extends UploadFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  unity: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @ToNumber()
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  image: string;
}
