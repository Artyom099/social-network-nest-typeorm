import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserCurrentBlogInputModel } from '../../api/models/input/ban.user.current.blog.input.model';
import { BannedUsersForBlogRepository } from '../../infrastructure/banned.users.for.blog.repository';
import { BannedUsersForBlogQueryRepository } from '../../infrastructure/banned.users.for.blog.query.repository';
import { UserQueryRepository } from '../../infrastructure/user.query.repository';

export class BanUserForCurrentBlogCommand {
  constructor(
    public userId: string,
    public inputModel: BanUserCurrentBlogInputModel,
  ) {}
}

@CommandHandler(BanUserForCurrentBlogCommand)
export class BanUserForCurrentBlogUseCase
  implements ICommandHandler<BanUserForCurrentBlogCommand>
{
  constructor(
    private usersQueryRepository: UserQueryRepository,
    private bannedUsersForBlogRepository: BannedUsersForBlogRepository,
    private bannedUsersForBlogQueryRepository: BannedUsersForBlogQueryRepository,
  ) {}

  async execute(command: BanUserForCurrentBlogCommand) {
    const { userId, inputModel } = command;

    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;

    const bannedUser =
      await this.bannedUsersForBlogQueryRepository.getBannedUserForBlog(
        userId,
        inputModel.blogId,
      );

    if (!bannedUser && inputModel.isBanned) {
      const model = {
        userId,
        login: user.login,
        createdAt: user.createdAt,
        inputModel,
      };
      return this.bannedUsersForBlogRepository.banUserForBlog(model);
    }

    if (bannedUser && !inputModel.isBanned) {
      return this.bannedUsersForBlogRepository.unbanUserForBlog(userId);
    }

    return;
  }
}
