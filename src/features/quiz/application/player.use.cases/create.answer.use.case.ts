import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';
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
  ) {}

  //todo - добавить кейс, что игрок ответил на все вопросы и ждет ответов другого игрока
  //todo - как завершить игру, только когда оба игрока ответили на все вопросы
  // и в то же время не давать игроку отвечать, когда он ответил все вопросы и ждет другого игрока?
  async execute(command: CreateAnswerCommand) {
    // достаем игру по юзеру
    const currentGame = await this.playerQuizQueryRepository.getActiveGame(command.userId)
    if (!currentGame || !currentGame.gameQuestions) throw new Error('no active game')

    const playerId = await this.playerQuizQueryRepository.getPlayerId(command.userId, currentGame.id)
    const playerAnswers = await this.playerQuizQueryRepository.getPlayerAnswersForGame(playerId)
    if (currentGame.gameQuestions.length === playerAnswers.length) {
      throw new Error('player already answer all questions')
    }

    // достаем вопрос по айди игры и порядковому номеру
    const question = await this.playerQuizQueryRepository.getQuestion(currentGame.id, playerAnswers.length)

    // проверяем правильность ответа
    const answerStatus = question.correctAnswers.includes(command.answer) ? AnswerStatus.correct : AnswerStatus.incorrect

    //если ответ верный, добавляем игроку балл
    if (answerStatus === AnswerStatus.correct) {
      await this.playerQuizRepository.increaseScore(playerId)
    }

    // если вопрос был последний, завершаем игру
    if (currentGame.gameQuestions.length === playerAnswers.length + 1) {
      await this.playerQuizRepository.finishGame(currentGame.id)
    }

    // возвращаем игроку ответ
    const dto: CreateAnswerDTO = {
      id: randomUUID(),
      answer: command.answer,
      answerStatus,
      addedAt: new Date(),
      questionId: question.id,
      playerId: playerId,
    }
    return this.playerQuizRepository.createAnswer(dto)
  }
}