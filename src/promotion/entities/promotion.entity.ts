import { AbstractEntity } from '@/base/service/abstract-entity.service';
import { EState } from '@/shared/enum/common.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class Promotion extends AbstractEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true, default: 0 })
  condition: number;

  @Column({ default: new Date() })
  start_date: Date;

  @Column({ default: new Date() })
  end_date: Date;

  @Column({ default: 0 })
  discount: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: true, nullable: true })
  active: boolean;

  @Column({ type: 'enum', enum: EState, default: EState.Active })
  state: EState;
}
