import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BaseService } from '@/base/service/base.service';
import { Booking } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListDto } from '@/shared/dtos/common.dto';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { BadExcetion } from '@/base/api/exception.reslover';

@Injectable()
export class BookingService extends BaseService<Booking> {
  constructor(
    @InjectRepository(Booking)
    protected readonly repository: Repository<Booking>,
  ) {
    super(repository);
  }
  async create(payload: CreateBookingDto) {
    return 'This action adds a new booking';
  }

  async findAll(query: ListDto) {
    const config: PaginateConfig<Booking> = {
      sortableColumns: ['updatedAt'],
    };
    return this.listWithPage(query, config);
  }

  async findOne(id: number) {
    const booking = await this.repository.findOne({ where: { id } });

    if (!booking) throw new BadExcetion({ message: 'Không tồn tại đơn này' });
  }

  async update(id: number, payload: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  async remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
