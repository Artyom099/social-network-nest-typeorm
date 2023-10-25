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
    // смотрим, ждет ли кто-то пару
    const pendingGame = await this.playerQuizQueryRepository.getPendingGame();
    const user = await this.usersQueryRepository.getUserById(command.userId)

    const playerDTO: CreatePlayerDTO = {
      id: randomUUID(),
      score: 0,
      userId: command.userId,
      login: user!.login,
      answers: [],
      gamePairId: pendingGame.id,
    }
    await this.playerQuizRepository.createPlayer(playerDTO)

    if (pendingGame) {
      // если да, то
      // добавляем 5 вопросов
      const questionsDto: AddQuestionsToGameDto = {
        gameId: pendingGame.id,
        questionsId: await this.playerQuizQueryRepository.getFiveQuestionsId()
      }
      await this.playerQuizRepository.addQuestionsToGame(questionsDto)
      // добавляем игрока в эту пару и начинаем игру
      const dto: AddPlayerToGameDto = {
        id: pendingGame.id,
        startGameDate: new Date(),
        secondPlayerId: playerDTO.id,
      }
      return this.playerQuizRepository.addPlayerToGame(dto)

    } else {
      // иначе создаем новую игру и ждем следующего игрока
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