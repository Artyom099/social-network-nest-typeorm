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

  async execute(command: CreateAnswerCommand) {
    // достаем игру по userId
    const currentGame = await this.playerQuizQueryRepository.getActiveGame(command.userId);
    if (!currentGame) {
      console.log('1---');
      throw new ForbiddenException();
    }

    // достаем игроков по userId и gameId
    const currentPlayer = await this.playerQuizQueryRepository.getCurrentPlayer(command.userId, currentGame.id);
    const otherPlayer = await this.playerQuizQueryRepository.getOtherPlayer(command.userId, currentGame.id);

    // если игрок ответил на все вопросы, возвращаем 403 - заменить 5 на количество вопросов?
    if (currentPlayer.answersCount >= 5) {
      console.log('2---');
      throw new ForbiddenException();
    }

    // достаем вопрос по gameId и порядковому номеру
    const question = await this.playerQuizQueryRepository.getQuestion(currentGame.id, currentPlayer.answersCount + 1);
    if (!question) {
      console.log('3---');
      throw new ForbiddenException();
    }

    // проверяем правильность ответа
    const answerStatus = question.correctAnswers.includes(command.answer) ? AnswerStatus.correct : AnswerStatus.incorrect;

    // если ответ верный, добавляем игроку балл
    if (answerStatus === AnswerStatus.correct) {
      await this.playerQuizRepository.increaseScore(currentPlayer.id);
    }

    // если оба игрока ответили на все вопросы, завершаем игру
    if (currentPlayer.answersCount + 1 >= 5 && otherPlayer.answersCount + 1 >= 5) {
      // todo - если игрок ответил первым, и у него есть хотя бы 1 верный ответ, добавляем ему 1 балл - как это сделать?
      await this.playerQuizRepository.finishGame(currentGame.id);
    }

    const dto: CreateAnswerDTO = {
      id: randomUUID(),
      answer: command.answer,
      answerStatus,
      addedAt: new Date(),
      questionId: question.id,
      playerId: currentPlayer.id,
    };
    // увеличиваем игроку answersCount
    await this.playerQuizRepository.increaseAnswersCount(currentPlayer.id);

    // если текущий игрок ответил первым, добавляем ему 1 балл
    if (currentPlayer.answersCount + 1 >= 5 && otherPlayer.answersCount < 5) {
      await this.playerQuizRepository.increaseAnswersCount(currentPlayer.id);
    }

    // возвращаем ответ
    return this.playerQuizRepository.createAnswer(dto);
  }
}