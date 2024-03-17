import { UploadService } from './../base/multer/upload.service';
import { FeatureRoomService } from './feature_room.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  Put,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { TypeRoomService } from './type_room.service';
import { CreateTypeRoomDto } from './dto/create-type_room.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateTypeRoomDto } from './dto/update-type_room.dto';
import { ListTypeRoomDto } from './dto/list-type_room.dto';
import { ListRoomDto } from './dto/list-room.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ListDto } from '@/shared/dtos/common.dto';
import { Public } from '@/auth/decorator/public.decorator';
import { AddRoomDto } from './dto/add-room.dto';

@ApiTags('Room')
@Controller('room')
@ApiBearerAuth()
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly typeRoomService: TypeRoomService,
    private readonly featureRoomService: FeatureRoomService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('get-room')
  @Public()
  findRoom(@Query() query: ListRoomDto) {
    return this.roomService.findAll(query);
  }

  @Post('create-room')
  createRoom(@Body() payload: CreateRoomDto) {
    return this.roomService.create(payload);
  }

  @Put(':id/update-room')
  updateRoom(@Param('id') id: string, @Body() payload: UpdateRoomDto) {
    return this.roomService.update(+id, payload);
  }

  @Get('get-feature-room')
  @Public()
  findFeatureRoom(@Query() query: ListDto) {
    return this.featureRoomService.findAll(query);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() payload: CreateTypeRoomDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const urlFiles = await this.uploadService.uploadMultipeFile(files);
    return this.typeRoomService.create({
      ...payload,
      files: urlFiles,
    });
  }

  @Get()
  @Public()
  find(@Query() query: ListTypeRoomDto) {
    return this.typeRoomService.findAll(query);
  }

  @Get('with-relation')
  @Public()
  findWithRelation(@Query() query: ListTypeRoomDto) {
    return this.typeRoomService.findAll(query);
  }

  @Get(':identity')
  @Public()
  findOne(@Param('identity') identity: string) {
    return this.typeRoomService.findOne(identity);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateTypeRoomDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const urlFiles =
      files && (await this.uploadService.uploadMultipeFile(files));
    return this.typeRoomService.update(+id, {
      ...payload,
      files: urlFiles,
    });
  }

  @Put(':id/add-room-name')
  async addRoomName(@Param('id') id: string, @Body() payload: AddRoomDto) {
    return this.typeRoomService.addRoom(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeRoomService.remove(+id);
  }
}
