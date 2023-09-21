import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {randomUUID} from 'crypto';
import {TokensService} from '../../../../infrastructure/services/tokens.service';
import {HashService} from '../../../../infrastructure/services/hash.service';
import {UsersQueryRepository} from '../../../users/infrastructure/users.query.repository';

export class CheckCredentialsCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase implements ICommandHandler<CheckCredentialsCommand> {
  constructor(
    private hashService: HashService,
    private tokensService: TokensService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: CheckCredentialsCommand) {
    const {loginOrEmail, password} = command
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    const hash = await this.hashService.generateHash(password, user.passwordSalt);
    if (user.passwordHash !== hash) {
      return null;
    } else {
      const payload = { userId: user.id, deviceId: randomUUID() };
      return this.tokensService.createJWT(payload)
    }
  }
}