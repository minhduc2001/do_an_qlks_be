import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  CmsCreateBookingDto,
  CreateBookingDto,
} from './dto/create-booking.dto';
import { AddServiceDto, UpdateBookingDto } from './dto/update-booking.dto';
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
import { EProvider } from '@/user/user.constant';
import { EBookingState } from './booking.constant';
import { Service } from '@/services/entities/service.entity';
import { UsedService } from '@/services/entities/used_service.entity';

@Injectable()
export class BookingService extends BaseService<Booking> {
  constructor(
    @InjectRepository(Booking)
    protected readonly repository: Repository<Booking>,

    @InjectRepository(TypeRoom)
    private readonly typeRoomRepository: Repository<TypeRoom>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(UsedService)
    private readonly usedServiceRepository: Repository<UsedService>,

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
    booking.user = { id: 1 } as User;

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      queryRunner.startTransaction();
      await booking.save();
      const url = await this.billService.create({
        booking,
        amount: quantity * type_room.price,
        payment_type: payment_method,
      });

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
  async cmsCreate(payload: CmsCreateBookingDto, user: User) {
    const {
      checkin,
      checkout,
      type_room_id,
      quantity,
      payment_type,
      username,
      email,
      id,
      cccd,
      phone,
      gender,
      address,
    } = payload;

    const { rooms, type_room } = await this._prepare(
      type_room_id,
      quantity,
      checkin,
      checkout,
    );

    let customer: User = null;

    if (id) {
      customer = await this.userRepository.findOne({ where: { id } });
    }

    if (!customer) {
      customer = this.userRepository.create();
      customer.email = email;
      customer.cccd = cccd;
      customer.username = username;
      customer.phone = phone;
      customer.gender = gender;
      customer.address = address;
      customer.provider = EProvider.System;

      await this.userRepository.save(customer);
    }

    const booking = this.repository.create();
    booking.checkin = checkin;
    booking.checkout = checkout;
    booking.user = user;
    booking.quantity = quantity;
    booking.customer = customer;
    booking.state = EBookingState.AdminInit;

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      queryRunner.startTransaction();
      await booking.save();
      const url = await this.billService.create({
        booking,
        amount: quantity * type_room.price,
        payment_type: payment_type,
      });

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
      defaultSortBy: [['updatedAt', 'DESC']],
    };

    const queryB = this.repository
      .createQueryBuilder('bk')
      .leftJoinAndSelect('bk.booked_rooms', 'br')
      .leftJoinAndSelect('br.room', 'room')
      .leftJoinAndSelect('room.type_room', 'tr')
      .leftJoinAndSelect('bk.customer', 'customer')
      .leftJoinAndSelect('bk.user', 'user')
      .leftJoinAndSelect('bk.used_services', 'us')
      .leftJoinAndSelect('us.service', 'service');

    return this.listWithPage(query, config, queryB);
  }

  async findOne(id: number) {
    const booking = await this.repository.findOne({ where: { id } });

    if (!booking) throw new BadExcetion({ message: 'Không tồn tại đơn này' });
  }

  async update(id: number, payload: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  async addService(id: number, payload: AddServiceDto[]) {
    const { booking, services } = await this._prepare_add_room(id, payload);

    await Promise.all(
      services.map((service) => {
        this.usedServiceRepository.save({
          booking,
          service,
          quantity: service.quantity_used,
          name: service.name,
        });
      }),
    );
    return true;
  }

  async checkin(id: number) {
    const { booking } = await this._prepare_add_room(id);
    if (booking.state == EBookingState.Done)
      throw new BadExcetion({ message: 'Đơn đã hoàn thành' });

    if (booking.state == EBookingState.Reject)
      throw new BadExcetion({ message: 'Đơn đã bị hủy' });

    booking.is_checked_in = true;

    await booking.save();
    return true;
  }

  async checkout(id: number) {
    const { booking } = await this._prepare_add_room(id);
    if (!booking.is_checked_in)
      throw new BadExcetion({ message: 'Phòng chưa checkin' });

    if (booking.state == EBookingState.Reject)
      throw new BadExcetion({ message: 'Đơn đã bị hủy' });
    booking.is_checked_out = true;
    booking.state = EBookingState.Done;

    await booking.save();
    return true;
  }

  async cancel(id: number) {
    const { booking } = await this._prepare_add_room(id);
    if (booking.state == EBookingState.Done)
      throw new BadExcetion({ message: 'Đơn đã hoàn thành' });

    if (booking.is_checked_in)
      throw new BadExcetion({ message: 'Phòng đang được sử dụng' });

    booking.state = EBookingState.Reject;
    booking.is_cancel = true;
    await booking.save();
    return true;
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

  async _prepare_add_room(id: number, payloads?: AddServiceDto[]) {
    const booking = await this.repository.findOne({ where: { id } });
    if (!booking) throw new BadExcetion({ message: 'Không tồn tại đơn này' });

    const services = [];
    if (payloads)
      for (const payload of payloads) {
        const service = await this.serviceRepository.findOne({
          where: { id: payload.serivce_id },
        });

        if (!service)
          throw new BadExcetion({ message: 'Không tồn tại dịch vụ này' });
        services.push({ ...service, quantity_used: payload.quantity });
      }

    return { booking, services };
  }
}
