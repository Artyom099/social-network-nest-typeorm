import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/user.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UserRepository) {}

  async execute(command: DeleteUserCommand) {
    await this.usersRepository.deleteUser(command.userId);
  }
}
