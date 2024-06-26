import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BannedUsersPaginationInput } from '../../../infrastructure/pagination/pagination.input.models';
import { Pagination } from '../../../infrastructure/pagination/pagination';
import { BannedUserForBlogViewModel } from '../api/models/view/banned.user.for.blog.view.model';

@Injectable()
export class BannedUsersForBlogQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getBannedUserForBlog(id: string, blogId: string) {
    const [user] = await this.dataSource.query(
      `
    select "userId" as "id", "login", "blogId", "isBanned", "banDate", "banReason"
    from "banned_users_for_blog"
    where "userId" = $1 and "blogId" = $2
    `,
      [id, blogId],
    );

    return user ? user : null;
  }

  async getBannedUsersForBlog(
    blogId: string,
    query: BannedUsersPaginationInput,
  ): Promise<Pagination<BannedUserForBlogViewModel[]>> {
    const [totalCount] = await this.dataSource.query(
      `
    select count(*)
    from "banned_users_for_blog"
    where "isBanned" = true and "blogId" = $1
    `,
      [blogId],
    );

    const sortedUsers = await this.dataSource.query(
      `
    select "userId" as "id", "login", "blogId", "isBanned", "banDate", "banReason"
    from "banned_users_for_blog"
    where "isBanned" = true and "blogId" = $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2 
    offset $3
    `,
      [blogId, query.pageSize, query.offset()],
    );

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.login,
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.banDate,
          banReason: u.banReason,
        },
      };
    });

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }
}
