import { Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { BaseService } from '@/base/service/base.service';
import { Promotion } from './entities/promotion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PromotionService extends BaseService<Promotion> {
  constructor(
    @InjectRepository(Promotion)
    protected readonly repository: Repository<Promotion>,
  ) {
    super(repository);
  }
  create(payload: CreatePromotionDto) {
    return 'This action adds a new promotion';
  }

  findAll() {
    return `This action returns all promotion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} promotion`;
  }

  update(id: number, payload: UpdatePromotionDto) {
    return `This action updates a #${id} promotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} promotion`;
  }
}
