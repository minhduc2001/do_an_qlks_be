import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BookedRoom } from './entities/booked_room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@/base/service/base.service';
import { Booking } from './entities/booking.entity';
import { Room } from '@/room/entities/room.entity';

@Injectable()
export class BookedRoomService extends BaseService<BookedRoom> {
  constructor(
    @InjectRepository(BookedRoom)
    protected readonly repository: Repository<BookedRoom>,
  ) {
    super(repository);
  }

  async create(booking: Booking, room: Room) {
    return this.repository.save({ booking, room });
  }
}
