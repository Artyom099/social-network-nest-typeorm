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

  async finishGame(id: string, manager: EntityManager): Promise<UpdateResult> {
    return manager
      .createQueryBuilder()
      .update(Game)
      .set({ status: GameStatus.finished, finishGameDate: new Date() })
      .where('id = :id', { id })
      .execute();
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

    const [game] = await manager.query(
      `
    select *,
    
      (select pl."login" as "firstPlayerLogin"
      from player pl 
      where pl."id" = g."firstPlayerId"),

      (select pl."login" as "secondPlayerLogin"
      from player pl
      where pl."id" = g."secondPlayerId")

    from game g
    where g."id" = $1
    `,
      [dto.id],
    );

    if (!game) return new Contract(InternalCode.Internal_Server);

    const activeGameView = {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.firstPlayerId,
          login: game.firstPlayerLogin,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: game.secondPlayerId,
          login: game.secondPlayerLogin,
        },
        score: 0,
      },
      questions: [],
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };

    return new Contract(InternalCode.Success, activeGameView);
  }
}
