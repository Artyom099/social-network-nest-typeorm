import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';
import {AnswerStatus} from '../../../../infrastructure/utils/constants';
import {CreateAnswerDTO} from '../../api/models/dto/create.answer.dto';
import {randomUUID} from 'crypto';
import {ForbiddenException} from '@nestjs/common';

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
    const currentGame = await this.playerQuizQueryRepository.getActiveGame(command.userId);
    console.log({ currentGame: currentGame });
    if (!currentGame || !currentGame.questions) {
      console.log('1---');
      throw new ForbiddenException();
    }

    // достаем плеера по userId и gameId
    const player = await this.playerQuizQueryRepository.getPlayer(command.userId, currentGame.id);
    console.log(currentGame.questions.length);
    console.log(player.answersCount);

    // если игрок ответил на все вопросы, возвращаем 403
    if (player.answersCount === 5) {
      console.log('2---');
      return new ForbiddenException();
    }

    // достаем вопрос по айди игры и порядковому номеру
    const question = await this.playerQuizQueryRepository.getQuestion(currentGame.id, player.answersCount + 1);

    // проверяем правильность ответа
    const answerStatus = question.correctAnswers.includes(command.answer) ? AnswerStatus.correct : AnswerStatus.incorrect;

    //если ответ верный, добавляем игроку балл
    if (answerStatus === AnswerStatus.correct) {
      await this.playerQuizRepository.increaseScore(player.id);
    }

    // если вопрос был последний, завершаем игру
    if (currentGame.questions.length === player.answersCount + 1) {
      await this.playerQuizRepository.finishGame(currentGame.id);
    }

    const dto: CreateAnswerDTO = {
      id: randomUUID(),
      answer: command.answer,
      answerStatus,
      addedAt: new Date(),
      questionId: question.id,
      playerId: player.id,
    };
    // увеличиваем игроку answersCount
    await this.playerQuizRepository.increaseAnswersCount(player.id);
    // возвращаем ответ
    return this.playerQuizRepository.createAnswer(dto);
  }
}