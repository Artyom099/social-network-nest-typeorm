import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../infrastructure/quiz.repository';
import {
  AnswerStatus,
  InternalCode,
} from '../../../../infrastructure/utils/enums';
import { CreateAnswerDTO } from '../../api/models/dto/create.answer.dto';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Contract } from '../../../../infrastructure/core/contract';
import { Question } from '../../entity/question.entity';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class CreateAnswerCommand {
  constructor(public userId: string, public answer: string) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase
  implements ICommandHandler<CreateAnswerCommand>
{
  constructor(
    private dataSource: DataSource,
    private gameRepository: GameRepository,
    private quizRepository: QuizRepository,
    private playerRepository: PlayerRepository,
  ) {}

  async execute(command: CreateAnswerCommand): Promise<Contract<any>> {
    const { userId, answer } = command;
    let answerResult;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      // достаем игру по userId
      const currentGame = await this.gameRepository.getActiveGame(
        userId,
        manager,
      );
      console.log({ currentGame });

      if (currentGame.hasError() || !currentGame.payload) {
        console.log({ userId }, 'user have no active game');
        return new Contract(
          InternalCode.Forbidden,
          null,
          'user have no active game',
        );
      }

      const gameId = currentGame.payload.id;

      // достаем игроков по userId и gameId
      const currentPlayer = await this.playerRepository.getCurrentPlayer(
        userId,
        gameId,
        manager,
      );

      const otherPlayer = await this.playerRepository.getOtherPlayer(
        userId,
        gameId,
        manager,
      );

      // если игрок ответил на все вопросы - 403 || заменить 5 на количество вопросов?
      if (currentPlayer.answersCount >= 5) {
        console.log({ userId }, 'user have answer all questions');
        return new Contract(
          InternalCode.Forbidden,
          null,
          'user have answer all questions',
        );
      }

      // достаем вопрос по gameId и порядковому номеру
      const question = await this.quizRepository.getQuestion(
        gameId,
        currentPlayer.answersCount + 1,
        manager,
      );

      // если такого вопроса нет, значит они закончились
      if (!question) {
        console.log({ userId }, 'questions is over');
        return new Contract(InternalCode.Forbidden, null, 'questions is over');
      }

      // проверяем правильность ответа
      const answerStatus = this.checkAnswer(question, answer);

      // если ответ верный, добавляем игроку балл
      if (answerStatus === AnswerStatus.correct) {
        await this.playerRepository.increaseScore(currentPlayer.id, manager);
      }

      // если этот вопрос был последним, ставим игроку finishAnswersDate
      if (currentPlayer.answersCount + 1 >= 5) {
        await this.playerRepository.updateFinishAnswersDate(
          currentPlayer.id,
          manager,
        );
      }

      // если оба игрока ответили на все вопросы, завершаем игру
      if (
        currentPlayer.answersCount + 1 >= 5 &&
        otherPlayer.answersCount + 1 >= 5
      ) {
        await this.gameRepository.finishGame(gameId, manager);

        // достаем игроков, чтоб сравнить их время завершение игры
        const current = await this.playerRepository.getFinishTimeAndScore(
          currentPlayer.id,
          manager,
        );
        const other = await this.playerRepository.getFinishTimeAndScore(
          otherPlayer.id,
          manager,
        );

        // если игрок ответил первым, и у него есть хотя бы 1 верный ответ, добавляем ему балл
        if (
          current.finishAnswersDate < other.finishAnswersDate &&
          current.score > 0
        ) {
          await this.playerRepository.increaseScore(currentPlayer.id, manager);
        }
        if (
          current.finishAnswersDate > other.finishAnswersDate &&
          other.score > 0
        ) {
          await this.playerRepository.increaseScore(otherPlayer.id, manager);
        }
      }

      // увеличиваем игроку количество ответов на 1
      await this.playerRepository.increaseAnswersCount(
        currentPlayer.id,
        manager,
      );

      // возвращаем ответ
      const dto: CreateAnswerDTO = {
        id: randomUUID(),
        answer,
        answerStatus,
        questionId: question.id,
        playerId: currentPlayer.id,
      };
      answerResult = await this.quizRepository.createAnswer(dto, manager);

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log({ create_ans_error: e });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (answerResult.hasError())
      return new Contract(InternalCode.Internal_Server);

    console.log('create answer successfully');

    return new Contract(InternalCode.Success, answerResult.payload);
  }

  checkAnswer(question: Question, answer: string): AnswerStatus {
    return question.correctAnswers.includes(answer)
      ? AnswerStatus.correct
      : AnswerStatus.incorrect;
  }
}
