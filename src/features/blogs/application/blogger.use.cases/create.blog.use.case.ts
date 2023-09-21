import {BlogsRepository} from '../../infrastructure/blogs.repository';
import {BlogInputModel} from '../../api/models/input/blog.input.model';
import {UsersQueryRepository} from '../../../users/infrastructure/users.query.repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {BlogViewModel} from '../../api/models/view/blog.view.model';
import {randomUUID} from 'crypto';

export class CreateBlogCommand {
  constructor(public userId: string, public inputModel: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const { userId, inputModel } = command;
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;

    const createBlogModel = {
      id: randomUUID(),
      inputModel,
      createdAt: new Date(),
      isMembership: false,
      userId: user.id,
      userLogin: user.login,
      isBanned: false,
      banDate: null,
    };
    return this.blogsRepository.createBlog(createBlogModel);
  }
}
