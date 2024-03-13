import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { BaseService } from '@/base/service/base.service';
import { Service } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListServiceDto } from './dto/list-service.dto';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { BadExcetion } from '@/base/api/exception.reslover';

@Injectable()
export class ServicesService extends BaseService<Service> {
  constructor(
    @InjectRepository(Service)
    protected readonly repository: Repository<Service>,
  ) {
    super(repository);
  }
  async create(payload: CreateServiceDto) {
    const service = await this.repository.findOne({
      where: { name: payload.name },
    });

    if (service) throw new BadExcetion({ message: 'Dich vu da ton tai' });
    return this.repository.save({
      ...payload,
      image: payload.image || payload.file || null,
    });
  }

  async findAll(query: ListServiceDto) {
    const config: PaginateConfig<Service> = {
      sortableColumns: ['id'],
      searchableColumns: ['name'],
    };
    return this.listWithPage(query, config);
  }

  async findOne(id: number) {
    const service = await this.repository.findOne({
      where: { id },
    });

    if (!service) throw new BadExcetion({ message: 'Dich vu khong ton tai' });
    return service;
  }

  async update(id: number, payload: UpdateServiceDto) {
    const service = await this.repository.findOne({
      where: { name: payload.name },
    });

    if (service && service.id !== id)
      throw new BadExcetion({ message: 'Dich vu da ton tai' });

    const serviceUpdate = await this.findOne(id);
    return this.repository.save({
      ...serviceUpdate,
      ...payload,
      image: payload.file || payload.image || null,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}
