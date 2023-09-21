import {LikeStatus} from '../../../infrastructure/utils/constants';
import {Injectable} from '@nestjs/common';
import {CreateCommentModel} from '../api/models/dto/create.comment.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {UpdateCommentLikeModel} from '../api/models/dto/update.comment.like.model';
import {CommentViewModel} from '../api/models/view/comment.view.model';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createComment(dto: CreateCommentModel): Promise<CommentViewModel> {
    await this.dataSource.query(`
    insert into "comments"
    ("id", "content", "createdAt", "userId", "userLogin", "postId", "postTitle", "blogId", "blogName")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      dto.id,
      dto.content,
      dto.createdAt,
      dto.userId,
      dto.userLogin,
      dto.postId,
      dto.postTitle,
      dto.blogId,
      dto.blogName,
    ])

    const [comment] = await this.dataSource.query(`
    select *
    from "comments"
    where "id" = $1
    `, [dto.id])

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
    }
  }
  async updateComment(id: string, content: string) {
    return this.dataSource.query(`
    update "comments"
    set "content" = $1
    where "id" = $2
    `, [content, id])
  }
  async deleteComment(id: string) {
    return this.dataSource.query(`
    delete from "comments"
    where "id" = $1
    `, [id])
  }

  async setCommentNone(dto: UpdateCommentLikeModel) {
    const [commentLikes] = await this.dataSource.query(`
    select *
    from "comment_likes"
    where "commentId" = $1 and "userId" = $2
    `, [dto.commentId, dto.userId])

    if (commentLikes && (commentLikes.status === LikeStatus.Like || commentLikes.status === LikeStatus.Dislike)) {
      return this.dataSource.query(`
      update "comment_likes"
      set "status" = $1
      where "commentId" = $2 and "userId" = $3
      `, ['None', dto.commentId, dto.userId])
    }

  }
  async setCommentReaction(dto: UpdateCommentLikeModel) {
    const [commentLikes] = await this.dataSource.query(`
    select *
    from "comment_likes"
    where "commentId" = $1 and "userId" = $2
    `, [dto.commentId, dto.userId])

    if (commentLikes) {
      return this.dataSource.query(`
      update "comment_likes"
      set "status" = $1
      where "commentId" = $2 and "userId" = $3
      `, [dto.likeStatus, dto.commentId, dto.userId])
    } else {
      return this.dataSource.query(`
      insert into "comment_likes"
      ("commentId", "userId", "status")
      values ($1, $2, $3)
      `, [dto.commentId, dto.userId, dto.likeStatus])
    }
  }
  async setCommentDislike(dto: UpdateCommentLikeModel) {
    const [commentLikes] = await this.dataSource.query(`
    select *
    from "comment_likes"
    where "commentId" = $1 and "userId" = $2
    `, [dto.commentId, dto.userId])

    if (commentLikes) {
      return this.dataSource.query(`
      update "comment_likes"
      set "status" = $1
      where "commentId" = $2 and "userId" = $3
      `, [dto.likeStatus, dto.commentId, dto.userId])
    } else {
      return this.dataSource.query(`
      insert into "comment_likes"
      ("commentId", "userId", "status")
      values ($1, $2, $3)
      `, [dto.commentId, dto.userId, dto.likeStatus])
    }
  }
}
