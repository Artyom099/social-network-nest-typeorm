import {Injectable} from '@nestjs/common';
import {DefaultPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {PostViewModel,} from '../api/models/view/post.view.model';
import {PaginationViewModel} from '../../../infrastructure/models/pagination.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPost(
    id: string,
    currentUserId?: string | null,
  ): Promise<PostViewModel | null> {
    const [post] = await this.dataSource.query(`
    select "id", "title", "shortDescription", "content", "createdAt", "blogName", "blogId",
    
      (select count (*) as "likesCount" 
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Like' and u."isBanned" = false),
      
      (select count (*) as "dislikesCount"
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Dislike' and u."isBanned" = false)
    
    from "posts"
    where "id" = $1
    `, [id])

    const [myLikeInfo] = await this.dataSource.query(`
    select *
    from "post_likes"
    where "postId" = $1 and "userId" = $2
    `, [id, currentUserId])

    const newestLikes = await this.dataSource.query(`
    select "addedAt", pl."login", "userId"
    from post_likes pl
    left join users u
    on pl."userId" = u."id"
    where pl."postId" = $1 and pl."status" = $2 and u."isBanned" = false
    order by "addedAt" desc
    limit 3
    `, [id, LikeStatus.Like])

    return post ? {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: parseInt(post.likesCount, 10),
        dislikesCount: parseInt(post.dislikesCount, 10),
        myStatus: myLikeInfo ? myLikeInfo.status : LikeStatus.None,
        newestLikes,
      }
    } : null
  }

  async getPosts(
    currentUserId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count (*)
    from "posts"
    where "blogId" in (select "blogId" from blogs where "isBanned" = false)
    `)

    const sortedPosts = await this.dataSource.query(`
    select "id", "title", "shortDescription", "content", "createdAt", "blogName", "blogId",
    
      (select count (*) as "likesCount"
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Like' and u."isBanned" = false),
      
      (select count (*) as "dislikesCount"
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Dislike' and u."isBanned" = false)
    
    from "posts"
    where "blogId" in (select "blogId" from blogs where "isBanned" = false)
    order by "${query.sortBy}" ${query.sortDirection}
    limit $1
    offset $2
    `, [
      query.pageSize,
      query.offset(),
    ])

    const items = await Promise.all(sortedPosts.map(async (p) => {
      const [myLikeInfo] = await this.dataSource.query(`
      select *
      from "post_likes"
      where "postId" = $1 and "userId" = $2
      `, [p.id, currentUserId])

      const newestLikes = await this.dataSource.query(`
      select "addedAt", pl."login", "userId"
      from post_likes pl
      left join users u
      on pl."userId" = u."id"
      where pl."postId" = $1 and pl."status" = $2 and u."isBanned" = false
      order by "addedAt" desc
      limit 3
      `, [p.id, LikeStatus.Like])

      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: parseInt(p.likesCount, 10),
          dislikesCount: parseInt(p.dislikesCount, 10),
          myStatus: myLikeInfo ? myLikeInfo.status : LikeStatus.None,
          newestLikes,
        }
      }
    }))

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }

  async getPostsCurrentBlog(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count (*)
    from "posts"
    where "blogId" = $1 and "blogId" in (select "blogId" from blogs where "isBanned" = false)
    `, [blogId])

    const sortedPosts = await this.dataSource.query(`
    select "id", "title", "shortDescription", "content", "createdAt", "blogName", "blogId",
    
      (select count (*) as "likesCount" 
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Like' and u."isBanned" = false),
      
      (select count (*) as "dislikesCount"
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Dislike' and u."isBanned" = false)
    
    from "posts"
    where "blogId" = $1 and "blogId" in (select "blogId" from blogs where "isBanned" = false)
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      blogId,
      query.pageSize,
      query.offset(),
    ])

    const items = await Promise.all(sortedPosts.map(async (p) => {
      const [myLikeInfo] = await this.dataSource.query(`
      select *
      from "post_likes"
      where "postId" = $1 and "userId" = $2
      `, [p.id, currentUserId])

      const newestLikes = await this.dataSource.query(`
      select "addedAt", pl."login", "userId"
      from post_likes pl
      left join users u
      on pl."userId" = u."id"
      where pl."postId" = $1 and pl."status" = $2 and u."isBanned" = false
      order by "addedAt" desc
      limit 3
      `, [p.id, LikeStatus.Like])

      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: parseInt(p.likesCount, 10),
          dislikesCount: parseInt(p.dislikesCount, 10),
          myStatus: myLikeInfo ? myLikeInfo.status : LikeStatus.None,
          newestLikes,
        }
      }
    }))

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }

  async getPostsCurrentBlogForBlogger(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count (*)
    from "posts"
    where "blogId" = $1
    `, [blogId])

    const sortedPosts = await this.dataSource.query(`
    select "id", "title", "shortDescription", "content", "createdAt", "blogName", "blogId",
    
      (select count (*) as "likesCount" 
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Like' and u."isBanned" = false),
      
      (select count (*) as "dislikesCount"
      from post_likes pl
      left join users u 
      on pl."userId" = u."id"
      where pl."postId" = posts.id and pl."status" = 'Dislike' and u."isBanned" = false)
        
    from "posts"
    where "blogId" = $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      blogId,
      query.pageSize,
      query.offset(),
    ])

    const items = await Promise.all(sortedPosts.map(async (p) => {
      const [myLikeInfo] = await this.dataSource.query(`
      select *
      from "post_likes"
      where "postId" = $1 and "userId" = $2
      `, [p.id, currentUserId])

      const newestLikes = await this.dataSource.query(`
      select "addedAt", pl."login", "userId"
      from post_likes pl
      left join users u
      on pl."userId" = u."id"
      where pl."postId" = $1 and pl."status" = $2 and u."isBanned" = false
      order by "addedAt" desc
      limit 3
      `, [p.id, LikeStatus.Like])

      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: parseInt(p.likesCount, 10),
          dislikesCount: parseInt(p.dislikesCount, 10),
          myStatus: myLikeInfo ? myLikeInfo.status : LikeStatus.None,
          newestLikes,
        }
      }
    }))

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }
}
