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

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, TypeRoom, Room, Bill, BookedRoom]),
    BillModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookedRoomService],
})
export class BookingModule {}
