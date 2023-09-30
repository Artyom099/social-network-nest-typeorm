import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepository} from '../../../users/infrastructure/users.repository';
import {randomUUID} from 'crypto';
import {EmailManager} from '../../../../infrastructure/services/email.manager';

export class ResendConfirmationCommand {
  constructor(public email: string, public userId: string) {}
}

@CommandHandler(ResendConfirmationCommand)
export class ResendConfirmationUseCase implements ICommandHandler<ResendConfirmationCommand> {
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UsersRepository
  ) {}

  async execute(command: ResendConfirmationCommand) {
    const newCode = randomUUID()
    try {
      //await
      this.emailManager.sendEmailConfirmationCode(command.email, newCode)
    } catch (e) {
      return null;
    }
    await this.usersRepository.updateConfirmationCode(command.userId, newCode)
    return newCode
  }
}