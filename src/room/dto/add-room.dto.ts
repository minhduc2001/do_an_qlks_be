import { ToNumber, Trim } from '@/base/decorators/common.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class RoomNameDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsPositive()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Trim()
  name: string;
}

export class AddRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  room_names: RoomNameDto[];
}
