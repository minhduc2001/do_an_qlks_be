import { FeatureRoom } from './entities/feature_room.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/service/base.service';
import { BadExcetion } from '@/base/api/exception.reslover';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { ListDto } from '@/shared/dtos/common.dto';

@Injectable()
export class FeatureRoomService extends BaseService<FeatureRoom> {
  constructor(
    @InjectRepository(FeatureRoom)
    protected readonly repository: Repository<FeatureRoom>,
  ) {
    super(repository);
  }

  async findAll(query: ListDto) {
    const config: PaginateConfig<FeatureRoom> = {
      sortableColumns: ['id'],
    };

    return this.listWithPage(query, config);
  }
}
