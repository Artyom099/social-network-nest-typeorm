import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentViewModel } from '../../api/models/view/comment.view.model';
import { randomUUID } from 'crypto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { UserQueryRepository } from '../../../users/infrastructure/user.query.repository';
import { CreateCommentDto } from '../../api/models/dto/create.comment.dto';
import { CreateCommentModel } from '../../api/models/dto/create.comment.model';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class CreateCommentCommand {
  constructor(public inputModel: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UserQueryRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    const { postId, content, userId } = command.inputModel;
    const post = await this.postsQueryRepository.getPost(postId);
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!post || !user) throw new NotFoundException('user or post not found');

    //todo - добавить проверку не забанен ли пользователь в текущем блоге!!!
    const blog = 'mock - is user banned here?';
    if (!blog) throw new ForbiddenException('user banned in current blog');

    const dto: CreateCommentModel = {
      id: randomUUID(),
      content: content,
      createdAt: new Date(),
      userId,
      userLogin: user.login,
      postId,
      postTitle: post.title,
      blogId: post.blogId,
      blogName: post.blogName,
    };
    return this.commentsRepository.createComment(dto);
  }
}
