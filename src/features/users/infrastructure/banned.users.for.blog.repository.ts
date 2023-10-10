import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {BanUserForBlogModel} from '../api/models/dto/ban.user.for.blog.model';
import {Blogs} from '../../blogs/entity/blog.entity';
import {BannedUsersForBlog} from '../entity/banned.user.for.blog.entity';

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async banUserForBlog1(dto: BanUserForBlogModel) {
    return this.dataSource.query(`
    insert into "banned_users_for_blog" 
    ("userId", "login", "createdAt", "blogId", "isBanned", "banDate", "banReason")
    values ($1, $2, $3, $4, $5, $6, $7)
    `, [
      dto.userId,
      dto.login,
      dto.createdAt,
      dto.inputModel.blogId,
      dto.inputModel.isBanned,
      new Date(),
      dto.inputModel.banReason
    ])
  }
  async banUserForBlog(dto: BanUserForBlogModel) {
    await this.dataSource
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
      .execute()
  }

  async unbanUserForBlog1(id: string) {
    return this.dataSource.query(`
    delete from "banned_users_for_blog"
    where "userId" = $1
    `, [id])
  }
  async unbanUserForBlog(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(BannedUsersForBlog)
      .where("id = :id", { id })
      .execute()
  }
}
