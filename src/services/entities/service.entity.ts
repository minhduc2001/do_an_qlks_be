import { AbstractEntity } from '@/base/service/abstract-entity.service';
import { Column, Entity, OneToMany } from 'typeorm';
import { UsedService } from './used_service.entity';

@Entity()
export class Service extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({})
  unity: string;

  @Column({ default: 0 })
  price: number;

  @Column({ default: '' })
  description: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => UsedService, (us) => us.service)
  used_services: UsedService[];
}
