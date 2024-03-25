import { Booking } from '@/booking/entities/booking.entity';
import { Room } from '@/room/entities/room.entity';
import { TypeRoom } from '@/room/entities/type_room.entity';
import { Service } from '@/services/entities/service.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import * as excel4node from 'excel4node';
import { EBookingState } from '@/booking/booking.constant';

@Injectable()
export class StatsService implements OnModuleInit {
  constructor(
    @InjectRepository(Booking)
    protected readonly repository: Repository<Booking>,
  ) {}

  onModuleInit() {}

  async statsByRevenue() {
    await this.serviceStats();
  }

  async serviceStats(start_date?: Date, end_date?: Date) {
    const serviceStats = await getManager()
      .createQueryBuilder()
      .select('service.name', 'serviceName')
      .addSelect(
        'SUM(usedService.price * usedService.quantity)',
        'totalRevenue',
      )
      .addSelect('SUM(usedService.quantity)', 'totalUsage')
      .from('Service', 'service')
      .leftJoin('service.used_services', 'usedService')
      .innerJoin(
        'usedService.booking',
        'booking',
        'booking.is_checked_out = :isCheckedOut',
        { isCheckedOut: true },
      )
      .groupBy('service.name')
      .getRawMany();

    console.log(serviceStats);
  }
}
