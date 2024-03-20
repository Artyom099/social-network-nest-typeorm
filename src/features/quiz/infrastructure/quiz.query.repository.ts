import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GameStatus, InternalCode } from '../../../infrastructure/utils/enums';
import { GameViewModel } from '../api/models/view/game.view.model';
import { Contract } from '../../../infrastructure/core/contract';

@Injectable()
export class QuizQueryRepository {
  constructor(private dataSource: DataSource) {}

  // game
  async getGameById(id: string): Promise<GameViewModel | null> {
    const [game] = await this.dataSource.query(
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
      [id],
    );
    if (!game) return null;

    const questions = await this.dataSource.query(
      `
    select q."id", q."body"
    from game_question gq
        
    left join question q on q."id" = gq."questionId"
    
    where gq."gameId" = $1
    order by gq."questionNumber"
    `,
      [id],
    );

    const firstPlayerAnswers = await this.dataSource.query(
      `
      select "questionId", "answerStatus", "addedAt"
      from answer
      where "playerId" = $1
    `,
      [game.firstPlayerId],
    );
    const secondPlayerAnswers = await this.dataSource.query(
      `
      select "questionId", "answerStatus", "addedAt"
      from answer
      where "playerId" = $1
    `,
      [game.secondPlayerId],
    );

    const [firstPlayerScore] = await this.dataSource.query(
      `
      select pl.score
      from player pl 
      where pl.id = $1
    `,
      [game.firstPlayerId],
    );
    const [secondPlayerScore] = await this.dataSource.query(
      `
      select pl.score
      from player pl 
      where pl.id = $1
    `,
      [game.secondPlayerId],
    );

    if (!game.secondPlayerId) {
      return {
        id: game.id,
        firstPlayerProgress: {
          answers: firstPlayerAnswers,
          player: {
            id: game.firstPlayerId,
            login: game.firstPlayerLogin,
          },
          score: firstPlayerScore.score ? firstPlayerScore.score : 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: game.status,
        pairCreatedDate: game.pairCreatedDate,
        startGameDate: game.startGameDate,
        finishGameDate: game.finishGameDate,
      };
    }

    return game
      ? {
          id: game.id,
          firstPlayerProgress: {
            answers: firstPlayerAnswers,
            player: {
              id: game.firstPlayerId,
              login: game.firstPlayerLogin,
            },
            score: firstPlayerScore.score ? firstPlayerScore.score : 0,
          },
          secondPlayerProgress: {
            answers: secondPlayerAnswers,
            player: {
              id: game.secondPlayerId,
              login: game.secondPlayerLogin,
            },
            score: secondPlayerScore.score ? secondPlayerScore.score : 0,
          },
          questions: questions,
          status: game.status,
          pairCreatedDate: game.pairCreatedDate,
          startGameDate: game.startGameDate,
          finishGameDate: game.finishGameDate,
        }
      : null;
  }

  async getActiveOrPendingGame(
    userId: string,
  ): Promise<Contract<GameViewModel | null>> {
    const playersId = await this.dataSource.query(
      `
    select p.id
    from player p 
    left join users u 
    on p."userId" = u.id
    where u.id = $1
    `,
      [userId],
    );

    if (!playersId) return new Contract(InternalCode.NotFound);
    const arrOfPlayersId = playersId.map((pl) => pl.id);

    const [game] = await this.dataSource.query(
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
    where (g."firstPlayerId" = any($1) or g."secondPlayerId" = any($1))
    and ("status" = $2 or "status" = $3)
    `,
      [arrOfPlayersId, GameStatus.active, GameStatus.pending],
    );
    // Поиск значения в массиве - g."firstPlayerId" = any($1);
    if (!game)
      return new Contract(
        InternalCode.NotFound,
        null,
        'active or pending game not found',
      );

    const questions = await this.dataSource.query(
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

    const firstPlayerAnswers = await this.dataSource.query(
      `
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `,
      [game.firstPlayerId],
    );

    const secondPlayerAnswers = await this.dataSource.query(
      `
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `,
      [game.secondPlayerId],
    );

    if (!game.secondPlayerId)
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
        secondPlayerProgress: null,
        questions: null,
        status: game.status,
        pairCreatedDate: game.pairCreatedDate,
        startGameDate: game.startGameDate,
        finishGameDate: game.finishGameDate,
      });

    if (game) {
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
    } else {
      return new Contract(InternalCode.Internal_Server);
    }
  }

  // player

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
