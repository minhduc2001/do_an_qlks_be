import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class GetPromotionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  checkin: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  checkout: Date;
}
