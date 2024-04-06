import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ActiveServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  active: string;
}
