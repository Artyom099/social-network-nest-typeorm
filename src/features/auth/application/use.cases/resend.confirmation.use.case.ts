import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../user/infrastructure/user.repository';
import { randomUUID } from 'crypto';
import { EmailManager } from '../../../../infrastructure/email/email.manager';

export class ResendConfirmationCommand {
  constructor(public email: string, public userId: string) {}
}

@CommandHandler(ResendConfirmationCommand)
export class ResendConfirmationUseCase
  implements ICommandHandler<ResendConfirmationCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UserRepository,
  ) {}

  async execute(command: ResendConfirmationCommand) {
    const { email, userId } = command;
    const newCode = randomUUID();

    try {
      // await
      this.emailManager.sendEmailConfirmationCode(email, newCode);
    } catch (e) {
      return null;
    }

    await this.usersRepository.updateConfirmationCode(userId, newCode);
    return newCode;
  }
}
