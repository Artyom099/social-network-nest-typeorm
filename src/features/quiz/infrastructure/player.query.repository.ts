import {Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {GamePairPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {GamePairStatus} from '../../../infrastructure/utils/constants';

@Injectable()
export class PlayerQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ) {}

  async getCurrentGame(id: string) {
    return {
      id: 'string',
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
      status: GamePairStatus.active,
      pairCreatedDate: 'data',
      startGameDate: 'data',
      finishGameDate: 'data',
    }
  }
  async getGameById(id: string) {
    return {
      id: 'string',
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
      status: GamePairStatus.active,
      pairCreatedDate: 'data',
      startGameDate: 'data',
      finishGameDate: 'data',
    }
  }
}