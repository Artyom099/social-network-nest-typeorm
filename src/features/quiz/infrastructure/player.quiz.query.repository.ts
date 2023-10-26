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
  // достаем вопрос по айди игры и номеру вопроса
  async getQuestion(gameId: string, questionNumber: number): Promise<Question> {
    return this.dataSource.query(`
    select *
    from question q
    left join game_question gq
    on q."id" = gq."questionId"
    where gq."gameId" = $1 and gq."questionNumber" = $2
    `, [gameId, questionNumber])
  }

  async getPlayerId(userId: string, gameId: string) {
    const player = await this.dataSource.query(`
    select *
    from player
    where "userId" = $1 and "gameId" = $2
    `, [userId, gameId]);

    return player ? player.id : null;
  }
  // достаем ответы по айди игрока
  async getPlayerAnswersForGame(playerId: string): Promise<AnswerViewModel[]> {
    const answers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answers
    where "playerId" = $1
    `, [playerId])

    return answers.map((a) => {
      return {
        questionId: a.questionId,
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      }
    })
  }

  async getPendingGame() {
    const game = await this.dataSource.query(`
    select *
    from game
    where "status" = $1
    `, [GameStatus.pending]);

    return game ? game : null;
  }
  async getGameById(id: string): Promise<GamePairViewModel | null> {
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
      where pl."id" = g."secondPlayerId")
    
    from game g
    where g."id" = $1
    `, [id]);

    const questions = await this.dataSource.query(`
    select q."id", q."body"
    from game_question gq
    left join question q
    on q."id" = gq."questionId"
    where gq."gameId" = $1
    order by gq."questionNumber"
    `, [id])

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
      gameQuestions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    } : null;
  }
  async getActiveGame(id: string): Promise<GamePairViewModel | null> {
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
      where pl."id" = g."secondPlayerId")
    
    from game g
    where g."id" = $1
    andWhere "status" = $2
    `, [id, GameStatus.active]);

    const questions = await this.dataSource.query(`
    select q."id", q."body"
    from game_question gq
    left join question q
    on q."id" = gq."questionId"
    where gq."gameId" = $1
    order by gq."questionNumber"
    `, [id])

    const firstPlayerAnswers = game.firstPlayerProgress.answers.map((a) => {
      return {
        questionId: a.questionId,
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      }
    })
    const secondPlayerAnswers = game.secondPlayerProgress.answers.map((a) => {
      return {
        questionId: a.questionId,
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      }
    })

    return game ? {
      id: game.id,
      firstPlayerProgress: {
        answers: firstPlayerAnswers,
        player: {
          id: game.firstPlayerProgress.id,
          login: game.firstPlayerProgress.login,
        },
        score: game.firstPlayerProgress.score,
      },
      secondPlayerProgress: {
        answers: secondPlayerAnswers,
        player: {
          id: game.secondPlayerProgress.player.id,
          login: game.secondPlayerProgress.player.login,
        },
        score: game.secondPlayerProgress.score,
      },
      gameQuestions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    } : null;
  }
}