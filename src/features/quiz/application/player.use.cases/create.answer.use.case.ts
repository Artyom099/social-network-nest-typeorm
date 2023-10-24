import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';
import {SAQuizQueryRepository} from '../../infrastructure/sa.quiz.query.repository';
import {AnswerStatus} from '../../../../infrastructure/utils/constants';
import {CreateAnswerDTO} from '../../api/models/dto/create.answer.dto';
import {randomUUID} from 'crypto';

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
    private saQuizQueryRepository: SAQuizQueryRepository,
  ) {}

  async execute(command: CreateAnswerCommand) {
    // здесь мы проверяем правильность ответа игрока на вопрос
    // достаем игру по юзеру,
    const currentGame = await this.playerQuizQueryRepository.getCurrentGame(command.userId)
    if (!currentGame || !currentGame.questions) return null;

    const playerId = await this.playerQuizQueryRepository.getPlayer(command.userId, currentGame.id)

    // узнаем номер текущего вопроса
    const questionNumber = currentGame.firstPlayerProgress.answers.length

    // достаем вопрос по айди,
    const question = await this.saQuizQueryRepository.getQuestion(currentGame.questions[questionNumber].id)

    // проверяем правильность ответа,
    const answerStatus = command.answer in question!.correctAnswers ? AnswerStatus.correct : AnswerStatus.incorrect

    // возвращаем игроку ответ
    const dto: CreateAnswerDTO = {
      id: randomUUID(),
      answer: command.answer,
      answerStatus,
      addedAt: new Date(),
      questionId: currentGame.questions[questionNumber].id,
      playerId,
    }
    return this.playerQuizRepository.createAnswer(dto)
  }
}