import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';

export class CreatePairCommand {
  constructor() {}
}

@CommandHandler(CreatePairCommand)
export class CreatePairUseCase implements ICommandHandler<CreatePairCommand> {
  constructor(private playerRepository: PlayerQuizRepository) {}

  async execute(command: CreatePairCommand) {
    // смотрим, ждет ли кто-то пару
    // если да, то добавляем игрока в эту пару и начинаем игру
    // иначе ждем следующего игрока
    const dto = {}
  }
}