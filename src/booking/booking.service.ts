import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BaseService } from '@/base/service/base.service';
import { Booking } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { ListDto } from '@/shared/dtos/common.dto';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { BadExcetion } from '@/base/api/exception.reslover';
import { User } from '@/user/entities/user.entity';
import { TypeRoom } from '@/room/entities/type_room.entity';
import { Room } from '@/room/entities/room.entity';
import { BillService } from '@/bill/bill.service';
import { BookedRoom } from './entities/booked_room.entity';
import { BookedRoomService } from './booked_room.service';
import { CheckRoomExitsDto } from './dto/check-room-exsits.dto';

@Injectable()
export class BookingService extends BaseService<Booking> {
  constructor(
    @InjectRepository(Booking)
    protected readonly repository: Repository<Booking>,

    @InjectRepository(TypeRoom)
    private readonly typeRoomRepository: Repository<TypeRoom>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(BookedRoom)
    private readonly bookedRoomRepository: Repository<BookedRoom>,
    private readonly bookedRoomSerivce: BookedRoomService,
    private readonly billService: BillService,
    private dataSource: DataSource,
  ) {
    super(repository);
  }

  async create(payload: CreateBookingDto, user: User) {
    const { check_in, check_out, type_room_id, quantity, payment_method } =
      payload;

    const { rooms, type_room } = await this._prepare(
      type_room_id,
      quantity,
      check_in,
      check_out,
    );

    const booking = this.repository.create();
    booking.checkin = check_in;
    booking.checkout = check_out;
    booking.customer = user;
    booking.quantity = quantity;

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      queryRunner.startTransaction();

      const url = await this.billService.create({
        booking,
        amount: quantity * type_room.price,
        payment_type: payment_method,
      });
      await booking.save();

      for (const room of rooms) {
        await this.roomRepository.update(room.id, { is_booking: true });
        await this.bookedRoomSerivce.create(booking, room);
      }
      await queryRunner.commitTransaction();
      return url;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadExcetion({ message: e.message });
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: ListDto) {
    const config: PaginateConfig<Booking> = {
      sortableColumns: ['updatedAt'],
    };
    return this.listWithPage(query, config);
  }

  async findOne(id: number) {
    const booking = await this.repository.findOne({ where: { id } });

    if (!booking) throw new BadExcetion({ message: 'Không tồn tại đơn này' });
  }

  async update(id: number, payload: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  async remove(id: number) {
    return `This action removes a #${id} booking`;
  }

  async checkRoomExits(payload: CheckRoomExitsDto) {
    const { check_in, check_out } = payload;
    const type_rooms = await this.typeRoomRepository.find();

    return Promise.all(
      type_rooms.map(async (type_room) => {
        let c = await this.roomRepository
          .createQueryBuilder('room')
          .where('room.typeRoomId = :id', { id: type_room.id })
          .andWhere('room.is_booking = :is_booking', { is_booking: false })
          .getCount();

        const c1 = await this.roomRepository
          .createQueryBuilder('room')
          .leftJoinAndSelect('room.booked_rooms', 'br')
          .leftJoinAndSelect('br.booking', 'booking')
          .where('room.typeRoomId = :id', { id: type_room.id })
          .andWhere('room.is_booking = :is_booking', { is_booking: true })
          .andWhere('booking.is_checked_out = :is_checked_out', {
            is_checked_out: false,
          })
          .andWhere(
            new Brackets((qb) => {
              qb.orWhere(':check_in > checkout', {
                check_in,
              }).orWhere(':check_out < checkin', { check_out });
            }),
          )
          .getCount();

        c += c1;

        if (c > 0) return { type_room, c };
      }),
    );
  }

  async _prepare(
    type_room_id: number,
    quantity: number,
    check_in: Date,
    check_out: Date,
  ) {
    const type_room = await this.typeRoomRepository.findOne({
      where: { id: type_room_id },
    });

    let [rooms, count]: [Room[], number] = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.typeRoomId = :id', { id: type_room.id })
      .andWhere('room.is_booking = :is_booking', { is_booking: false })
      .getManyAndCount();

    if (count < quantity) {
      const [rooms1, count1] = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.booked_rooms', 'br')
        .leftJoinAndSelect('br.booking', 'booking')
        .where('room.typeRoomId = :id', { id: type_room.id })
        .andWhere('room.is_booking = :is_booking', { is_booking: true })
        .andWhere('booking.is_checked_out = :is_checked_out', {
          is_checked_out: false,
        })
        .andWhere(
          new Brackets((qb) => {
            qb.orWhere(':check_in > checkout', {
              check_in,
            }).orWhere(':check_out < checkin', { check_out });
          }),
        )
        .getManyAndCount();

      count += count1;
      rooms.push(...rooms1);
    }

    if (count < quantity) {
      throw new BadExcetion({
        message: `Chỉ còn ${count} phòng trống trong thời gian ${check_in} đến ${check_out}`,
      });
    }

    return { rooms: rooms.slice(0, quantity), type_room };
  }
}
