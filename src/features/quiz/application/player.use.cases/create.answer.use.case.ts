import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PlayerQuizRepository } from "../../infrastructure/player.quiz.repository";
import { PlayerQuizQueryRepository } from "../../infrastructure/player.quiz.query.repository";
import {
  AnswerStatus,
  InternalCode,
} from "../../../../infrastructure/utils/enums";
import { CreateAnswerDTO } from "../../api/models/dto/create.answer.dto";
import { randomUUID } from "crypto";
import { ForbiddenException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ContractDto } from "../../../../infrastructure/core/contract.dto";

export class CreateAnswerCommand {
  constructor(public userId: string, public answer: string) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase
  implements ICommandHandler<CreateAnswerCommand>
{
  constructor(
    private dataSource: DataSource,
    private playerQuizRepository: PlayerQuizRepository,
    private playerQuizQueryRepository: PlayerQuizQueryRepository
  ) {}

  async execute(command: CreateAnswerCommand) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { userId, answer } = command;

    try {
      // достаем игру по userId
      const currentGame = await this.playerQuizQueryRepository.getActiveGame(
        command.userId
      );
      if (!currentGame) {
        console.log("1---");
        return new ContractDto(InternalCode.Forbidden);
      }

      // достаем игроков по userId и gameId
      const currentPlayer =
        await this.playerQuizQueryRepository.getCurrentPlayer(
          userId,
          currentGame.id
        );
      const otherPlayer = await this.playerQuizQueryRepository.getOtherPlayer(
        userId,
        currentGame.id
      );

      // если игрок ответил на все вопросы, возвращаем 403 - заменить 5 на количество вопросов?
      if (currentPlayer.answersCount >= 5) {
        console.log("2---");
        return new ContractDto(InternalCode.Forbidden);
      }

      // достаем вопрос по gameId и порядковому номеру
      const question = await this.playerQuizQueryRepository.getQuestion(
        currentGame.id,
        currentPlayer.answersCount + 1
      );
      // есди такого вопроса нет, значит они закончились
      if (!question) {
        console.log("3---");
        return new ContractDto(InternalCode.Forbidden);
      }

      // проверяем правильность ответа
      const answerStatus = question.correctAnswers.includes(answer)
        ? AnswerStatus.correct
        : AnswerStatus.incorrect;

      // если ответ верный, добавляем игроку балл
      if (answerStatus === AnswerStatus.correct) {
        await this.playerQuizRepository.increaseScore(currentPlayer.id);
      }

      // увеличиваем игроку answersCount
      await this.playerQuizRepository.increaseAnswersCount(currentPlayer.id);

      // если этот вопрос был последним, ставим игроку finishAnswersDate
      if (currentPlayer.answersCount + 1 >= 5) {
        await this.playerQuizRepository.updateFinishAnswersDate(
          currentPlayer.id
        );
      }

      // если оба игрока ответили на все вопросы, завершаем игру
      if (
        currentPlayer.answersCount + 1 >= 5 &&
        otherPlayer.answersCount + 1 >= 5
      ) {
        await this.playerQuizRepository.finishGame(currentGame.id);
      }

      // достаем игроков, чтоб сравнить их время завершение игры
      const current = await this.playerQuizQueryRepository.getCurrentPlayer(
        userId,
        currentGame.id
      );
      const other = await this.playerQuizQueryRepository.getOtherPlayer(
        userId,
        currentGame.id
      );

      console.log({ current: current.finishAnswersDate });
      console.log({ other: other.finishAnswersDate });

      // если игрок ответил первым, и у него есть хотя бы 1 верный ответ, добавляем ему балл
      if (
        current.finishAnswersDate < other.finishAnswersDate &&
        current.score > 0
      ) {
        await this.playerQuizRepository.increaseScore(currentPlayer.id);
      }
      if (
        current.finishAnswersDate > other.finishAnswersDate &&
        other.score > 0
      ) {
        await this.playerQuizRepository.increaseScore(otherPlayer.id);
      }

      // возвращаем ответ
      const dto: CreateAnswerDTO = {
        id: randomUUID(),
        answer: answer,
        answerStatus,
        addedAt: new Date(),
        questionId: question.id,
        playerId: currentPlayer.id,
      };
      const answerResult = await this.playerQuizRepository.createAnswer(dto);

      await queryRunner.commitTransaction();

      if (answerResult.hasError())
        return new ContractDto(InternalCode.Internal_Server);
      return new ContractDto(InternalCode.Success, answerResult.payload);
    } catch (e) {
      console.log({ error: e });
      await queryRunner.rollbackTransaction();
      return new ContractDto(InternalCode.Internal_Server);
    } finally {
      await queryRunner.release();
    }
  }
}
