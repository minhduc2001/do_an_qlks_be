import { Booking } from '@/booking/entities/booking.entity';
import { Room } from '@/room/entities/room.entity';
import { TypeRoom } from '@/room/entities/type_room.entity';
import { Service } from '@/services/entities/service.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EBookingState } from '@/booking/booking.constant';
import * as moment from 'moment';
import { Renderer } from 'xlsx-renderer';
import { BadExcetion } from '@/base/api/exception.reslover';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Booking)
    protected readonly repository: Repository<Booking>,
    @InjectRepository(Service)
    protected readonly serviceRepository: Repository<Service>,
    @InjectRepository(TypeRoom)
    protected readonly typeRoomRepository: Repository<TypeRoom>,
  ) {}

  async serviceStats(startDate: string, endDate: string) {
    const [services, service_bookings] = await Promise.all([
      this.serviceRepository.find(),
      this.repository
        .createQueryBuilder('booking')
        .innerJoin('booking.used_services', 'usedService')
        .innerJoin('usedService.service', 'service')
        .where('booking.state = :bookingStates', {
          bookingStates: EBookingState.Done,
        })
        .andWhere('DATE(booking.checkin) BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })
        .select('service.id', 'serviceId')
        .addSelect('usedService.name', 'serviceName')
        .addSelect(
          'SUM(usedService.price * usedService.quantity)',
          'totalRevenue',
        )
        .addSelect('SUM(usedService.quantity)', 'totalQuantity')
        .groupBy(
          'service.id, usedService.name,  usedService.price, usedService.quantity',
        )
        .getRawMany(),
    ]);

    const response: { name: string; value: number; quantity: number }[] = [];

    for (const service of services) {
      const data = { name: service.name, value: 0, quantity: 0 };
      for (const service_booking of service_bookings) {
        if (service.id === service_booking.serviceId) {
          data.value = Number(service_booking.totalRevenue);
          data.quantity = Number(service_booking.totalQuantity);
          break;
        }
      }
      response.push(data);
    }

    return response;
  }

  async roomStats(startDate: string, endDate: string) {
    const [type_rooms, room_bookings] = await Promise.all([
      this.typeRoomRepository.find(),
      this.repository
        .createQueryBuilder('booking')
        .innerJoin('booking.booked_rooms', 'bookedRoom')
        .innerJoin('bookedRoom.room', 'room')
        .innerJoin('room.type_room', 'typeRoom')
        .where('booking.state = :bookingStates', {
          bookingStates: EBookingState.Done,
        })
        .andWhere('DATE(booking.checkin) BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })
        .select('typeRoom.id', 'typeRoomId')
        .addSelect('typeRoom.name', 'typeRoomName')
        .addSelect(
          'SUM(booking.price * booking.quantity - (booking.price * booking.quantity * booking.discount / 100))',
          'totalRevenue',
        )
        .addSelect('SUM(booking.quantity)', 'totalQuantity')
        .groupBy('bookedRoom.id, typeRoom.id,  typeRoom.name')
        .getRawMany(),
    ]);

    const response: { name: string; value: number; quantity: number }[] = [];

    for (const type_room of type_rooms) {
      const data = { name: type_room.name, value: 0, quantity: 0 };
      for (const room_booking of room_bookings) {
        if (type_room.id === room_booking.typeRoomId) {
          data.value = Number(room_booking.totalRevenue);
          data.quantity = Number(room_booking.totalQuantity);
          break;
        }
      }
      response.push(data);
    }

    return response;
  }

  async revenueStats(year: number) {
    const months = Array.from({ length: 12 }, (_, index) => index + 1);
    const response: { type: string; value: number }[] = [];

    for (const month of months) {
      const prepare = { type: month.toString(), value: 0 };
      const data = await this.repository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.used_services', 'usedService')
        .where("date_part('year', booking.checkin) = :year", { year })
        .andWhere("date_part('month', booking.checkin) = :month", { month })
        .andWhere('booking.state = :state', { state: EBookingState.Done })
        .select("date_part('month', booking.checkin)", 'month')
        .addSelect(
          'SUM(booking.price * booking.quantity - (booking.price * booking.quantity * booking.discount / 100) + usedService.quantity * usedService.price)',
          'totalRevenue',
        )
        .groupBy("date_part('month', booking.checkin)")
        .getRawMany();

      if (data[0]?.month) prepare.value = Number(data[0].totalRevenue);

      response.push(prepare);
    }
    return response.sort((a, b) => Number(a.type) - Number(b.type));
  }

  async exportRoom(startDate: string, endDate: string, user: User) {
    const type_rooms = await this.roomStats(startDate, endDate);

    const viewModel = {
      username: user.username,
      today: moment().format('hh:mm:ss, DD/MM/YYYY'),
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      start_date: moment(startDate).format('DD/MM/YYYY'),
      end_date: moment(endDate).format('DD/MM/YYYY'),
      rooms: type_rooms.map((type_room, index) => ({
        stt: index + 1,
        ...type_room,
        price:
          (type_room.value / type_room.quantity || 0).toLocaleString() + ' đ',
        total_amount: type_room.value.toLocaleString() + ' đ',
      })),
      total:
        type_rooms
          .map((service) => service.value)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
          .toLocaleString() + ' đ',
    };

    const renderer = new Renderer();

    const result = await renderer.renderFromFile(
      './export-room.xlsx',
      viewModel,
    );
    return result.xlsx.writeBuffer();
  }

  async exportService(startDate: string, endDate: string, user: User) {
    const services = await this.serviceStats(startDate, endDate);

    const viewModel = {
      username: user.username,
      today: moment().format('hh:mm:ss, DD/MM/YYYY'),
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      start_date: moment(startDate).format('DD/MM/YYYY'),
      end_date: moment(endDate).format('DD/MM/YYYY'),
      services: services.map((service, index) => ({
        id: index + 1,
        ...service,
        price: (service.value / service.quantity || 0).toLocaleString() + ' đ',
        total_amount: service.value.toLocaleString() + ' đ',
      })),
      total:
        services
          .map((service) => service.value)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
          .toLocaleString() + ' đ',
    };

    const renderer = new Renderer();

    const result = await renderer.renderFromFile(
      './export-service.xlsx',
      viewModel,
    );
    return result.xlsx.writeBuffer();
  }

  async exportRevenue(year: number, user: User) {
    const months = await this.revenueStats(year);

    const viewModel = {
      username: user.username,
      today: moment().format('hh:mm:ss, DD/MM/YYYY'),
      day: new Date().getDay(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      year_stats: year,
    };

    let total = 0;
    for (const month of months) {
      viewModel[`m${month.type}`] = month.value.toLocaleString() + ' đ';
      total += month.value;
    }

    viewModel['total'] = total.toLocaleString() + ' đ';

    const renderer = new Renderer();

    const result = await renderer.renderFromFile(
      './export-revenue.xlsx',
      viewModel,
    );
    return result.xlsx.writeBuffer();
  }

  async exportExcel(startDate: string, endDate: string, user: User) {
    const datas = await this.caculateBooking(startDate, endDate);

    if (!datas?.length || datas.length == 0)
      throw new BadExcetion({
        message: 'Không có thống kê trong khoảng thời gian này',
      });

    const viewModel = {
      username: user.username,
      today: moment().format('hh:mm:ss, DD/MM/YYYY'),
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      start_date: moment(startDate).format('DD/MM/YYYY'),
      end_date: moment(endDate).format('DD/MM/YYYY'),
      bookings: datas.map((data, index) => ({
        stt: index + 1,
        ...data,
        total_amount: data.total_amount.toLocaleString() + ' đ',
      })),
      total: datas
        .map((data) => data.total_amount)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        .toLocaleString(),
    };

    const renderer = new Renderer();

    const result = await renderer.renderFromFile(
      './export-booking.xlsx',
      viewModel,
    );
    return result.xlsx.writeBuffer();
  }

  async revenueStatsBooking(startDate: string, endDate: string) {
    const dates = this._getDates(startDate, endDate);

    const response: { name: string; value: number }[] = [];

    for (const date of dates) {
      const count = await this.repository
        .createQueryBuilder('booking')
        .where('DATE(booking.checkout) = :date', { date: new Date(date) })
        .andWhere('booking.state = :state', { state: EBookingState.Done })
        .getCount();

      response.push({ name: moment(date).format('DD/MM/YYYY'), value: count });
    }

    return response;
  }

  async caculateBooking(startDate: string, endDate: string) {
    const datas = await this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.used_services', 'usedService')
      .leftJoinAndSelect('booking.booked_rooms', 'bk')
      .leftJoinAndSelect('bk.room', 'room')
      .leftJoinAndSelect('room.type_room', 'type_room')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.user', 'user')
      .where('DATE(booking.checkin) BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .andWhere('booking.state = :state', { state: EBookingState.Done })
      .getMany();

    return datas.map((data) => ({
      order_id: data.id,
      // staff: data.user.username,
      customer: data.customer.username,
      // email: data.customer.email,
      // cccd: data.customer.cccd,
      // phone: data.customer.phone,
      checkin: moment(data.checkin).format('DD/MM/YYYY'),
      checkout: moment(data.checkout).format('DD/MM/YYYY'),
      // type_room: data.booked_rooms[0].room.type_room.name,
      // price: data.price,
      // quantity: data.quantity,
      // discount: data.discount,
      total_amount:
        data.price * data.quantity -
        (data.price * data.quantity * data.discount) / 100 +
        data.used_services
          .map((us) => us.quantity * us.price)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0),
    }));
  }

  private _getDates(startDate: string, endDate: string) {
    let dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  }
}

// const revenueByMonth = await this.repository.query(
//   `
//   SELECT
//   months.month,
//   COALESCE(SUM(b.total_amount), 0) AS totalRevenue
// FROM
//   (
//     SELECT generate_series(1, 12) AS month
//   ) AS months
// LEFT JOIN
//   (
//     SELECT
//       EXTRACT(MONTH FROM booking.checkin) AS month,
//       (COALESCE(COALESCE(SUM(typeRoom.price), 0) * COUNT(bookedRooms.id) - COALESCE(SUM(typeRoom.price), 0) * COUNT(bookedRooms.id) * booking.discount, 0)) AS total_amount
//     FROM
//       booking
//       LEFT JOIN
//         booked_room AS bookedRooms ON booking.id = bookedRooms.booking_id
//       LEFT JOIN
//         room AS rooms ON bookedRooms.room_id = rooms.id
//       LEFT JOIN
//         type_room AS typeRoom ON rooms.type_room_id = typeRoom.id
//     WHERE
//       EXTRACT(YEAR FROM booking.checkin) = $1
//       AND state = $2
//     GROUP BY
//     typeRoom.id, EXTRACT(MONTH FROM booking.checkin), booking.discount
//   ) AS b
// ON
//   months.month = b.month
// GROUP BY
//   months.month
// ORDER BY
//   months.month
// `,
//   [year, EBookingState.Done],
// );
// COALESCE(COALESCE(SUM(typeRoom.price), 0) * COUNT(bookedRooms.id) - COALESCE(SUM(typeRoom.price), 0) * COUNT(bookedRooms.id) * booking.discount, 0)
