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
import {
  EBookingState,
  IResponseVnpay,
  responseCode,
} from './booking.constant';
import { Service } from '@/services/entities/service.entity';
import { UsedService } from '@/services/entities/used_service.entity';
import Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import * as moment from 'moment';
import { Promotion } from '@/promotion/entities/promotion.entity';
import { MailerService } from '@/base/mailer/mailer.service';
import { Bill } from '@/bill/entities/bill.entity';
import { EPaymentFor, EPaymentState, EPaymentType } from '@/bill/bill.constant';
import { ListBookingDto } from './dto/list-booking.dto';
import * as os from 'os';
import * as html_to_pdf from 'html-pdf-node';

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
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(UsedService)
    private readonly usedServiceRepository: Repository<UsedService>,

    private readonly bookedRoomSerivce: BookedRoomService,
    private readonly billService: BillService,
    private dataSource: DataSource,
    private readonly mailerService: MailerService,
  ) {
    super(repository);
  }

  async create(payload: CreateBookingDto, user: User) {
    const { check_in, check_out, type_room_id, quantity, payment_method } =
      payload;

    const { rooms, type_room, promotion } = await this._prepare(
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
    booking.price = type_room.price;
    booking.user = { id: 1 } as User;
    booking.state = EBookingState.Init;

    if (promotion) {
      booking.discount = promotion?.discount ?? 0;
      booking.promotion = promotion;
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      queryRunner.startTransaction();
      await booking.save();
      const amount =
        booking.quantity *
          type_room.price *
          this._daysDiff(check_in, check_out) -
        (booking.quantity *
          type_room.price *
          this._daysDiff(check_in, check_out) *
          booking.discount) /
          100;

      const url = await this.billService.create({
        booking,
        amount,
        payment_type: payment_method,
      });

      for (const room of rooms) {
        await this.roomRepository.update(room.id, { is_booking: true });
        await this.bookedRoomSerivce.create(booking, room);
      }

      const data = {
        amount: amount.toLocaleString(),
        total_amount: amount.toLocaleString(),
        type_room: type_room.name,
        price: type_room.price.toLocaleString(),
        quantity: booking.quantity,
        discount: booking?.discount || 0,
        service: false,
        username: booking.customer.username,
        createdAt: moment().format('hh:mm:ss, DD/MM/YYYY'),
        order_id: booking.id,
      };

      const filepath = path.join(
        process.cwd(),
        'src/base/mailer/templates/invoice.html',
      );

      const file = fs.readFileSync(filepath, 'utf-8');

      const template = Handlebars.compile(file.toString());
      const html = template(data);

      await this.mailerService.sendMail(
        user.email,
        'Bạn có hóa đơn cần thanh toán',
        html,
      );
      await queryRunner.commitTransaction();
      return url;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      booking.state = EBookingState.Reject;
      booking.is_cancel = true;

      await booking.save();
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

    const { rooms, type_room, promotion } = await this._prepare(
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
    booking.price = type_room.price;

    if (promotion) {
      booking.discount = promotion?.discount ?? 0;
      booking.promotion = promotion;
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      queryRunner.startTransaction();
      await booking.save();
      const amount =
        booking.quantity * type_room.price * this._daysDiff(checkin, checkout) -
        (booking.quantity *
          type_room.price *
          this._daysDiff(checkin, checkout) *
          booking.discount) /
          100;

      const url = await this.billService.create({
        booking,
        amount,
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

  async findAll(query: ListBookingDto) {
    const config: PaginateConfig<Booking> = {
      sortableColumns: ['updatedAt'],
      defaultSortBy: [['updatedAt', 'DESC']],
      searchableColumns: [
        'customer.username',
        'customer.email',
        'customer.phone',
        'customer.cccd',
      ],
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

    if (query.startDate && query.endDate) {
      queryB.where('booking.checkin BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

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
          price: service.price,
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
    const booking = await this._prepare_booking_relation(id);

    const is_cms = booking.state === EBookingState.AdminInit;

    if (!booking.is_checked_in)
      throw new BadExcetion({ message: 'Phòng chưa checkin' });

    if (booking.state == EBookingState.Reject)
      throw new BadExcetion({ message: 'Đơn đã bị hủy' });
    booking.is_checked_out = true;
    booking.state = EBookingState.Done;

    await booking.save();

    if (is_cms)
      await Promise.all(
        booking.bills.map((bill) =>
          this.billRepository.update(bill.id, {
            payment_state: EPaymentState.Fulfilled,
            payment_date: new Date(),
          }),
        ),
      );

    if (booking.used_services) {
      const bill = this.billRepository.create();
      bill.payment_for = EPaymentFor.Service;
      bill.amount = booking.used_services
        .map((us) => us.service.price * us.quantity)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      bill.payment_date = new Date();
      bill.payment_type = EPaymentType.Cash;
      bill.booking = booking;
      bill.payment_state = EPaymentState.Fulfilled;

      await bill.save();
    }

    await Promise.all(
      booking.booked_rooms.map((room) => this.checkoutRoom(room.room.id)),
    );

    return true;
  }

  async cancel(id: number) {
    const booking = await this._prepare_booking_relation(id);
    if (booking.state == EBookingState.Done)
      throw new BadExcetion({ message: 'Đơn đã hoàn thành' });

    if (booking.is_checked_in)
      throw new BadExcetion({ message: 'Phòng đang được sử dụng' });

    booking.state = EBookingState.Reject;
    booking.is_cancel = true;
    await booking.save();

    await Promise.all(
      booking.booked_rooms.map((room) => this.checkoutRoom(room.room.id)),
    );

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
          .where('room.type_room_id = :id', { id: type_room.id })
          .andWhere('room.is_booking = :is_booking', { is_booking: false })
          .getCount();

        const c1 = await this.roomRepository
          .createQueryBuilder('room')
          .leftJoinAndSelect('room.booked_rooms', 'br')
          .leftJoinAndSelect('br.booking', 'booking')
          .where('room.type_room_id = :id', { id: type_room.id })
          .andWhere('room.is_booking = :is_booking', { is_booking: true })
          .andWhere('booking.is_checked_out = :is_checked_out', {
            is_checked_out: false,
          })
          .andWhere('booking.is_cancel = :is_cancel', {
            is_cancel: false,
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

  async export(id: number) {
    const booking: Booking = await this.repository
      .createQueryBuilder('bk')
      .leftJoinAndSelect('bk.booked_rooms', 'br')
      .leftJoinAndSelect('br.room', 'room')
      .leftJoinAndSelect('room.type_room', 'tr')
      .leftJoinAndSelect('bk.customer', 'customer')
      .leftJoinAndSelect('bk.user', 'user')
      .leftJoinAndSelect('bk.used_services', 'us')
      .leftJoinAndSelect('us.service', 'service')
      .where('bk.id = :id', { id })
      .getOne();

    const room = booking.booked_rooms[0].room;
    const services = booking.used_services.map((us) => ({
      ...us,
      price: us.service.price,
    }));

    const filepath = path.join(
      process.cwd(),
      'src/base/mailer/templates/invoice.html',
    );

    const amount =
      booking.booked_rooms.length * room.type_room.price -
      (booking.booked_rooms.length * room.type_room.price * booking.discount) /
        100;
    let amount_service = 0;
    for (const service of services) {
      amount_service += service.price * service.quantity;
    }

    const data = {
      amount: amount.toLocaleString(),
      services: services.map((service) => ({
        ...service,
        price: service.price.toLocaleString(),
        amount: (service.price * service.quantity).toLocaleString(),
        createdAt: moment(service.createdAt).format('hh:mm:ss, DD/MM/YYYY'),
      })),
      total_amount: (amount + amount_service).toLocaleString(),
      type_room: room.type_room.name,
      price: room.type_room.price.toLocaleString(),
      quantity: booking.booked_rooms.length,
      discount: booking?.discount || 0,
      service: services.length > 0,
      username: booking.customer.username,
      createdAt: moment().format('hh:mm:ss, DD/MM/YYYY'),
      order_id: booking.id,
    };

    const file = fs.readFileSync(filepath, 'utf-8');

    const template = Handlebars.compile(file.toString());
    const html = template(data);
    return this.generatePdf(html);
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
      .where('room.type_room_id = :id', { id: type_room.id })
      .andWhere('room.is_booking = :is_booking', { is_booking: false })
      .getManyAndCount();

    if (count < quantity) {
      const [rooms1, count1] = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.booked_rooms', 'br')
        .leftJoinAndSelect('br.booking', 'booking')
        .where('room.type_room_id = :id', { id: type_room.id })
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
        message: `Chỉ còn ${count} phòng trống trong thời gian ${moment(
          check_in,
        ).format('DD/MM/YYYY')} đến ${moment(check_out).format('DD/MM/YYYY')}`,
      });
    }

    let promotion: Promotion = await this.promotionRepository
      .createQueryBuilder('promotion')
      .where(':check_in BETWEEN start_date AND end_date', { check_in })
      .getOne();

    if (promotion && type_room.price * quantity < promotion.condition)
      promotion = null;
    return { rooms: rooms.slice(0, quantity), type_room, promotion };
  }

  async response_vnpay(payload: IResponseVnpay) {
    const bill = await this.billRepository.findOne({
      where: { order_id: payload.vnp_TxnRef },
      relations: { booking: true },
    });
    if (payload.vnp_ResponseCode == '00') {
      bill.payment_state = EPaymentState.Fulfilled;
      bill.payment_date = new Date();
      await bill.save();

      await this.repository.update(bill.booking.id, {
        state: EBookingState.Success,
      });

      return true;
    }

    if (bill.booking.is_checked_in) return false;
    bill.payment_state = EPaymentState.Reject;
    await bill.save();

    await this.repository.update(bill.booking.id, {
      state: EBookingState.Reject,
    });

    return false;
  }

  async _prepare_add_room(id: number, payloads?: AddServiceDto[]) {
    const booking = await this.repository.findOne({ where: { id } });
    if (!booking) throw new BadExcetion({ message: 'Không tồn tại đơn này' });

    const services = [];
    if (payloads?.length)
      for (const payload of payloads) {
        const service = await this.serviceRepository.findOne({
          where: { id: payload.service_id },
        });

        if (!service)
          throw new BadExcetion({ message: 'Không tồn tại dịch vụ này' });
        services.push({ ...service, quantity_used: payload.quantity });
      }

    return { booking, services };
  }

  async _prepare_booking_relation(id: number) {
    const booking: Booking = await this.repository
      .createQueryBuilder('bk')
      .leftJoinAndSelect('bk.booked_rooms', 'br')
      .leftJoinAndSelect('br.room', 'room')
      .leftJoinAndSelect('bk.bills', 'bill')
      .leftJoinAndSelect('bk.used_services', 'us')
      .leftJoinAndSelect('us.service', 'service')
      .where('bk.id = :id', { id })
      .getOne();

    if (!booking) throw new BadExcetion({ message: 'Không tồn tại đơn này' });

    return booking;
  }

  async generatePdf(html: string) {
    const browser = await puppeteer.launch(this.fixOs());
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
  }

  private async checkoutRoom(room_id: number) {
    const room_booking = await this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.booked_rooms', 'bk')
      .leftJoinAndSelect('bk.room', 'room')
      .where('booking.is_checked_out = false')
      .andWhere('booking.is_cancel = false')
      .andWhere('room.id = :room_id', { room_id })
      .getOne();

    if (room_booking) return;

    const room = await this.roomRepository.findOne({ where: { id: room_id } });
    return this.roomRepository.update(room.id, { is_booking: false });
  }

  private _daysDiff(d1: Date, d2: Date) {
    const date1: Date = new Date(d1);
    const date2: Date = new Date(d2);

    // Tính số mili giây giữa hai ngày
    const timeDiff: number = Math.abs(date2.getTime() - date1.getTime());

    // Chuyển đổi từ mili giây sang số ngày
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  fixOs() {
    const osPlatform = os.platform();
    console.log('Scraper running on platform: ', osPlatform);

    if (/^win/i.test(osPlatform)) {
      return {
        executablePath:
          'C:\\Users\\ADMIN\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
        userDataDir:
          'C:\\Users\\ADMIN\\AppData\\Local\\Google\\Chrome\\User Data\\Default',
        ignoreDefaultArgs: ['--disable-extensions'],
      };
    } else if (/^linux/i.test(osPlatform)) {
      return {};
    }
  }
}
