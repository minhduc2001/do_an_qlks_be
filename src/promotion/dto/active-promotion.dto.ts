import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ActivePromotionDto {
  @ApiProperty()
  @IsNotEmpty()
  active: string;
}
