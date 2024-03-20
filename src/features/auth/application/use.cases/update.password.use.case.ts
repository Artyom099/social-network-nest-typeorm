import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { HashService } from '../../../../infrastructure/services/hash.service';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class UpdatePasswordCommand {
  constructor(public code: string, public password: string) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private hashService: HashService,
    private usersRepository: UserRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: UpdatePasswordCommand) {
    const { code, password } = command;

    const user = await this.usersQueryRepository.getUserByRecoveryCode(code);
    if (!user) return null;

    const { salt, hash } = await this.hashService.generateSaltAndHash(password);
    await this.usersRepository.updateSaltAndHash(user.id, salt, hash);
  }
}
