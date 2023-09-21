import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {BanUserForBlogModel} from '../api/models/dto/ban.user.for.blog.model';

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async banUserForBlog(dto: BanUserForBlogModel) {
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

  async unbanUserForBlog(id: string) {
    return this.dataSource.query(`
    delete from "banned_users_for_blog"
    where "userId" = $1
    `, [id])
  }
}
