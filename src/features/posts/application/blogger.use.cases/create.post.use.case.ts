import {PostInputModel} from '../../api/models/input/post.input.model';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PostsRepository} from '../../infrastucture/posts.repository';
import {SABlogViewModel} from '../../../blogs/api/models/view/sa.blog.view.model';
import {PostViewModel} from '../../api/models/view/post.view.model';
import {randomUUID} from 'crypto';

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
    const createdPostModel = {
      id: randomUUID(),
      title: command.inputModel.title,
      shortDescription: command.inputModel.shortDescription,
      content: command.inputModel.content,
      blogId: command.bLog.id,
      blogName: command.bLog.name,
      createdAt: new Date(),
      extendedLikesInfo: [],
    }

    return this.postsRepository.createPost(createdPostModel);
  }
}
