import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/user.repository';

export class UnbanUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
  constructor(private usersRepository: UserRepository) {}

  async execute(command: UnbanUserCommand) {
    return this.usersRepository.unbanUser(command.userId);
  }
}
