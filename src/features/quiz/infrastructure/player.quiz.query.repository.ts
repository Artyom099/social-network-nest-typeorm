import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {GameStatus} from '../../../infrastructure/utils/constants';
import {GameViewModel} from '../api/models/view/game.view.model';
import {AnswerViewModel} from '../api/models/view/answer.view.model';

@Injectable()
export class PlayerQuizQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // достаем 5 случайнах вопросов
  async getFiveQuestionsId() {
    return this.dataSource.query(`
    select "id"
    from question
    order by random()
    limit 5
    offset random()
    `,);
  }

  // достаем вопрос по айди игры и номеру вопроса
  async getQuestion(gameId: string, questionNumber: number) {
    const [question] = await this.dataSource.query(`
    select *
    from question q
    left join game_question gq
    on q."id" = gq."questionId"
    where gq."gameId" = $1 and gq."questionNumber" = $2
    `, [gameId, questionNumber]);

    return question ? question : null;
  }

  async getPlayerId(userId: string, gameId: string): Promise<string> {
    const [player] = await this.dataSource.query(`
    select *
    from player
    where "userId" = $1 and "gameId" = $2
    `, [userId, gameId]);

    return player ? player.id : null;
  }
  async getPlayer(userId: string, gameId: string) {
    const [player] = await this.dataSource.query(`
    select *
    from player
    where "userId" = $1 and "gameId" = $2
    `, [userId, gameId]);

    return player ? player : null;
  }

  async getUserIdByPlayerId(id: string): Promise<string> {
    const [userId] = await this.dataSource.query(`
      select "userId"
      from player pl 
      left join users u on u.id = pl."userId"
      where pl.id = $1
    `, [id]);

    return userId ? userId.userId : null;
  }
  async usersIdActiveGames() {
    const usersId = await this.dataSource.query(`
    select u."id"
    from player pl
    left join users u on u.id = pl."userId"
    left join game g on g."firstPlayerId" = pl.id
    where g.status = $1 or g.status = $2
    
    union
    
    select u."id"
    from player pl
    left join users u on u.id = pl."userId"
    left join game g on g."secondPlayerId" = pl.id
    where g.status = $1 or g.status = $2
    `, [GameStatus.active, GameStatus.pending]);

    return usersId ? usersId : [];
  }

  // достаем ответы по айди игрока
  async getPlayerAnswersForGame(playerId: string): Promise<AnswerViewModel[]> {
    const answers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `, [playerId]);

    return answers.map((a) => {
      return {
        questionId: a.questionId,
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      }
    });
  }

  async getPendingGame() {
    const [game] = await this.dataSource.query(`
    select *
    from game
    where "status" = $1
    `, [GameStatus.pending]);

    return game ? game : null;
  }

  async getGameById(id: string): Promise<GameViewModel | null> {
    const [game] = await this.dataSource.query(`
    select *,
           
      (select pl."login" as "firstPlayerLogin"
      from player pl 
      where pl."id" = g."firstPlayerId"),

      (select pl."login" as "secondPlayerLogin"
      from player pl 
      where pl."id" = g."secondPlayerId")
    
    from game g
    where g."id" = $1
    `, [id]);
    if (!game) return null;

    const questions = await this.dataSource.query(`
    select q."id", q."body"
    from game_question gq
        
    left join question q on q."id" = gq."questionId"
    
    where gq."gameId" = $1
    order by gq."questionNumber"
    `, [id])

    const firstPlayerAnswers = await this.dataSource.query(`
      select "questionId", "answerStatus", "addedAt"
      from answer
      where "playerId" = $1
    `, [game.firstPlayerId])
    const secondPlayerAnswers = await this.dataSource.query(`
      select "questionId", "answerStatus", "addedAt"
      from answer
      where "playerId" = $1
    `, [game.secondPlayerId])

    const [firstPlayerScore] = await this.dataSource.query(`
      select pl.score
      from player pl 
      where pl.id = $1
    `, [game.firstPlayerId]);
    const [secondPlayerScore] = await this.dataSource.query(`
      select pl.score
      from player pl 
      where pl.id = $1
    `, [game.secondPlayerId]);

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
      }
    }

    return game ? {
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
    } : null;
  }

  // достаем всех игроков этого юзера
  async getActiveOrPendingGame(userId: string): Promise<GameViewModel | null> {
    const [playerId] = await this.dataSource.query(`
    select p.id
    from player p 
    left join users u 
    on p."userId" = u.id
    where u.id = $1
    `, [userId]);
    if (!playerId) return null;

    const [game] = await this.dataSource.query(`
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
    `, [playerId.id, GameStatus.active, GameStatus.pending]);
    if (!game) return null;

    const questions = await this.dataSource.query(`
    select q."id", q."body"
    from game_question gq
    left join question q
    on q."id" = gq."questionId"
    where gq."gameId" = $1
    order by gq."questionNumber"
    `, [userId]);

    const firstPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `, [game.firstPlayerId]);
    const secondPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `, [game.secondPlayerId]);

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
      }
    }

    return game ? {
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
    } : null;
  }

  async getActiveGame(userId: string): Promise<GameViewModel | null> {
    const [playerId] = await this.dataSource.query(`
    select p.id
    from player p 
    left join users u 
    on p."userId" = u.id
    where u.id = $1
    `, [userId]);
    if (!playerId) return null;

    const [game] = await this.dataSource.query(`
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
    `, [playerId.id, GameStatus.active]);
    if (!game) return null;

    const questions = await this.dataSource.query(`
    select q."id", q."body"
    from game_question gq
    left join question q
    on q."id" = gq."questionId"
    where gq."gameId" = $1
    order by gq."questionNumber"
    `, [game.id]);

    const firstPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `, [game.firstPlayerId]);
    const secondPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where "playerId" = $1
    `, [game.secondPlayerId]);

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
      }
    }

    return game ? {
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
    } : null;
  }
}