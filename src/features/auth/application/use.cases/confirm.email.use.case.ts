import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    private userRepository: UserRepository,
    private userQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const { code } = command;

    const user = await this.userQueryRepository.getUserByConfirmationCode(code);

    if (
      !user ||
      user.isConfirmed ||
      user.confirmationCode !== code ||
      user.expirationDate < new Date().toISOString()
    ) {
      return false;
    } else {
      return this.userRepository.confirmEmail(user.id);
    }
  }
}
