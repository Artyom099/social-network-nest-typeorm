import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/input/blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogViewModel } from '../../api/models/view/blog.view.model';
import { randomUUID } from 'crypto';
import { CreateBlogModel } from '../../api/models/dto/create.blog.model';

export class CreateBlogCommand {
  constructor(public inputModel: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const { inputModel } = command;

    const dto: CreateBlogModel = {
      id: randomUUID(),
      inputModel,
      createdAt: new Date(),
      isMembership: false,
      userId: '',
      userLogin: '',
      isBanned: false,
      banDate: null,
    };

    return this.blogsRepository.createBlog(dto);
  }
}
