import { Room } from '@/room/entities/room.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity()
export class BookedRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (r) => r.booked_rooms)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Booking, (b) => b.booked_rooms)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
