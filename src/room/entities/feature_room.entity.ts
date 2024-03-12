import {
  Column,
  Entity,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypeRoom } from './type_room.entity';

@Entity()
export class FeatureRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => TypeRoom, (tr) => tr.feature_rooms)
  type_rooms: TypeRoom[];
}
