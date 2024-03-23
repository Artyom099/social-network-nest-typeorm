import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../infrastructure/services/email.manager';
import { UserRepository } from '../../../user/infrastructure/user.repository';
import { randomUUID } from 'crypto';
import { UserQueryRepository } from '../../../user/infrastructure/user.query.repository';

export class SendRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase
  implements ICommandHandler<SendRecoveryCodeCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UserRepository,
    private usersQueryRepository: UserQueryRepository,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<string | null> {
    const { email } = command;

    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email);

    const recoveryCode = randomUUID();
    await this.usersRepository.updateRecoveryCode(user.id, recoveryCode);

    try {
      await this.emailManager.sendEmailRecoveryCode(email, recoveryCode);
    } catch (e) {
      return null;
    }
    return recoveryCode;
  }
}
