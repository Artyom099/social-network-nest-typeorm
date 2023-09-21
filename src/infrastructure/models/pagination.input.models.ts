import {BanStatus, SortBy, SortDirection} from '../utils/constants';
import {IsBoolean, IsOptional, IsString} from 'class-validator';
import {Transform} from 'class-transformer';
import {isNil} from '@nestjs/common/utils/shared.utils';

export class DefaultPaginationInput {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : SortBy.default;
  })
  sortBy = SortBy.default;
  @IsOptional()
  @Transform(({ value }) => {
    return value === SortDirection.asc ? SortDirection.asc : SortDirection.desc;
  })
  sortDirection: 'asc' | 'desc' = SortDirection.desc;
  @IsOptional()
  @Transform(({ value }) => {
    return value < 1 || value % 1 !== 0 ? 1 : Number(value);
  })
  pageNumber = 1;
  @IsOptional()
  @Transform(({ value }) => {
    return value < 1 || value % 1 !== 0 ? 10 : Number(value);
  })
  pageSize = 10;

  offset(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
  pagesCountSql(totalCount: { count: string }): number {
    return Math.ceil(parseInt(totalCount.count, 10) / this.pageSize);
  }
  totalCountSql(tCount: { count: string }): number {
    return parseInt(tCount.count, 10)
  }
}

export class BlogsPaginationInput extends DefaultPaginationInput {
  @Transform(({ value }) => {
    return !isNil(value) ? value : '';
  })
  @IsOptional()
  searchNameTerm: string = '';
}

export class UsersPaginationInput extends DefaultPaginationInput {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === BanStatus.banned
      ? true
      : value === BanStatus.notBanned
      ? false
      : null;
  })
  banStatus: boolean | null = null;
  @IsOptional()
  @Transform(({ value }): string => {
    return !isNil(value) ? value : '';
  })
  searchLoginTerm: string = '';
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : '';
  })
  searchEmailTerm: string = '';
}

export class BannedUsersPaginationInput extends DefaultPaginationInput {
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : '';
  })
  searchLoginTerm: string = '';
}
