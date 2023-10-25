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

  async getPlayer(userId: string, gamePairId: string) {
    const player = await this.dataSource.query(`
    select *
    from player
    where "userId" = $1 and "gameId" = $2
    `, [userId, gamePairId]);

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
      where pl."id" = gp."firstPlayerId")
      
      (select * as "secondPlayerProgress"
      from player pl
      left join answer ans
      on pl."answerId" = ans."id"
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
          id: game.secondPlayerProgress.player.id,
          login: game.secondPlayerProgress.player.login,
        },
        score: game.secondPlayerProgress.score,
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