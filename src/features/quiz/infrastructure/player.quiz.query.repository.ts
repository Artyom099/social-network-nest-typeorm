import {Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {AnswerStatus, GamePairStatus} from '../../../infrastructure/utils/constants';
import {GamePairViewModel} from '../api/models/view/game.pair.view.model';

@Injectable()
export class PlayerQuizQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ) {}

  async getPendingGame() {
    const game = await this.dataSource.query(`
    select *
    from "game_pair"
    where "status" = $1
    `, [GamePairStatus.pending]);

    return game ? game : null;
  }

  // todo - заджоинить правильно таблицы, чтобы получать view model
  async getCurrentGame(id: string): Promise<GamePairViewModel | null> {
    const game = await this.dataSource.query(`
    select *
    
      (select * as "firstPlayerProgress"
      from player pl
      left join answer ans
      on pl."id" = ans."playerId"
      where pl."id" = gp."firstPlayerId")
    
    from game_pair gp
    left join question q
    where q."id" = gp."questionId"
    andWhere "status" = $2
    `, [id, GamePairStatus.active]);

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
          id: 'uuid',
          login: 'string',
        },
        score: 0,
      },
      questions: game.questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    } : null;
  }

  async getGameById(id: string): Promise<GamePairViewModel | null> {
    const game = await this.dataSource.query(`
    select *
    from game_pair gp
    where gp."id" = $1
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
      questions: game.questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    } : null;
  }
}