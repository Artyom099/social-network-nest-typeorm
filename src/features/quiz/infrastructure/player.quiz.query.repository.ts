import {Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {AnswerStatus, GameStatus} from '../../../infrastructure/utils/constants';
import {GamePairViewModel} from '../api/models/view/game.pair.view.model';
import {AnswerViewModel} from '../api/models/view/answer.view.model';
import {Question} from '../entity/question.entity';

@Injectable()
export class PlayerQuizQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ) {}

  async getFiveQuestionsId() {
    const questionsId = await this.dataSource.query(`
    select "id"
    from question
    order by random()
    limit 5
    offset random()
    `,)

    return questionsId ? questionsId : null
  }

  async getPendingGame() {
    const game = await this.dataSource.query(`
    select *
    from game
    where "status" = $1
    `, [GameStatus.pending]);

    return game ? game : null;
  }

  // достать вопрос по айди игры, номеру вопроса
  async getQuestion(gameId: string, questionNumber: number): Promise<Question> {
    return this.dataSource.query(`
    select *
    from question q
    left join game_question gq
    on q."id" = gq."questionId"
    where gq."gameId" = $1 and gq."questionNumber" = $2
    `, [gameId, questionNumber])
  }

  // todo - как достать ответы игрока к ТЕКУЩЕЙ ИГРЕ?
  // если заджоинить игрока с ответами, можно получить его ответы с прошлых игр
  // надо заждоинить ответы с вопросами по айти вопросов из игры
  async getPlayerAnswersForGame(playerId: string, gameId: string): Promise<AnswerViewModel[]> {
    const answers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answers
    where "playerId" = $1
    `, [playerId, gameId])

    return answers ? answers : [];
  }

  async getPlayerId(userId: string, gameId: string) {
    const player = await this.dataSource.query(`
    select *
    from player
    where "userId" = $1 and "gameId" = $2
    `, [userId, gameId]);

    return player ? player.id : null;
  }

  // todo - заджоинить правильно таблицы, чтобы получать view model
  // надо как-то подтянуть ответы текущего игрока и сложить их в массив
  // вопросы тоже надо заджоинить к игре и сложить в массив
  async getCurrentGame(id: string): Promise<GamePairViewModel | null> {
    const game = await this.dataSource.query(`
    select *
    
      (select * as "firstPlayerProgress"
      from player pl
      left join answer ans
      on pl."answerId" = ans."id"
      where pl."id" = g."firstPlayerId")
      
      (select * as "secondPlayerProgress"
      from player pl
      left join answer ans
      on pl."answerId" = ans."id"
      where pl."id" = g."firstPlayerId")
    
    from game g
    left join question q
    where q."id" = g."questionId"
    andWhere "status" = $2
    `, [id, GameStatus.active]);

    return game ? {
      id: game.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: 'string',
            answerStatus: AnswerStatus.correct,
            addedAt: '2015-03-25T12:00:00Z',
          }
        ],
        player: {
          id: game.firstPlayerProgress.id,
          login: game.firstPlayerProgress.login,
        },
        score: game.firstPlayerProgress.score,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: 'string',
            answerStatus: AnswerStatus.correct,
            addedAt: 'data',
          }
        ],
        player: {
          id: game.secondPlayerProgress.player.id,
          login: game.secondPlayerProgress.player.login,
        },
        score: game.secondPlayerProgress.score,
      },
      gameQuestions: game.questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    } : null;
  }

  async getGameById(id: string): Promise<GamePairViewModel | null> {
    const game = await this.dataSource.query(`
    select *
    from game g
    where g."id" = $1
    `, [id]);

    return game ? {
      id: game.id,
      firstPlayerProgress: {
        answers: [
          {
          questionId: 'string',
          answerStatus: AnswerStatus.correct,
          addedAt: '2015-03-25T12:00:00Z',
          }
        ],
        player: {
          id: 'uuid',
          login: 'string',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: 'string',
            answerStatus: AnswerStatus.correct,
            addedAt: '2015-03-25T12:00:00Z',
          }
        ],
        player: {
          id: 'uuid',
          login: 'string',
        },
        score: 0,
      },
      gameQuestions: game.questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    } : null;
  }
}