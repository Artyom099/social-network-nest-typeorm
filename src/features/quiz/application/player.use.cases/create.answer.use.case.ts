import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';

export class CreateAnswerCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase implements ICommandHandler<CreateAnswerCommand> {
  constructor(
    private playerQuizRepository: PlayerQuizRepository,
    private playerQuizQueryRepository: PlayerQuizQueryRepository,
  ) {}

  async execute(command: CreateAnswerCommand) {
    // todo - здесь мы проверяет правильность ответа игрока на вопрос
    // достаем игру,
    // достаем вопрос,
    // проверяем правильность ответа,
    // записываем результат в GamePair,
    // возвращаем игроку ответ

  }
}