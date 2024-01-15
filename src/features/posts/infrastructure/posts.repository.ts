import {Injectable} from '@nestjs/common';
import {PostInputModel} from '../api/models/input/post.input.model';
import {LikeStatus} from '../../../infrastructure/utils/enums';
import {PostViewModel} from '../api/models/view/post.view.model';
import {CreatePostModel} from '../api/models/dto/create.post.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {UpdatePostLikesModel} from '../api/models/dto/update.post.likes.model';
import {Posts} from '../entity/post.entity';
import {PostLikes} from '../entity/post.likes.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(dto: CreatePostModel): Promise<PostViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Posts)
      .values({
        id: dto.id,
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: dto.blogId,
        blogName: dto.blogName,
        createdAt: dto.createdAt,
      })
      .execute()

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
  async updatePost(id: string, dto: PostInputModel) {
    return this.dataSource
      .createQueryBuilder()
      .update(Posts)
      .set({ title: dto.title, shortDescription: dto.shortDescription, content: dto.content})
      .where("id = :id", { id, inputModel: dto })
      .execute()
  }
  async deletePost(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Posts)
      .where("id = :id", { id })
      .execute()
  }

  async setPostNone(dto: UpdatePostLikesModel) {
    const [postLikes] = await this.dataSource.query(`
    select *
    from "post_likes"
    where "postId" = $1 and "userId" = $2
    `, [dto.postId, dto.userId])

    if (postLikes && (postLikes.status === LikeStatus.Like || postLikes.status === LikeStatus.Dislike)) {
      return this.dataSource
        .createQueryBuilder()
        .update(PostLikes)
        .set({ status: "None" })
        .where("postId = :postId", { postId: dto.postId })
        .andWhere("userId = :userId", { userId: dto.userId })
        .execute()
    }
  }
  async setPostReaction(dto: UpdatePostLikesModel) {
    const [postLikes] = await this.dataSource.query(`
    select *
    from "post_likes"
    where "postId" = $1 and "userId" = $2
    `, [dto.postId, dto.userId])

    if (postLikes) {
      return this.dataSource
        .createQueryBuilder()
        .update(PostLikes)
        .set({ status: dto.likeStatus })
        .where("postId = :postId", { postId: dto.postId })
        .andWhere("userId = :userId", { userId: dto.userId })
        .execute()
    } else {
      return this.dataSource
        .createQueryBuilder()
        .insert()
        .into(PostLikes)
        .values({
          postId: dto.postId,
          userId: dto.userId,
          status: dto.likeStatus,
          addedAt: dto.addedAt,
          login: dto.login,
        })
        .execute()
    }
  }
}
