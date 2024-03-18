import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/service/base.service';
import { BadExcetion } from '@/base/api/exception.reslover';
import { ListRoomDto } from './dto/list-room.dto';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { TypeRoom } from './entities/type_room.entity';

@Injectable()
export class RoomService extends BaseService<Room> {
  constructor(
    @InjectRepository(Room)
    protected readonly repository: Repository<Room>,
    @InjectRepository(TypeRoom)
    private readonly typeRoomRepository: Repository<TypeRoom>,
  ) {
    super(repository);
  }
  async create(type_room_id: number, payload: CreateRoomDto) {
    const type_room = await this.typeRoomRepository.findOne({
      where: { id: type_room_id },
    });
    const room = await this.repository.findOne({
      where: { name: payload.name },
    });
    if (room) throw new BadExcetion({ message: 'Phong da ton tai' });

    return this.repository.save(payload);
  }

  async findAll(query: ListRoomDto) {
    const config: PaginateConfig<Room> = {
      sortableColumns: ['id'],
    };

    return this.listWithPage(query, config);
  }

  async findOne(id: number) {
    const room = await this.repository.findOne({
      where: { id },
    });
    if (!room) throw new BadExcetion({ message: 'Phong khong ton tai' });
    return room;
  }

  async update(id: number, payload: UpdateRoomDto) {
    const room = await this.findOne(id);
    room.name = payload.name;
    return room.save();
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
