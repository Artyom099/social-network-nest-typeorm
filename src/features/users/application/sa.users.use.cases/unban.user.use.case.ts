import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepository} from '../../infrastructure/users.repository';

export class UnbanUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: UnbanUserCommand) {
    return this.usersRepository.unbanUser(command.userId);
  }
}
