import { HashService } from '../../../../infrastructure/services/hash.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../../api/models/input/create.user.input.model';
import { SAUserViewModel } from '../../api/models/view/sa.user.view.model';
import { UserRepository } from '../../infrastructure/user.repository';
import add from 'date-fns/add';
import { randomUUID } from 'crypto';
import { CreateUserDTO } from '../../api/models/dto/create.user.dto';

export class CreateUserByAdminCommand {
  constructor(public inputModel: CreateUserInputModel) {}
}

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private usersService: HashService,
    private usersRepository: UserRepository,
  ) {}

  async execute(command: CreateUserByAdminCommand): Promise<SAUserViewModel> {
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
      isConfirmed: true,
    };
    return this.usersRepository.createUserByAdmin(dto);
  }
}
