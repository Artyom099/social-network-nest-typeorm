import { HashService } from '../../../../infrastructure/services/hash.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../../../user/api/models/input/create.user.input.model';
import { UserViewModel } from '../../../user/api/models/view/user.view.model';
import { UserRepository } from '../../../user/infrastructure/user.repository';
import add from 'date-fns/add';
import { randomUUID } from 'crypto';
import { EmailManager } from '../../../../infrastructure/email/email.manager';
import { CreateUserDTO } from '../../../user/api/models/dto/create.user.dto';

export class RegisterUserCommand {
  constructor(public inputModel: CreateUserInputModel) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersService: HashService,
    private usersRepository: UserRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserViewModel | null> {
    const { login, email, password } = command.inputModel;

    const { salt, hash } = await this.usersService.generateSaltAndHash(
      password,
    );

    const dto: CreateUserDTO = {
      id: randomUUID(),
      inputModel: command.inputModel,
      salt,
      hash,
      expirationDate: add(new Date(), { minutes: 20 }),
      confirmationCode: randomUUID(),
      isConfirmed: false,
    };
    try {
      //await
      this.emailManager.sendEmailConfirmationCode(email, dto.confirmationCode);
    } catch (e) {
      return null;
    }
    return this.usersRepository.createUserBySelf(dto);
  }
}
