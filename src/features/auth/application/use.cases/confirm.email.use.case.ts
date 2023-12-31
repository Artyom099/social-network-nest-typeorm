import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepository} from '../../../users/infrastructure/users.repository';
import {UsersQueryRepository} from '../../../users/infrastructure/users.query.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByConfirmationCode(command.code);
    if (!user || user.isConfirmed || user.confirmationCode !== command.code || user.expirationDate < new Date().toISOString()) {
      return false;
    } else {
      return this.usersRepository.confirmEmail(user.id);
    }
  }
}
