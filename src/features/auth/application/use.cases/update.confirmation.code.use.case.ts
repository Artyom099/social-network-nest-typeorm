import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../infrastructure/services/email.manager';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { randomUUID } from 'crypto';
import { UserQueryRepository } from '../../../users/infrastructure/user.query.repository';

export class UpdateConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UserRepository,
    private usersQueryRepository: UserQueryRepository,
  ) {}

  async execute(
    command: UpdateConfirmationCodeCommand,
  ): Promise<string | null> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      command.email,
    );
    if (!user) return null;

    const newCode = randomUUID();
    await this.usersRepository.updateConfirmationCode(user.id, newCode);
    try {
      await this.emailManager.sendEmailConfirmationCode(command.email, newCode);
    } catch (error) {
      return null;
    }
    return newCode;
  }
}
