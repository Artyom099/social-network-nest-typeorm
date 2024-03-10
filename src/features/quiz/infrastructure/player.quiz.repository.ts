import { Injectable } from '@nestjs/common';
import { EntityManager, InsertResult, UpdateResult } from 'typeorm';
import { InternalCode } from '../../../infrastructure/utils/enums';
import { Answer } from '../entity/answer.entity';
import { CreateAnswerDTO } from '../api/models/dto/create.answer.dto';
import { AnswerViewModel } from '../api/models/view/answer.view.model';
import { Player } from '../entity/player.entity';
import { CreatePlayerDTO } from '../api/models/dto/create.player.dto';
import { AddQuestionsToGameDto } from '../api/models/dto/add.questions.to.game.dto';
import { Contract } from '../../../infrastructure/core/contract';
import { GameQuestion } from '../entity/game.question.entity';

@Injectable()
export class PlayerQuizRepository {
  // player
  async createPlayer(
    dto: CreatePlayerDTO,
    manager: EntityManager,
  ): Promise<InsertResult> {
    return manager
      .createQueryBuilder()
      .insert()
      .into(Player)
      .values({
        id: dto.id,
        userId: dto.userId,
        login: dto.login,
        gameId: dto.gameId,
      })
      .execute();
  }

  async updatePlayersGameId(
    id: string,
    gameId: string,
    manager: EntityManager,
  ): Promise<UpdateResult> {
    return manager
      .createQueryBuilder()
      .update(Player)
      .set({ gameId: gameId })
      .where('id = :id', { id })
      .execute();
  }

  async updateFinishAnswersDate(
    id: string,
    manager: EntityManager,
  ): Promise<UpdateResult> {
    return manager
      .createQueryBuilder()
      .update(Player)
      .set({ finishAnswersDate: new Date() })
      .where('id = :id', { id })
      .execute();
  }

  async increaseScore(
    id: string,
    manager: EntityManager,
  ): Promise<UpdateResult> {
    return manager
      .createQueryBuilder()
      .update(Player)
      .set({ score: () => 'score + 1' })
      .where('id = :id', { id })
      .execute();
  }

  async increaseAnswersCount(
    id: string,
    manager: EntityManager,
  ): Promise<UpdateResult> {
    return manager
      .createQueryBuilder()
      .update(Player)
      .set({ answersCount: () => 'answersCount + 1' })
      .where('id = :id', { id })
      .execute();
  }

  // answer
  async createAnswer(
    dto: CreateAnswerDTO,
    manager: EntityManager,
  ): Promise<Contract<AnswerViewModel>> {
    await manager
      .createQueryBuilder()
      .insert()
      .into(Answer)
      .values({
        id: dto.id,
        answer: dto.answer,
        questionId: dto.questionId,
        answerStatus: dto.answerStatus,
        playerId: dto.playerId,
      })
      .execute();

    const [answer] = await manager.query(
      `
      select *
      from answer
      where "id" = $1
    `,
      [dto.id],
    );

    if (!answer) return new Contract(InternalCode.Internal_Server);

    return new Contract(InternalCode.Success, {
      questionId: answer.questionId,
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    });
  }

  // game_question
  async createFiveGameQuestions(
    dto: AddQuestionsToGameDto,
    manager: EntityManager,
  ): Promise<void> {
    let questionNumber = 1;

    for (const questionId of dto.questionsId) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(GameQuestion)
        .values({
          gameId: dto.gameId,
          questionId: questionId,
          questionNumber: questionNumber,
        })
        .execute();

      questionNumber++;
    }
  }
}
