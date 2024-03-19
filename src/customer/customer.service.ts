import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomerDto } from './dto/list-customer.dto';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { User } from '@/user/entities/user.entity';
import { BaseService } from '@/base/service/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ERole } from '@/role/enum/roles.enum';

@Injectable()
export class CustomerService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    protected readonly repository: Repository<User>,
  ) {
    super(repository);
  }
  create(payload: CreateCustomerDto) {
    return 'This action adds a new customer';
  }

  async findAll(query: ListCustomerDto) {
    const config: PaginateConfig<User> = {
      sortableColumns: ['updatedAt'],
    };

    const queryB = this.repository
      .createQueryBuilder('user')
      .where({ role: ERole.User });

    return this.listWithPage(query, config, queryB);
  }

  async findEmail(email: string) {
    return this.repository.find({
      where: { email, id: Not(1) },
      select: ['id', 'username', 'email', 'phone', 'address', 'cccd'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {}

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
