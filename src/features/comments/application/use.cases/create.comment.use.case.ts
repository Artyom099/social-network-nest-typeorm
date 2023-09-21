import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CommentsRepository} from '../../infrastructure/comments.repository';
import {CommentViewModel} from '../../api/models/view/comment.view.model';
import {randomUUID} from 'crypto';
import {PostsQueryRepository} from '../../../posts/infrastucture/posts.query.repository';
import {UsersQueryRepository} from '../../../users/infrastructure/users.query.repository';
import {CreateCommentDto} from '../../api/models/dto/create.comment.dto';

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
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    const {postId, content, userId} = command.inputModel
    const post = await this.postsQueryRepository.getPost(postId);
    const user = await this.usersQueryRepository.getUserById(userId);
    //todo - добавить проверку не забанен ли пользователь в текущем блоге!!!

    const model = {
      id: randomUUID(),
      content: content,
      createdAt: new Date(),
      userId,
      userLogin: user!.login,
      postId,
      postTitle: post!.title,
      blogId: post!.blogId,
      blogName: post!.blogName,
    }
    return this.commentsRepository.createComment(model);
  }
}
