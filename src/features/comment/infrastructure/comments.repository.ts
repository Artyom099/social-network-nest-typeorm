import { LikeStatus } from '../../../infrastructure/utils/enums';
import { Injectable } from '@nestjs/common';
import { CreateCommentModel } from '../api/models/dto/create.comment.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdateCommentLikeModel } from '../api/models/dto/update.comment.like.model';
import { CommentViewModel } from '../api/models/view/comment.view.model';
import { Comments } from '../entity/сomment.entity';
import { CommentLikes } from '../entity/comment.likes.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createComment(dto: CreateCommentModel): Promise<CommentViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Comments)
      .values({
        id: dto.id,
        content: dto.content,
        createdAt: dto.createdAt,
        userId: dto.userId,
        userLogin: dto.userLogin,
        postId: dto.postId,
        postTitle: dto.postTitle,
        blogId: dto.blogId,
        blogName: dto.blogName,
      })
      .execute();

    const [comment] = await this.dataSource.query(
      `
    select *
    from "comments"
    where "id" = $1
    `,
      [dto.id],
    );

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    };
  }
  async updateComment(id: string, content: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Comments)
      .set({ content: content })
      .where('id = :id', { id, content })
      .execute();
  }
  async deleteComment(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Comments)
      .where('id = :id', { id })
      .execute();
  }

  async setCommentNone(dto: UpdateCommentLikeModel) {
    const [commentLikes] = await this.dataSource.query(
      `
    select *
    from "comment_likes"
    where "commentId" = $1 and "userId" = $2
    `,
      [dto.commentId, dto.userId],
    );

    if (
      commentLikes &&
      (commentLikes.status === LikeStatus.Like ||
        commentLikes.status === LikeStatus.Dislike)
    ) {
      return this.dataSource
        .createQueryBuilder()
        .update(CommentLikes)
        .set({ status: 'None' })
        .where('commentId = :commentId', { commentId: dto.commentId })
        .andWhere('userId = :userId', { userId: dto.userId })
        .execute();
    }
  }
  async setCommentReaction(dto: UpdateCommentLikeModel) {
    const [commentLikes] = await this.dataSource.query(
      `
    select *
    from "comment_likes"
    where "commentId" = $1 and "userId" = $2
    `,
      [dto.commentId, dto.userId],
    );

    if (commentLikes) {
      return this.dataSource
        .createQueryBuilder()
        .update(CommentLikes)
        .set({ status: dto.likeStatus })
        .where('commentId = :commentId', { commentId: dto.commentId })
        .andWhere('userId = :userId', { userId: dto.userId })
        .execute();
    } else {
      return this.dataSource
        .createQueryBuilder()
        .insert()
        .into(CommentLikes)
        .values({
          commentId: dto.commentId,
          userId: dto.userId,
          status: dto.likeStatus,
        })
        .execute();
    }
  }
}
