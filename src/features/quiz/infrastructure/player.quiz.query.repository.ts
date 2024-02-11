import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GameStatus, InternalCode } from '../../../infrastructure/utils/enums';
import { GameViewModel } from '../api/models/view/game.view.model';
import { ContractDto } from '../../../infrastructure/core/contract.dto';
import { Game } from '../entity/game.entity';
import { Question } from '../entity/question.entity';

@Injectable()
export class PlayerQuizQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // game
  async getPendingGame(): Promise<ContractDto<Game | null>> {
    const [game] = await this.dataSource.query(
      `
    select *
    from game
    where "status" = $1
    `,
      [GameStatus.pending],
    );

    if (!game)
      return new ContractDto(
        InternalCode.NotFound,
        null,
        'pending game not found',
      );

    return new ContractDto(InternalCode.Success, game);
  }

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

  async getActiveGame(userId: string): Promise<GameViewModel | null> {
    const [playerId] = await this.dataSource.query(
      `
    select p.id
    from player p 
    left join users u 
    on p."userId" = u.id
    where u.id = $1
    `,
      [userId],
    );
    if (!playerId) return null;

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
    where ("firstPlayerId" = $1 or "secondPlayerId" = $1)
    and status = $2
    `,
      [playerId.id, GameStatus.active],
    );
    if (!game) return null;

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

    return game
      ? {
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
        }
      : null;
  }

  async getActiveOrPendingGame(
    userId: string,
  ): Promise<ContractDto<GameViewModel | null>> {
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
    if (!playersId) return new ContractDto(InternalCode.NotFound);
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
      return new ContractDto(
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
      return new ContractDto(InternalCode.Success, {
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
      return new ContractDto(InternalCode.Success, {
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
      return new ContractDto(InternalCode.Internal_Server);
    }
  }

  // player
  async getCurrentPlayer(userId: string, gameId: string) {
    const [player] = await this.dataSource.query(
      `
    select *
    from player
    where "userId" = $1 and "gameId" = $2
    `,
      [userId, gameId],
    );

    return player ? player : null;
  }

  async getOtherPlayer(userId: string, gameId: string) {
    const [player] = await this.dataSource.query(
      `
    select *
    from player
    where "userId" != $1 and "gameId" = $2
    `,
      [userId, gameId],
    );

    return player ? player : null;
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

  // question
  async getQuestion(
    gameId: string,
    questionNumber: number,
  ): Promise<Question | null> {
    // достаем вопрос по айди игры и номеру вопроса

    const [question] = await this.dataSource.query(
      `
    select *
    from question q
    left join game_question gq
    on q."id" = gq."questionId"
    where gq."gameId" = $1 and gq."questionNumber" = $2
    `,
      [gameId, questionNumber],
    );

    return question ? question : null;
  }

  async getFiveQuestionsId() {
    // достаем 5 случайнах вопросов
    return this.dataSource.query(`
    select "id"
    from question
    order by random()
    limit 5
    offset random()
    `);
  }
}
