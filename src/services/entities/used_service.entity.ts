import { AbstractEntity } from '@/base/service/abstract-entity.service';
import { Booking } from '@/booking/entities/booking.entity';
import { Service } from '@/services/entities/service.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class UsedService extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @ManyToOne(() => Service, (service) => service.used_services)
  @JoinColumn()
  service: Service;

  @ManyToOne(() => Booking, (booking) => booking.used_services)
  booking: Booking;
}
