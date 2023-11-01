import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {GameStatus} from '../../../infrastructure/utils/constants';
import {GameViewModel} from '../api/models/view/game.view.model';
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
    const [game] = await this.dataSource.query(`
    select *
    from game
    where "status" = $1
    `, [GameStatus.pending]);

    return game ? game : null;
  }

  //todo - дописать джоин или подзапрос для айди и логина игрока
  async getGameById(id: string): Promise<GameViewModel | null> {
    const [game] = await this.dataSource.query(`
    select *,
           
      (select pl."login" as firstPlayerLogin
      from player pl 
      where pl."id" = g."firstPlayerId"),

      (select pl."login" as secondPlayerLogin
      from player pl 
      where pl."id" = g."secondPlayerId")
    
    from game g
    where g."id" = $1
    `, [id]);

    if (!game) throw new NotFoundException();

    const questions = await this.dataSource.query(`
    select q."id", q."body"
    from game_question gq
    left join question q
    on q."id" = gq."questionId"
    where gq."gameId" = $1
    order by gq."questionNumber"
    `, [id])
    const firstPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where playerId = $1
    `, [game.firstPlayerId])
    const secondPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where playerId = $1
    `, [game.secondPlayerId])

    return game ? {
      id: game.id,
      firstPlayerProgress: {
        answers: firstPlayerAnswers,
        player: {
          id: game.firstPlayerId,
          login: game.firstPlayerLogin,
        },
        score: game.firstPlayerProgress.score,
      },
      secondPlayerProgress: {
        answers: secondPlayerAnswers,
        player: {
          id: game.secondPlayerId,
          login: game.secondPlayerLogin,
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

  async getActiveGame(id: string): Promise<GameViewModel | null> {
    console.log('1----1');
    const [game] = await this.dataSource.query(`
    select *,

      (select pl."login" as firstPlayerLogin
      from player pl
      where pl."id" = g."firstPlayerId"),
      
      (select pl."login" as secondPlayerLogin
      from player pl 
      where pl."id" = g."secondPlayerId")
    
    from game g
    where g."id" = $1 and "status" = $2
    `, [id, GameStatus.active]);

    console.log('2----2');
    if (!game) return null;
    console.log('2');

    const questions = await this.dataSource.query(`
    select q."id", q."body"
    from game_question gq
    left join question q
    on q."id" = gq."questionId"
    where gq."gameId" = $1
    order by gq."questionNumber"
    `, [id]);
    console.log('3----3');
    const firstPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where playerId = $1
    `, [game.firstPlayerId]);
    console.log('4----4');
    const secondPlayerAnswers = await this.dataSource.query(`
    select "questionId", "answerStatus", "addedAt"
    from answer
    where playerId = $1
    `, [game.secondPlayerId]);
    console.log('5----5');

    return game ? {
      id: game.id,
      firstPlayerProgress: {
        answers: firstPlayerAnswers,
        player: {
          id: game.firstPlayerId,
          login: game.firstPlayerLogin,
        },
        score: game.firstPlayerProgress.score,
      },
      secondPlayerProgress: {
        answers: secondPlayerAnswers,
        player: {
          id: game.secondPlayerId,
          login: game.secondPlayerLogin,
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