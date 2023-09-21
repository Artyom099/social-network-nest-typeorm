import {BlogsRepository} from '../../infrastructure/blogs.repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';

export class BanBlogCommand {
  constructor(public blogId: string, public banStatus: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: BanBlogCommand) {
    if (command.banStatus) {
      return this.blogsRepository.banBlog(command.blogId);
    } else {
      return this.blogsRepository.unbanBlog(command.blogId);
    }
  }
}
