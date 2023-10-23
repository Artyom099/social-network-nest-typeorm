import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';

export class CreateAnswerCommand {
  constructor(
    public userId: string,
    public answer: string,
    ) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase implements ICommandHandler<CreateAnswerCommand> {
  constructor(private playerRepository: PlayerQuizRepository) {}

  async execute(command: CreateAnswerCommand) {
    // todo - здесь мы проверяет правильность ответа игрока на вопрос
    // достаем вопрос,
    // проверяем правильность ответа,
    // записываем результат в GamePair,
    // возвращаем игроку ответ

  }
}