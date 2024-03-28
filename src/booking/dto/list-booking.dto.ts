import { Trim } from '@/base/decorators/common.decorator';
import { ListDto } from '@/shared/dtos/common.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListBookingDto extends ListDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  @Trim()
  startDate: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  @Trim()
  endDate: string;
}
