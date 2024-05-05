import { DataSource, EntityManager, InsertResult, UpdateResult } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreatePlayerDTO } from '../api/models/dto/create.player.dto';
import { Player } from '../entity/player.entity';

@Injectable()
export class PlayerRepository {
  constructor(private dataSource: DataSource) {}

  async getPlayerIds(userId: string, manager: EntityManager) {
    const playerIds = await manager.query(
      `
    select id
    from player
    where "userId" = $1
    `,
      [userId],
    );

    return playerIds ? playerIds.map((el) => el.id) : null;
  }

  async getOtherPlayer(userId: string, gameId: string, manager: EntityManager) {
    const [player] = await manager.query(
      `
    select *
    from player
    where "userId" != $1 and "gameId" = $2
    `,
      [userId, gameId],
    );

    return player ? player : null;
  }

  async getFinishTimeAndScore(id: string, manager: EntityManager) {
    const [player] = await manager.query(
      `
      select "finishAnswersDate", score
      from player
      where id = $1
    `,
      [id],
    );

    return player ? player : null;
  }

  async getCurrentPlayer(
    userId: string,
    gameId: string,
    manager: EntityManager,
  ) {
    const [player] = await manager.query(
      `
    select *
    from player
    where "userId" = $1 and "gameId" = $2
    `,
      [userId, gameId],
    );

    return player ? player : null;
  }

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
      .set({ finishAnswersDate: new Date(), isActive: false })
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

  async getUserIdByPlayerId(id: string): Promise<string> {
    const [player] = await this.dataSource.query(
      `
      select "userId"
      from player
      where id = $1
    `,
      [id],
    );

    return player ? player.userId : null;
  }
}
