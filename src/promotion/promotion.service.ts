import { Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { BaseService } from '@/base/service/base.service';
import { Promotion } from './entities/promotion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { BadExcetion } from '@/base/api/exception.reslover';
import { ListDto } from '@/shared/dtos/common.dto';
import { PaginateConfig } from '@/base/service/paginate/paginate';
import { User } from '@/user/entities/user.entity';
import { ERole } from '@/role/enum/roles.enum';
import { EState } from '@/shared/enum/common.enum';
import { ActivePromotionDto } from './dto/active-promotion.dto';

@Injectable()
export class PromotionService extends BaseService<Promotion> {
  constructor(
    @InjectRepository(Promotion)
    protected readonly repository: Repository<Promotion>,
  ) {
    super(repository);
  }
  async create(payload: CreatePromotionDto) {
    const {
      name,
      description,
      image,
      start_date,
      end_date,
      discount,
      quantity,
      state,
      file,
      condition,
    } = payload;

    const check = await this.repository
      .createQueryBuilder('promotion')
      .where(':start_date BETWEEN start_date AND end_date', { start_date })
      .orWhere(':end_date BETWEEN start_date AND end_date', { end_date })
      .orWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where(':start_date < start_date', { start_date }).andWhere(
            ':end_date > end_date',
            { end_date },
          );
        }),
      )
      .getCount();

    if (check)
      throw new BadExcetion({ message: 'Khuyễn mãi bị trùng thời gian' });

    const promotion = new Promotion();
    promotion.name = name;
    promotion.description = description;
    promotion.image = file ?? image;
    promotion.start_date = start_date;
    promotion.end_date = end_date;
    promotion.discount = discount;
    promotion.state = state;
    promotion.quantity = quantity;
    promotion.condition = condition;

    return promotion.save();
  }

  async findAll(query: ListDto) {
    const config: PaginateConfig<Promotion> = {
      sortableColumns: ['updatedAt'],
      searchableColumns: ['name'],
    };

    return this.listWithPage(query, config);
  }

  async findAllForUser(query: ListDto) {
    const config: PaginateConfig<Promotion> = {
      sortableColumns: ['updatedAt'],
      searchableColumns: ['name'],
      where: { active: true },
    };

    return this.listWithPage(query, config);
  }

  async findOne(identity: string) {
    const isInterger = Number.isInteger(identity);
    const option = isInterger ? { id: +identity } : { slug: identity };
    const tr = await this.repository.findOne({
      where: option,
    });

    if (!tr)
      throw new BadExcetion({ message: 'Không tồn tại khuyễn mãi không này' });
    return tr;
  }

  async update(id: number, payload: UpdatePromotionDto) {
    const {
      name,
      description,
      image,
      start_date,
      end_date,
      discount,
      quantity,
      state,
      file,
      condition,
    } = payload;

    const promotion = await this.repository.findOne({ where: { id } });

    if (!promotion)
      throw new BadExcetion({ message: 'Không tồn tại khuyễn mãi không này' });

    const check = await this.repository
      .createQueryBuilder('promotion')
      .where('id != :id', { id })
      .andWhere(
        new Brackets((qb) => {
          qb.orWhere(':start_date BETWWEN start_date AND end_date', {
            start_date,
          })
            .orWhere(':end_date BETWWEN start_date AND end_date', { end_date })
            .orWhere(
              new Brackets((qb: WhereExpressionBuilder) => {
                qb.where(':start_date < start_date', { start_date }).andWhere(
                  ':end_date > end_date',
                  { end_date },
                );
              }),
            );
        }),
      )

      .getMany();

    if (check)
      throw new BadExcetion({ message: 'Khuyễn mãi bị trùng thời gian' });

    promotion.name = name;
    promotion.description = description;
    promotion.image = file ?? image;
    promotion.start_date = start_date;
    promotion.end_date = end_date;
    promotion.discount = discount;
    promotion.state = state;
    promotion.quantity = quantity;
    promotion.condition = condition;

    return promotion.save();
  }

  async remove(id: number) {
    const promotion = await this.repository.findOne({ where: { id } });
    if (!promotion)
      throw new BadExcetion({ message: 'Không tồn tại khuyễn mãi này!' });

    promotion.deletedAt = new Date();
    return promotion.save();
  }

  async active(id: number, payload: ActivePromotionDto) {
    const promotion = await this.repository.findOne({ where: { id } });
    if (!promotion)
      throw new BadExcetion({ message: 'Không tồn tại khuyễn mãi này!' });

    promotion.active = payload.active.toString() == 'true';

    await promotion.save();

    if (payload.active.toString() == 'true') return 'Kích hoạt thành công';
    return 'Hủy kích hoạt thành công';
  }

  async checkPromotion(checkin: Date) {
    return this.repository
      .createQueryBuilder('promotion')
      .where(':checkin BETWEEN start_date AND end_date', { checkin })
      .getOne();
  }
}
