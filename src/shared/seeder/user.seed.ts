import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { EState } from '@shared/enum/common.enum';
import { User } from '@/user/entities/user.entity';
import { Permission } from '@/role/entities/permission.entity';
import { ERole } from '@/role/enum/roles.enum';

const permissionGroup = [1];
const data = [
  {
    username: 'Admin',
    email: 'admin@hotel.com',
    password: '$2b$10$VU9fAWrF61xLIUkJKf5vBuBCh4RzdCFNekqLppKhk01/WwTx3BBFK',
    state: EState.Active,
    role: ERole.Admin,
  },
  {
    username: 'Receptionist',
    email: 're@hotel.com',
    password: '$2b$10$VU9fAWrF61xLIUkJKf5vBuBCh4RzdCFNekqLppKhk01/WwTx3BBFK',
    state: EState.Active,
    role: ERole.Receptionist,
  },
  {
    username: 'Accountant',
    email: 'ac@hotel.com',
    password: '$2b$10$VU9fAWrF61xLIUkJKf5vBuBCh4RzdCFNekqLppKhk01/WwTx3BBFK',
    state: EState.Active,
    role: ERole.Accountant,
  },
];
@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(User)
    protected readonly repository: Repository<User>,
    @InjectRepository(Permission)
    protected readonly permissionRepository: Repository<Permission>,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (!count) {
      for (const user of data) {
        const permissions: Permission[] = await this.permissionRepository.find({
          where: { id: 1 },
        });

        await this.repository.save({
          ...user,
          permissions: permissions,
        });
      }
    }
  }
}
