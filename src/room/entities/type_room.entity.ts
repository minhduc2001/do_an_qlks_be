import { AbstractEntity } from '@/base/service/abstract-entity.service';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { FeatureRoom } from './feature_room.entity';
import { Room } from './room.entity';

@Entity()
export class TypeRoom extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  parent: number;

  @Column({ nullable: true })
  contains: string;

  @Column({ nullable: true })
  area: number;

  @Column({ nullable: true })
  type_bed: string;

  @Column({ nullable: true })
  checkin: string;

  @Column({ nullable: true })
  checkout: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @ManyToMany(() => FeatureRoom, (fr) => fr.type_rooms)
  @JoinTable()
  feature_rooms: FeatureRoom[];

  @OneToMany(() => Room, (room) => room.type_room)
  rooms: Room[];
}
