import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BanUserForBlogModel } from '../api/models/dto/ban.user.for.blog.model';
import { BannedUsersForBlog } from '../entity/banned.user.for.blog.entity';

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(private dataSource: DataSource) {}

  async banUserForBlog(dto: BanUserForBlogModel) {
    return this.dataSource
      .createQueryBuilder()
      .insert()
      .into(BannedUsersForBlog)
      .values({
        id: dto.userId,
        login: dto.login,
        createdAt: dto.createdAt,
        blogId: dto.inputModel.blogId,
        isBanned: dto.inputModel.isBanned,
        banDate: new Date(),
        banReason: dto.inputModel.banReason,
      })
      .execute();
  }

  async unbanUserForBlog(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(BannedUsersForBlog)
      .where('id = :id', { id })
      .execute();
  }
}
