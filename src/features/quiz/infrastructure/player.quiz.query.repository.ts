import {Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {GamePairPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {GamePairStatus} from '../../../infrastructure/utils/constants';
import {Question} from '../entity/question.entity';

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

  async getCurrentGame(id: string) {
    const game = await this.dataSource.query(`
    select *
    
      (select * as "firstPlayerProgress"
      from player pl
      left join question q
      on pl."id" = ans."playerId"
      where pl."id" = $1)
    
    from game_pair gp
    left join question q
    where q."id" = gp."questionId"
    andWhere "status" = $2
    `, [id, GamePairStatus.active]);

    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: 'string',
            answerStatus: 'string',
            addedAt: 'data',
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
            answerStatus: 'string',
            addedAt: 'data',
          }
        ],
        player: {
          id: 'uuid',
          login: 'string',
        },
        score: 0,
      },
      questions: [
        {
          id: 'string',
          body: 'string',
        }
      ],
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    }
  }
  async getGameById(id: string) {
    const game = await this.dataSource.query(`
    select *
    from "game_pair"
    where "id" = $1
    `, [id]);

    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [
          {
          questionId: 'string',
          answerStatus: 'string',
          addedAt: 'data',
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
            answerStatus: 'string',
            addedAt: 'data',
          }
        ],
        player: {
          id: 'uuid',
          login: 'string',
        },
        score: 0,
      },
      questions: [
        {
          id: 'string',
          body: 'string',
        }
      ],
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    }
  }

}