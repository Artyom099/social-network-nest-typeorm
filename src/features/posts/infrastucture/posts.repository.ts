import {Injectable} from '@nestjs/common';
import {PostInputModel} from '../api/models/input/post.input.model';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {PostViewModel} from '../api/models/view/post.view.model';
import {CreatePostModel} from '../api/models/dto/create.post.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {UpdatePostLikesModel} from '../api/models/dto/update.post.likes.model';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(dto: CreatePostModel): Promise<PostViewModel> {
    await this.dataSource.query(`
    insert into "posts"
    ("id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt")
    values ($1, $2, $3, $4, $5, $6, $7)
    `, [
      dto.id,
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      dto.blogName,
      dto.createdAt,
    ])

    const [post] = await this.dataSource.query(`
    select *
    from "posts"
    where "id" = $1
    `, [dto.id])

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    }
  }
  async updatePost(id: string, inputModel: PostInputModel) {
    return this.dataSource.query(`
    update "posts"
    set "title" = $1, "shortDescription" = $2, "content" = $3
    where "id" = $4
    `, [
      inputModel.title,
      inputModel.shortDescription,
      inputModel.content,
      id,
    ])
  }
  async deletePost(id: string) {
    return this.dataSource.query(`
    delete from "posts"
    where "id" = $1
    `, [id])
  }

  async setPostNone(dto: UpdatePostLikesModel) {
    const [postLikes] = await this.dataSource.query(`
    select *
    from "post_likes"
    where "postId" = $1 and "userId" = $2
    `, [dto.postId, dto.userId])

    if (postLikes && (postLikes.status === LikeStatus.Like || postLikes.status === LikeStatus.Dislike)) {
      return this.dataSource.query(`
      update "post_likes"
      set "status" = $1
      where "postId" = $2 and "userId" = $3
      `, ['None', dto.postId, dto.userId])
    }
  }
  async setPostReaction(dto: UpdatePostLikesModel) {
    const [postLikes] = await this.dataSource.query(`
    select *
    from "post_likes"
    where "postId" = $1 and "userId" = $2
    `, [dto.postId, dto.userId])

    if (postLikes) {
      return this.dataSource.query(`
      update "post_likes"
      set "status" = $1
      where "postId" = $2 and "userId" = $3
      `, [dto.likeStatus, dto.postId, dto.userId])
    } else {
      return this.dataSource.query(`
      insert into "post_likes"
      ("postId", "userId", "status", "addedAt", "login")
      values ($1, $2, $3, $4, $5)
      `, [
        dto.postId,
        dto.userId,
        dto.likeStatus,
        dto.addedAt,
        dto.login,
      ])
    }
  }
  async setPostDislike(dto: UpdatePostLikesModel) {
    const [postLikes] = await this.dataSource.query(`
    select *
    from "post_likes"
    where "postId" = $1 and "userId" = $2
    `, [dto.postId, dto.userId])

    if (postLikes) {
      return this.dataSource.query(`
      update "post_likes"
      set "status" = $1
      where "postId" = $2 and "userId" = $3
      `, [dto.likeStatus, dto.postId, dto.userId])
    } else {
      return this.dataSource.query(`
      insert into "post_likes"
      ("postId", "userId", "status", "addedAt", "login")
      values ($1, $2, $3, $4, $5)
      `, [
        dto.postId,
        dto.userId,
        dto.likeStatus,
        dto.addedAt,
        dto.login,
      ])
    }
  }
}
