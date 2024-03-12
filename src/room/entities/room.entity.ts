import { AbstractEntity } from '@/base/service/abstract-entity.service';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { TypeRoom } from './type_room.entity';

import { Booking } from '@/booking/entities/booking.entity';

@Entity()
export class Room extends AbstractEntity {
  @Column()
  name: string;

  @Column({ default: false })
  is_booking: boolean;

  @ManyToOne(() => TypeRoom, (tr) => tr.rooms)
  type_room: TypeRoom;

  @ManyToMany(() => Booking, (booking) => booking.rooms)
  bookings: Booking[];
}
