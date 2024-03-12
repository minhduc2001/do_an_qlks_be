import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { TypeRoomService } from './type_room.service';
import { CreateTypeRoomDto } from './dto/create-type_room.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly typeRoomService: TypeRoomService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('files'))
  create(
    @Body() payload: CreateTypeRoomDto,
    @UploadedFile() files: Array<Express.Multer.File>,
  ) {
    return this.typeRoomService.create({
      ...payload,
      files: files.map((file) => file.filename),
    });
  }

  @Get()
  find() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
