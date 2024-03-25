import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { VnpayService } from './vn-pay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { StatsService } from './stats.service';
import { Booking } from '@/booking/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, Booking])],
  controllers: [BillController],
  providers: [BillService, VnpayService, StatsService],
  exports: [BillService, VnpayService],
})
export class BillModule {}
