import {HashService} from '../../../../infrastructure/services/hash.service';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateUserInputModel} from '../../api/models/input/create.user.input.model';
import {SAUserViewModel} from '../../api/models/view/sa.user.view.model';
import {UsersRepository} from '../../infrastructure/users.repository';
import add from 'date-fns/add';
import {randomUUID} from 'crypto';

export class CreateUserByAdminCommand {
  constructor(public InputModel: CreateUserInputModel) {}
}

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private usersService: HashService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateUserByAdminCommand): Promise<SAUserViewModel> {
    const { InputModel } = command;
    const { salt, hash } = await this.usersService.generateSaltAndHash(InputModel.password);

    const createUserDTO = {
      id: randomUUID(),
      InputModel,
      salt,
      hash,
      expirationDate: add(new Date(), { minutes: 20 }),
      confirmationCode: randomUUID(),
      isConfirmed: true,
    }
    return this.usersRepository.createUserByAdmin(createUserDTO);
  }
}
