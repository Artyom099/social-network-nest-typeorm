import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {CommentInputModel} from './models/input/comment.input.model';
import {BearerAuthGuard} from '../../../infrastructure/guards/bearer-auth.guard';
import {CheckUserIdGuard} from '../../../infrastructure/guards/check-userId.guard';
import {CommentsQueryRepository} from '../infrastructure/comments.query.repository';
import {CommentViewModel} from './models/view/comment.view.model';
import {LikeStatusInputModel} from './models/input/like.status.input.model';
import {CommandBus} from '@nestjs/cqrs';
import {UpdateCommentCommand} from '../application/use.cases/update.comment.use.case';
import {DeleteCommentCommand} from '../application/use.cases/delete.comment.use.case';
import {UpdateCommentLikesCommand} from '../application/use.cases/update.comment.likes.use.case';
import {UsersQueryRepository} from '../../users/infrastructure/users.query.repository';


@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getComment(
    @Req() req,
    @Param('id') commentId: string,
  ): Promise<CommentViewModel | null> {
    //todo - если юзер забанен, мы не можем получить его коммент - добавить проверку в use case?
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
      req.userId,
    );
    if (!comment) throw new NotFoundException();

    const user = await this.usersQueryRepository.getUserByIdSA(
      comment.commentatorInfo.userId,
    );
    if (user?.banInfo.isBanned) {
      throw new NotFoundException();
    } else {
      return comment;
    }
  }

  @Put(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() req,
    @Param('id') commentId: string,
    @Body() InputModel: CommentInputModel,
  ) {
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
      req.userId,
    );
    if (!comment) throw new NotFoundException();
    if (req.userId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(new UpdateCommentCommand(
        commentId,
        InputModel.content
      ));
    }
  }

  @Delete(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Req() req, @Param('id') commentId: string) {
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
      req.userId,
    );
    if (!comment) throw new NotFoundException();
    if (req.userId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(new DeleteCommentCommand(commentId));
    }
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Req() req,
    @Param('id') commentId: string,
    @Body() inputModel: LikeStatusInputModel,
  ) {
    const comment = await this.commentsQueryRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(new UpdateCommentLikesCommand(
        commentId,
        req.userId,
        inputModel.likeStatus,
      ));
    }
  }
}
