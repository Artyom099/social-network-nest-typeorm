import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GameStatus, InternalCode } from '../../../infrastructure/utils/enums';
import {
  AnswersType,
  GameViewModel,
  questionsType,
} from '../api/models/view/game.view.model';
import { Contract } from '../../../infrastructure/core/contract';

@Injectable()
export class GameQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getGameById(id: string): Promise<GameViewModel | null> {
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

    if (!game.secondPlayerId) {
      return {
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
      };
    }

    return game
      ? this.mapToView(game, questions, firstPlayerAnswers, secondPlayerAnswers)
      : null;
  }

  async getActiveOrPendingGame(
    userId: string,
  ): Promise<Contract<GameViewModel | null>> {
    // достаем активного игрока
    const [player] = await this.dataSource.query(
      `
    select p.id
    from player p 
    left join users u 
    on p."userId" = u.id
    where u.id = $1 and p."isActive" = $2
    `,
      [userId, true],
    );

    if (!player) return new Contract(InternalCode.NotFound);

    // достаем игру активного игрока
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
    where (g."firstPlayerId" = $1 or g."secondPlayerId" = $1)
    and ("status" = $2 or "status" = $3)
    `,
      [player.id, GameStatus.active, GameStatus.pending],
    );

    // Поиск значения в массиве - g."firstPlayerId" = any($1) ) or g."secondPlayerId" = any($1);
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
      return new Contract(
        InternalCode.Success,
        this.mapToView(
          game,
          questions,
          firstPlayerAnswers,
          secondPlayerAnswers,
        ),
      );
    } else {
      return new Contract(InternalCode.Internal_Server);
    }
  }

  mapToView(
    game,
    questions: questionsType[],
    firstPlayerAnswers: AnswersType[],
    secondPlayerAnswers: AnswersType[],
  ): GameViewModel {
    return {
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
    };
  }
}
