import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { kebabCase } from 'lodash';
import { TypeRoom } from './entities/type_room.entity';
import { DataSource, In, Repository } from 'typeorm';
import { BaseService } from '@/base/service/base.service';
import { CreateTypeRoomDto } from './dto/create-type_room.dto';
import { FeatureRoom } from './entities/feature_room.entity';
import { UpdateTypeRoomDto } from './dto/update-type_room.dto';
import { BadExcetion, BadRequest } from '@/base/api/exception.reslover';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { ListTypeRoomDto } from './dto/list-type_room.dto';
import { Room } from './entities/room.entity';
import { removeAccents } from '@/base/helper/function.helper';
import { AddRoomDto } from './dto/add-room.dto';

@Injectable()
export class TypeRoomService extends BaseService<TypeRoom> {
  constructor(
    @InjectRepository(TypeRoom)
    protected readonly repository: Repository<TypeRoom>,
    @InjectRepository(FeatureRoom)
    private readonly featureRoomRepository: Repository<FeatureRoom>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private dataSource: DataSource,
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
      searchableColumns: ['name'],
    };

    const queryB = this.repository
      .createQueryBuilder('type_room')
      .leftJoinAndSelect('type_room.rooms', 'room')
      .leftJoinAndSelect('room.booked_rooms', 'br')
      .leftJoinAndSelect('br.booking', 'booking')
      .leftJoinAndSelect('type_room.feature_rooms', 'fr');

    return this.listWithPage(query, config, queryB);
  }

  async findAllWithRelation() {
    const [type_room, type_room_booking] = await Promise.all([
      this.repository
        .createQueryBuilder('type_room')
        .leftJoinAndSelect('type_room.rooms', 'room')
        // .leftJoinAndSelect('room.booked_rooms', 'br')
        // .leftJoinAndSelect('br.booking', 'booking')
        // .leftJoinAndSelect('booking.customer', 'customer')
        .where('room.is_booking = false')
        .getMany(),
      this.repository
        .createQueryBuilder('type_room')
        .leftJoinAndSelect('type_room.rooms', 'room')
        .leftJoinAndSelect('room.booked_rooms', 'br')
        .leftJoinAndSelect('br.booking', 'booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .where('room.is_booking = true')
        .andWhere('booking.is_checked_out = false')
        .andWhere('booking.is_cancel = false')
        .getMany(),
    ]);

    return [...type_room, ...type_room_booking];
  }

  async findOne(identity: string) {
    const isInterger = Number.isInteger(identity);

    const option = isInterger ? { id: +identity } : { slug: identity };
    const tr = await this.repository.findOne({
      where: option,
      relations: { feature_rooms: true },
    });

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

  async addRoom(id: number, payload: AddRoomDto) {
    const tr = await this.repository.findOne({
      where: { id },
      relations: { rooms: true },
    });
    if (!tr) throw new BadExcetion({ message: 'phong khong ton tai' });

    const tr_name_id = tr.rooms.map((r) => r.id);
    const newRoom = [];
    let duplicate;

    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.startTransaction();
    try {
      for (const r of payload.room_names) {
        duplicate = r.name;
        if (!r.id) {
          newRoom.push(
            await queryRunner.manager.save(Room, { ...r, type_room: tr }),
          );
          continue;
        }

        const index = tr_name_id.indexOf(r.id);

        if (index !== -1) {
          const temp = await this.roomRepository.findOne({
            where: { id: r.id },
          });

          newRoom.push(
            temp.name === r.name
              ? temp
              : await queryRunner.manager.save(Room, {
                  ...temp,
                  name: r.name,
                }),
          );

          tr_name_id.splice(index, 1);
        }
      }

      if (tr_name_id.length)
        await Promise.all(
          tr_name_id.map(
            async (r_id) =>
              await queryRunner.manager.delete(Room, { id: r_id }),
          ),
        );

      // await queryRunner.manager.update(TypeRoom, tr.id, { rooms: newRoom });
      // await Promise.all(newRoom.map((r) => r.save()));

      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.log(e);

      throw new BadExcetion({
        message: e.message.includes('duplicate key')
          ? `Phòng ${duplicate} bị trùng`
          : e.message,
      });
    } finally {
      await queryRunner.release();
    }
  }

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
    const newImages = images || [];
    if (Array.isArray(files)) newImages.push(...files);
    return newImages;
  }
}
