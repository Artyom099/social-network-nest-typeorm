import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../api/models/input/ban.user.input.model';
import { UserRepository } from '../../infrastructure/user.repository';

export class BanUserCommand {
  constructor(public userId: string, public inputModel: BanUserInputModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(private usersRepository: UserRepository) {}

  async execute(command: BanUserCommand) {
    const { userId, inputModel } = command;

    return this.usersRepository.banUser(userId, inputModel.banReason);
  }
}
