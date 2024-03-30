import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

// BASE
import * as exc from '@/base/api/exception.reslover';
import { LoggerService } from '@base/logger';
import { BaseService } from '@/base/service/base.service';

// APPS
import { User } from '@/user/entities/user.entity';
import {
  ICreateUser,
  IUserGetByUniqueKey,
} from '@/user/interfaces/user.interface';

import { ListUserDto, UpdateUserDto, UploadAvatarDto } from './dtos/user.dto';
import { PaginateConfig } from '@base/service/paginate/paginate';
import { EProvider } from './user.constant';
import {
  ActiveUserDto,
  CmsCreateUserDto,
  CmsUpdateUserDto,
} from './dtos/create-user.dto';
import { ERole } from '@/role/enum/roles.enum';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    protected readonly repository: Repository<User>,
    private readonly loggerService: LoggerService,
  ) {
    super(repository);
  }

  logger = this.loggerService.getLogger(UserService.name);

  // getUserByUniqueKey(option: IUserGetByUniqueKey): Promise<User> {
  //   const findOption: Record<string, any>[] = Object.entries(option).map(
  //     ([key, value]) => ({ [key]: value }),
  //   );
  //   return this.repository
  //     .createQueryBuilder('user')
  //     .where(findOption)
  //     .getOne();
  // }

  async findOne(username: string): Promise<User | undefined> {
    return this.repository.findOne({ where: { username: username } });
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.repository.findOne({ where: { id: id } });
  }

  async createUser(data: ICreateUser) {
    const user: User = this.repository.create(data);
    user.setPassword(data.password);
    user.provider = EProvider.Owner;
    return await user.save();
  }

  async cmsCreateUser(payload: CmsCreateUserDto) {
    const user = this.repository.create(payload);
    user.setPassword(payload.password);
    user.provider = EProvider.Owner;

    return user.save();
  }

  async cmsUpdateUser(id: number, payload: CmsUpdateUserDto) {
    const user: User = await this.repository.findOne({ where: { id } });

    if (!user)
      throw new exc.BadExcetion({ message: 'Không tồn tại user này!' });

    user.username = payload.username;
    if (user.password !== payload.password) user.setPassword(payload.password);

    user.role = payload.role;

    return user.save();
  }

  async getAllUser(query: ListUserDto) {
    const config: PaginateConfig<User> = {
      searchableColumns: ['username', 'email', 'cccd'],
      sortableColumns: ['updatedAt'],
    };

    const queryB = this.repository
      .createQueryBuilder('user')
      .where({ role: In([ERole.Accountant, ERole.Receptionist]) });

    return this.listWithPage(query, config, queryB);
  }

  async findByEmail(email: string) {
    const user = await this.repository.findOne({
      where: { email, provider: EProvider.Owner },
    });

    return user;
  }

  async update(id: number, payload: UpdateUserDto) {
    const user = await this.repository.findOne({
      where: { id, provider: EProvider.Owner },
    });

    if (!user)
      throw new exc.BadExcetion({ message: 'Không tồn tại tài khoản này' });

    user.username = payload.username;
    user.cccd = payload.cccd;
    user.first_login = false;
    user.gender = payload.gender;
    user.address = payload.address;
    user.phone = payload.phone;

    return user.save();
  }

  async uploadAvatar(id: number, file: string) {
    await this.repository.update(id, { avatar: file });
    return { avatar: file };
  }

  async active(id: number, payload: ActiveUserDto) {
    const user = await this.repository.findOne({
      where: { id, provider: EProvider.Owner },
    });

    if (!user)
      throw new exc.BadExcetion({ message: 'Không tồn tại tài khoản này' });

    user.active = payload.active.toString() == 'true';
    await user.save();

    if (payload.active) return 'Chuyển trạng thái hoạt động thành công';
    return 'Khóa tài khoản thành công';
  }
}
