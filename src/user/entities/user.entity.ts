import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { ERole } from '@/role/enum/roles.enum';
import { AbstractEntity } from '@/base/service/abstract-entity.service';
import { EState } from '@shared/enum/common.enum';
import { Booking } from '@/booking/entities/booking.entity';
import { EGender, EProvider, EStatusCustomer } from '../user.constant';

@Entity()
export class User extends AbstractEntity {
  @Column({ nullable: true })
  username: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  cccd: string;

  @Column({ nullable: true, default: true })
  active: boolean;

  @Column({
    type: 'enum',
    enum: EGender,
    default: EGender.Other,
    nullable: true,
  })
  gender: EGender;

  @Column({ default: true })
  first_login: boolean;

  @Column({ nullable: false, type: 'enum', enum: ERole, default: ERole.User })
  role: ERole;

  @Column({
    nullable: true,
    enum: EProvider,
    type: 'enum',
    default: EProvider.Owner,
  })
  provider: EProvider;

  @Column({
    nullable: true,
    enum: EStatusCustomer,
    type: 'enum',
    default: EStatusCustomer.Checkout,
  })
  status_customer: EStatusCustomer;

  // @ManyToMany(() => Permission, (permission) => permission)
  // @JoinTable()
  // permissions: Permission[];
  @Column({ type: 'enum', enum: EState, default: EState.Active })
  state: EState;

  setPassword(password: string) {
    this.password = bcrypt.hashSync(password, 10);
  }

  comparePassword(rawPassword: string): boolean {
    const userPassword = this.password;
    return bcrypt.compareSync(rawPassword, userPassword);
  }
}
