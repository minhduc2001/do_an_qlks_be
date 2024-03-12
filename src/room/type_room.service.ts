import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeRoom } from './entities/type_room.entity';
import { In, Repository } from 'typeorm';
import { BaseService } from '@/base/service/base.service';
import { CreateTypeRoomDto } from './dto/create-type_room.dto';
import { FeatureRoom } from './entities/feature_room.entity';
import { UpdateTypeRoomDto } from './dto/update-type_room.dto';
import { BadExcetion, BadRequest } from '@/base/api/exception.reslover';

@Injectable()
export class TypeRoomService extends BaseService<TypeRoom> {
  constructor(
    @InjectRepository(TypeRoom)
    protected readonly repository: Repository<TypeRoom>,
    @InjectRepository(FeatureRoom)
    private readonly featureRoomRepository: Repository<FeatureRoom>,
  ) {
    super(repository);
  }

  async create(payload: CreateTypeRoomDto) {
    const {
      name,
      description,
      price,
      parent,
      contains,
      area,
      type_bed,
      checkin,
      checkout,
      feature_rooms,
    } = payload;

    const fr = await this._prepare(feature_rooms);

    const tr = new TypeRoom();
    tr.name = name;
    tr.description = description;
    tr.price = price;
    tr.parent = parent;
    tr.contains = contains;
    tr.area = area;
    tr.type_bed = type_bed;
    tr.checkin = checkin;
    tr.checkout = checkout;
    tr.feature_rooms = fr;

    return tr.save();
  }

  findAll() {
    return `This action returns all room`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  async update(id: number, payload: UpdateTypeRoomDto) {
    const {
      name,
      description,
      price,
      parent,
      contains,
      area,
      type_bed,
      checkin,
      checkout,
      feature_rooms,
    } = payload;

    const tr = await this.repository.findOne({ where: { id } });
    if (!tr) throw new BadExcetion({ message: 'phong khong ton tai' });

    const fr = await this._prepare(feature_rooms);

    tr.name = name;
    tr.description = description;
    tr.price = price;
    tr.parent = parent;
    tr.contains = contains;
    tr.area = area;
    tr.type_bed = type_bed;
    tr.checkin = checkin;
    tr.checkout = checkout;
    tr.feature_rooms = fr;

    return tr.save();
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }

  private _prepare(feature_room_ids: number[]) {
    if (Array.isArray(feature_room_ids)) {
      return this.featureRoomRepository.findBy({
        id: In([...feature_room_ids]),
      });
    }
    return [];
  }
}
