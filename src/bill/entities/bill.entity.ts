import { AbstractEntity } from '@/base/service/abstract-entity.service';
import { Column, Entity, ManyToOne } from 'typeorm';
import { EPaymentFor, EPaymentState, EPaymentType } from '../bill.constant';
import { Booking } from '@/booking/entities/booking.entity';

@Entity()
export class Bill extends AbstractEntity {
  @Column({ default: 0 })
  amount: number;

  @Column({ nullable: true })
  order_id: string;

  @Column({ type: 'enum', enum: EPaymentType, default: EPaymentType.Cash })
  payment_type: EPaymentType;

  @Column({ type: 'enum', enum: EPaymentState, default: EPaymentState.Pending })
  payment_state: EPaymentState;

  @Column({ type: 'enum', enum: EPaymentFor, default: EPaymentFor.Room })
  payment_for: EPaymentFor;

  @Column({ default: new Date() })
  payment_date: Date;

  @ManyToOne(() => Booking, (booking) => booking.bills)
  booking: Booking;
}
