import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddRoomDto {
  @ApiProperty()
  @IsString({ each: true })
  @IsNotEmpty()
  @IsArray()
  room_names: string[];
}
