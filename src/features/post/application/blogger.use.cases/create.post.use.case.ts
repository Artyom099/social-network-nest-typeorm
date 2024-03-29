import { PostInputModel } from '../../api/models/input/post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { SABlogViewModel } from '../../../blog/api/models/view/sa.blog.view.model';
import { PostViewModel } from '../../api/models/view/post.view.model';
import { randomUUID } from 'crypto';
import { CreatePostModel } from '../../api/models/dto/create.post.model';

export class CreatePostCommand {
  constructor(
    public bLog: SABlogViewModel,
    public inputModel: PostInputModel,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const dto: CreatePostModel = {
      id: randomUUID(),
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      blogId: command.bLog.id,
      blogName: command.bLog.name,
      createdAt: new Date(),
      extendedLikesInfo: [],
    };
    return this.postsRepository.createPost(dto);
  }
}
