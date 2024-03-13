import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { kebabCase } from 'lodash';
import { TypeRoom } from './entities/type_room.entity';
import { In, Repository } from 'typeorm';
import { BaseService } from '@/base/service/base.service';
import { CreateTypeRoomDto } from './dto/create-type_room.dto';
import { FeatureRoom } from './entities/feature_room.entity';
import { UpdateTypeRoomDto } from './dto/update-type_room.dto';
import { BadExcetion, BadRequest } from '@/base/api/exception.reslover';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { ListTypeRoomDto } from './dto/list-type_room.dto';
import { Room } from './entities/room.entity';
import { removeAccents } from '@/base/helper/function.helper';

@Injectable()
export class TypeRoomService extends BaseService<TypeRoom> {
  constructor(
    @InjectRepository(TypeRoom)
    protected readonly repository: Repository<TypeRoom>,
    @InjectRepository(FeatureRoom)
    private readonly featureRoomRepository: Repository<FeatureRoom>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
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
      images,
      files,
    } = payload;

    const slug: string = kebabCase(`${removeAccents(name)}}`);

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
    tr.slug = slug;
    tr.images = this._handleImage(images, files);

    return tr.save();
  }

  async findAll(query: ListTypeRoomDto) {
    const config: PaginateConfig<TypeRoom> = {
      sortableColumns: ['id'],
      relations: ['feature_rooms', 'rooms'],
    };

    return this.listWithPage(query, config);
  }

  async findAllWithRelation(query: ListTypeRoomDto) {
    const config: PaginateConfig<TypeRoom> = {
      sortableColumns: ['id'],
      relations: ['rooms'],
    };

    return this.listWithPage(query, config);
  }

  async findOne(id: number) {
    const tr = await this.repository.findOne({ where: { id } });
    if (!tr) throw new BadExcetion({ message: 'phong khong ton tai' });
    return tr;
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
      images,
      files,
    } = payload;

    const tr = await this.repository.findOne({ where: { id } });
    if (!tr) throw new BadExcetion({ message: 'phong khong ton tai' });

    const slug: string = kebabCase(`${removeAccents(name)}}`);
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
    tr.slug = slug;
    tr.images = this._handleImage(images, files);

    return tr.save();
  }

  async addRoom() {}

  async remove(id: number) {
    const tr = await this.repository.findOne({ where: { id } });
    if (!tr) throw new BadExcetion({ message: 'phong khong ton tai' });

    return this.repository.remove(tr);
  }

  private _prepare(feature_room_ids: number[]) {
    if (Array.isArray(feature_room_ids)) {
      return this.featureRoomRepository.findBy({
        id: In([...feature_room_ids]),
      });
    }
    return [];
  }

  private _handleImage(images: string[], files: string[]) {
    console.log(images);

    const newImages = images || [];
    if (Array.isArray(files)) newImages.push(...files);
    return newImages;
  }
}
