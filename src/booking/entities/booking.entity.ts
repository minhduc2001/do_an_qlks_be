import { AbstractEntity } from '@/base/service/abstract-entity.service';
import { UsedService } from '@/services/entities/used_service.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { EBookingState } from '../booking.constant';
import { User } from '@/user/entities/user.entity';
import { Bill } from '@/bill/entities/bill.entity';
import { Room } from '@/room/entities/room.entity';
import { BookedRoom } from './booked_room.entity';
import { Promotion } from '@/promotion/entities/promotion.entity';

@Entity()
export class Booking extends AbstractEntity {
  @Column({ default: 0 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: EBookingState,
    default: EBookingState.AdminInit,
  })
  state: EBookingState;

  @Column()
  checkin: Date;

  @Column()
  checkout: Date;

  @Column({ nullable: true, default: 0 })
  price: number;

  @Column({ nullable: true, default: 0 })
  quantity: number;

  @Column({ nullable: true, default: 0 })
  discount: number;

  @Column({ default: false })
  is_checked_in: boolean;

  @Column({ default: false })
  is_checked_out: boolean;

  @Column({ default: false })
  is_cancel: boolean;

  @OneToMany(() => BookedRoom, (br) => br.booking)
  booked_rooms: BookedRoom[];

  @OneToMany(() => UsedService, (us) => us.booking)
  @JoinColumn()
  used_services: UsedService[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @OneToMany(() => Bill, (bill) => bill.booking)
  @JoinColumn()
  bills: Bill[];

  @OneToOne(() => Promotion)
  @JoinColumn()
  promotion: Promotion;
}
