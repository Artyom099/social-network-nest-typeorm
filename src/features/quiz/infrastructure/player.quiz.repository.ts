import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {GamePair} from '../entity/game.pair.entity';
import {GamePairStatus} from '../../../infrastructure/utils/constants';
import {CreateGamePairDTO} from '../api/models/dto/create.game.pair.dto';
import {Answer} from '../entity/answer.entity';
import {addPlayerDTO} from '../api/models/dto/add.player.dto';
import {CreateAnswerDTO} from '../api/models/dto/create.answer.dto';
import {AnswerViewModel} from '../api/models/view/answer.view.model';

@Injectable()
export class PlayerQuizRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createAnswer(dto: CreateAnswerDTO): Promise<AnswerViewModel | null> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Answer)
      .values({
        id: dto.id,
        answer: dto.answer,
        questionId: dto.questionId,
        answerStatus: dto.answerStatus,
        addedAt: dto.addedAt,
      })
      .execute()

    const [answer] = await this.dataSource.query(`
      select *
      from answer
      where "id" = $1
    `, [dto.id])

    return answer ? {
      questionId: answer.questionId,
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    } : null;
  }

  async createGamePair(dto: CreateGamePairDTO) {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(GamePair)
      .values({
        status: dto.status,
        pairCreatedDate: dto.pairCreatedDate,
        firstPlayerId: dto.firstPlayerId,
      })
      .execute()

    const [gamePair] = await this.dataSource.query(`
    select *
    from game_pair
    where "status" = $1
    `, [GamePairStatus.pending])

    return {
      id: gamePair.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: 'id-1',
          login: 'login-1',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: null,
          login: null,
        },
        score: 0,
      },
      questions: [],
      status: gamePair.status,
      pairCreatedDate: gamePair.pairCreatedDate,
      startGameDate: gamePair.startGameDate,
      finishGameDate: gamePair.finishGameDate,
    }
  }

  async addPlayerToGamePair(dto: addPlayerDTO) {}
}