import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {BanUserInputModel} from '../../api/models/input/ban.user.input.model';
import {UsersRepository} from '../../infrastructure/users.repository';

export class BanUserCommand {
  constructor(public userId: string, public inputModel: BanUserInputModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: BanUserCommand) {
    return this.usersRepository.banUser(command.userId, command.inputModel.banReason);
  }
}
