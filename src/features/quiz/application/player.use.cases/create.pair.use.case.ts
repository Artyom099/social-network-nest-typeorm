import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';
import {GameStatus} from '../../../../infrastructure/utils/constants';
import {CreateGameDto} from '../../api/models/dto/create.game.dto';
import {randomUUID} from 'crypto';
import {CreatePlayerDTO} from '../../api/models/dto/create.player.dto';
import {UsersQueryRepository} from '../../../users/infrastructure/users.query.repository';
import {AddQuestionsToGameDto} from '../../api/models/dto/addQuestionsToGameDto';
import {AddPlayerToGameDto} from '../../api/models/dto/add.player.to.game.dto';

export class CreatePairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreatePairCommand)
export class CreatePairUseCase implements ICommandHandler<CreatePairCommand> {
  constructor(
    private playerQuizRepository: PlayerQuizRepository,
    private playerQuizQueryRepository: PlayerQuizQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  // добавлять вопросы в игру когда добавился 2й игрок
  async execute(command: CreatePairCommand) {
    console.log('333');
    // смотрим, ждет ли кто-то пару
    const pendingGame = await this.playerQuizQueryRepository.getPendingGame();
    const user = await this.usersQueryRepository.getUserById(command.userId)

    console.log('444');
    const playerDTO: CreatePlayerDTO = {
      id: randomUUID(),
      score: 0,
      userId: command.userId,
      login: user!.login,
      answers: [],
      gameId: pendingGame?.id,
    }
    await this.playerQuizRepository.createPlayer(playerDTO)

    console.log({ pendingGame: pendingGame });

    if (pendingGame) {
      // если да, то создаем игрока и добавляем 5 вопросов
      console.log('+++');
      const questionsDto: AddQuestionsToGameDto = {
        gameId: pendingGame.id,
        questionsId: await this.playerQuizQueryRepository.getFiveQuestionsId()
      }
      await this.playerQuizRepository.addQuestionsToGame(questionsDto)

      //gameId
      // const playerDTO: CreatePlayerDTO = {
      //   id: randomUUID(),
      //   score: 0,
      //   userId: command.userId,
      //   login: user!.login,
      //   answers: [],
      //   gameId: pendingGame.id,
      // }
      // await this.playerQuizRepository.createPlayer(playerDTO)

      console.log('666');
      // добавляем игрока в эту пару и начинаем игру
      const dto: AddPlayerToGameDto = {
        id: pendingGame.id,
        startGameDate: new Date(),
        secondPlayerId: playerDTO.id,
      }
      return this.playerQuizRepository.addPlayerToGame(dto)

    } else {
      console.log('---');
      // no gameId
      // const playerDTO: CreatePlayerDTO = {
      //   id: randomUUID(),
      //   score: 0,
      //   userId: command.userId,
      //   login: user!.login,
      //   answers: [],
      //   gameId: '123',
      // }
      // await this.playerQuizRepository.createPlayer(playerDTO)

      // иначе создаем новую игру, первого игрока и ждем следующего игрока
      const dto: CreateGameDto = {
        id: randomUUID(),
        status: GameStatus.pending,
        pairCreatedDate: new Date(),
        firstPlayerId: playerDTO.id,
      }
      return this.playerQuizRepository.createGame(dto)
    }
  }
}