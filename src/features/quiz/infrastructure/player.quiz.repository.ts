import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {Game} from '../entity/game.entity';
import {GamePairStatus} from '../../../infrastructure/utils/constants';
import {CreateGamePairDTO} from '../api/models/dto/create.game.pair.dto';
import {Answer} from '../entity/answer.entity';
import {addPlayerToGamePairDto} from '../api/models/dto/add.player.to.game.pair.dto';
import {CreateAnswerDTO} from '../api/models/dto/create.answer.dto';
import {AnswerViewModel} from '../api/models/view/answer.view.model';
import {GamePairViewModel} from '../api/models/view/game.pair.view.model';
import {Users} from '../../users/entity/user.entity';
import {Player} from '../entity/player.entity';
import {CreatePlayerDTO} from '../api/models/dto/create.player.dto';

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

  async createPlayer(dto: CreatePlayerDTO) {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Player)
      .values({
        id: dto.id,
        score: dto.score,
        userId: dto.userId,
        login: dto.login,
        // answers: dto.answers,
        gameId: dto.gamePairId,
      })
      .execute()
  }

  async createGamePair(dto: CreateGamePairDTO): Promise<GamePairViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Game)
      .values({
        id: dto.id,
        status: dto.status,
        pairCreatedDate: dto.pairCreatedDate,
        firstPlayerId: dto.firstPlayerId,
      })
      .execute()

    // заджоинил игрока к игре
    const [game] = await this.dataSource.query(`
    select *
    from game_pair gp
    left join player pl
    on gp."firstPlayerId" = pl."id"
    where gp."id" = $1
    `, [dto.id])

    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.firstPlayerId,
          login: game.login,
        },
        score: game.score,
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
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    }
  }

  async addPlayerToGamePair(dto: addPlayerToGamePairDto) {
    return this.dataSource
      .createQueryBuilder()
      .update(Game)
      .set({ secondPlayerId: dto.secondPlayerId, startGameDate: dto.startGameDate })
      .where("id = :id", { id: dto.id })
      .execute()
  }
}