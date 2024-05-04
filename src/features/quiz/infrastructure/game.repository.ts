import { Injectable } from '@nestjs/common';
import { CreateGameDto } from '../api/models/dto/create.game.dto';
import { EntityManager, UpdateResult } from 'typeorm';
import { Contract } from '../../../infrastructure/core/contract';
import { GameViewModel } from '../api/models/view/game.view.model';
import { Game } from '../entity/game.entity';
import { GameStatus, InternalCode } from '../../../infrastructure/utils/enums';
import { AddPlayerToGameDto } from '../api/models/dto/add.player.to.game.dto';

@Injectable()
export class GameRepository {
  async getPendingGame(manager: EntityManager): Promise<Contract<Game | null>> {
    const game = await manager.findOneBy(Game, {
      status: GameStatus.pending,
    });

    if (!game)
      return new Contract(
        InternalCode.NotFound,
        null,
        'pending game not found',
      );

    return new Contract(InternalCode.Success, game);
  }

  async getActiveGame(
    userId: string,
    manager: EntityManager,
  ): Promise<Contract<GameViewModel | null>> {
    // достаем игрока по userId и isActive
    const [playerId] = await manager.query(
      `
    select p.id
    from player p 
    left join users u 
    on p."userId" = u.id
    where u.id = $1 and p."isActive" = $2
    `,
      [userId, true],
    );

    console.log({ playerId });

    if (!playerId)
      return new Contract(InternalCode.NotFound, null, 'playerId not found');

    const [game] = await manager.query(
      `
    select *,

      (select pl.login as "firstPlayerLogin"
      from player pl
      where pl."id" = g."firstPlayerId"),
      
      (select pl.score as "firstPlayerScore"
      from player pl
      where pl."id" = g."firstPlayerId"),
      
      (select pl.login as "secondPlayerLogin"
      from player pl 
      where pl."id" = g."secondPlayerId"),
      
      (select pl.score as "secondPlayerScore"
      from player pl 
      where pl."id" = g."secondPlayerId")
    
    from game g
    where ("firstPlayerId" = $1 or "secondPlayerId" = $1)
    and status = $2
    `,
      [playerId.id, GameStatus.active],
    );

    if (!game)
      return new Contract(InternalCode.NotFound, null, 'game not found');

    const questions = await manager.query(
      `
    select q."id", q."body"
    from game_question gq
    left join question q
    on q."id" = gq."questionId"
    where gq."gameId" = $1
    order by gq."questionNumber"
    `,
      [game.id],
    );

    const firstPlayerAnswers = await manager.query(
      `
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `,
      [game.firstPlayerId],
    );
    const secondPlayerAnswers = await manager.query(
      `
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `,
      [game.secondPlayerId],
    );

    return new Contract(InternalCode.Success, {
      id: game.id,
      firstPlayerProgress: {
        answers: firstPlayerAnswers,
        player: {
          id: game.firstPlayerId,
          login: game.firstPlayerLogin,
        },
        score: game.firstPlayerScore,
      },
      secondPlayerProgress: {
        answers: secondPlayerAnswers,
        player: {
          id: game.secondPlayerId,
          login: game.secondPlayerLogin,
        },
        score: game.secondPlayerScore,
      },
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    });
  }

  async createGame(
    dto: CreateGameDto,
    manager: EntityManager,
  ): Promise<Contract<GameViewModel>> {
    await manager
      .createQueryBuilder()
      .insert()
      .into(Game)
      .values({
        id: dto.id,
        status: dto.status,
        pairCreatedDate: dto.pairCreatedDate,
        firstPlayerId: dto.firstPlayerId,
      })
      .execute();

    const [game] = await manager.query(
      `
    select *
    from game g
    where g."id" = $1
    `,
      [dto.id],
    );

    const [player] = await manager.query(
      `
    select *
    from player pl
    left join users u on pl."userId" = u.id
    where pl.id = $1
    `,
      [game.firstPlayerId],
    );

    if (!game || !player) return new Contract(InternalCode.Internal_Server);

    const pendingGameView = {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.firstPlayerId,
          login: player.login,
        },
        score: player.score,
      },
      secondPlayerProgress: null,
      questions: null,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };

    return new Contract(InternalCode.Success, pendingGameView);
  }

  async addPlayerToGame(
    dto: AddPlayerToGameDto,
    manager: EntityManager,
  ): Promise<Contract<GameViewModel>> {
    await manager
      .createQueryBuilder()
      .update(Game)
      .set({
        secondPlayerId: dto.secondPlayerId,
        startGameDate: new Date(),
        status: GameStatus.active,
      })
      .where('id = :id', { id: dto.id })
      .execute();

    return new Contract(InternalCode.Success);
  }

  async finishGame(id: string, manager: EntityManager): Promise<UpdateResult> {
    return manager
      .createQueryBuilder()
      .update(Game)
      .set({ status: GameStatus.finished, finishGameDate: new Date() })
      .where('id = :id', { id })
      .execute();
  }
}
