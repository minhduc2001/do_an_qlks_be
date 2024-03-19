import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { TypeRoom } from '@/room/entities/type_room.entity';
import { Room } from '@/room/entities/room.entity';
import { Bill } from '@/bill/entities/bill.entity';
import { BillModule } from '@/bill/bill.module';
import { BookedRoom } from './entities/booked_room.entity';
import { BookedRoomService } from './booked_room.service';
import { User } from '@/user/entities/user.entity';
import { Service } from '@/services/entities/service.entity';
import { UsedService } from '@/services/entities/used_service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      TypeRoom,
      Room,
      Bill,
      BookedRoom,
      User,
      Service,
      UsedService,
    ]),
    BillModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookedRoomService],
})
export class BookingModule {}
