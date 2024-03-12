import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginateQuery } from '@base/service/paginate/paginate.interface';
import { paginate, PaginateConfig } from '@base/service/paginate/paginate';

export abstract class BaseService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  protected async listWithPage(
    query: PaginateQuery,
    config: PaginateConfig<T>,
    customQuery?: Repository<T> | SelectQueryBuilder<T>,
  ) {
    if (customQuery) {
      return paginate<T>(query, customQuery, config);
    }
    return paginate<T>(query, this.repository, config);
  }
}
