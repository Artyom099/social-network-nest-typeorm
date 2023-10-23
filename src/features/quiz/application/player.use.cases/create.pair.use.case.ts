import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerRepository} from '../../infrastructure/player.repository';

export class CreatePairCommand {
  constructor() {}
}

@CommandHandler(CreatePairCommand)
export class CreatePairUseCase implements ICommandHandler<CreatePairCommand> {
  constructor(private playerRepository: PlayerRepository) {}

  async execute(command: CreatePairCommand) {
    // смотрим, ждет ли кто-то пару
    // если да, то добавляем игрока в эту пару и начинаем игру
    // иначе ждем следующего игрока
    const dto = {}
  }
}