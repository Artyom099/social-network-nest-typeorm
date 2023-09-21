import {HashService} from '../../../../infrastructure/services/hash.service';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateUserInputModel} from '../../../users/api/models/input/create.user.input.model';
import {UserViewModel} from '../../../users/api/models/view/user.view.model';
import {UsersRepository} from '../../../users/infrastructure/users.repository';
import add from 'date-fns/add';
import {randomUUID} from 'crypto';
import {EmailManager} from '../../../../infrastructure/services/email.manager';

export class RegisterUserCommand {
  constructor(public InputModel: CreateUserInputModel) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private emailManager: EmailManager,
    private usersService: HashService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserViewModel | null> {
    const { InputModel} = command;
    const { salt, hash } = await this.usersService.generateSaltAndHash(InputModel.password);

    const createUserDTO = {
      id: randomUUID(),
      InputModel,
      salt,
      hash,
      expirationDate: add(new Date(), { minutes: 20 }),
      confirmationCode: randomUUID(),
      isConfirmed: false,
    }
    try {
      //await
      this.emailManager.sendEmailConfirmationCode(InputModel.email, createUserDTO.confirmationCode);
    } catch (error) {
      return null;
    }
    return this.usersRepository.createUserBySelf(createUserDTO);
  }
}
