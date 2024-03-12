import { PartialType } from '@nestjs/swagger';
import { CreateTypeRoomDto } from './create-type_room.dto';

export class UpdateTypeRoomDto extends PartialType(CreateTypeRoomDto) {}
