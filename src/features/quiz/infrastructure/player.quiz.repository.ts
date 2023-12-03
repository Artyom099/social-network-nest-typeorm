import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {Game} from '../entity/game.entity';
import {GameStatus} from '../../../infrastructure/utils/constants';
import {CreateGameDto} from '../api/models/dto/create.game.dto';
import {Answer} from '../entity/answer.entity';
import {CreateAnswerDTO} from '../api/models/dto/create.answer.dto';
import {AnswerViewModel} from '../api/models/view/answer.view.model';
import {GameViewModel} from '../api/models/view/game.view.model';
import {Player} from '../entity/player.entity';
import {CreatePlayerDTO} from '../api/models/dto/create.player.dto';
import {AddQuestionsToGameDto} from '../api/models/dto/addQuestionsToGameDto';
import {AddPlayerToGameDto} from '../api/models/dto/add.player.to.game.dto';

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
        // gameId: dto.gameId,
      })
      .execute()
  }
  async increaseScore(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Player)
      .set({ score: () => "score + 1" })
      .where("id = :id", { id })
      .execute()
  }

  async createGame(dto: CreateGameDto): Promise<GameViewModel> {
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
    from game g
    left join player pl
    on g."firstPlayerId" = pl."id"
    where g."id" = $1
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
      secondPlayerProgress: null,
      questions: null,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    }
  }

  async finishGame(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Game)
      .set({ status: GameStatus.finished })
      .where("id = :id", { id })
      .execute()
  }

  async addPlayerToGame(dto: AddPlayerToGameDto): Promise<GameViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .update(Game)
      .set({
        secondPlayerId: dto.secondPlayerId,
        startGameDate: dto.startGameDate,
        status: GameStatus.active,
      })
      .where("id = :id", { id: dto.id })
      .execute()

    const [game] = await this.dataSource.query(`
    select *,
    
      (select pl."login" as first_player_login
      from player pl 
      where pl."id" = g."firstPlayerId"),

      (select pl."login" as second_player_login
      from player pl
      where pl."id" = g."secondPlayerId")

    from game g
    where g."id" = $1
    `, [dto.id])

    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.firstPlayerId,
          login: game.first_player_login,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: game.secondPlayerId,
          login: game.second_player_login,
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

  async crateFiveGameQuestions(dto: AddQuestionsToGameDto) {
    return this.dataSource.query(`
    insert into game_question
    ("gameId", "questionId", "questionNumber") values
    ($1, $2, 1),
    ($1, $3, 2),
    ($1, $4, 3),
    ($1, $5, 4),
    ($1, $6, 5);
    `, [
      dto.gameId,
      dto.questionsId[0],
      dto.questionsId[1],
      dto.questionsId[2],
      dto.questionsId[3],
      dto.questionsId[4],
    ])
  }
}