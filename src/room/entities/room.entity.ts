import { AbstractEntity } from '@/base/service/abstract-entity.service';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TypeRoom } from './type_room.entity';

import { Booking } from '@/booking/entities/booking.entity';
import { BookedRoom } from '@/booking/entities/booked_room.entity';

@Entity()
export class Room extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  is_booking: boolean;

  @ManyToOne(() => TypeRoom, (tr) => tr.rooms)
  @JoinColumn({ name: 'type_room_id' })
  type_room: TypeRoom;

  @OneToMany(() => BookedRoom, (br) => br.room)
  booked_rooms: BookedRoom[];
}
