import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';
import {GamePairStatus} from '../../../../infrastructure/utils/constants';
import {CreateGamePairDTO} from '../../api/models/dto/create.game.pair.dto';
import {addPlayerToGamePairDto} from '../../api/models/dto/add.player.to.game.pair.dto';
import {randomUUID} from 'crypto';
import {CreatePlayerDTO} from '../../api/models/dto/create.player.dto';
import {UsersQueryRepository} from '../../../users/infrastructure/users.query.repository';

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
    const pendingGamePair = await this.playerQuizQueryRepository.getPendingGame();
    const user = await this.usersQueryRepository.getUserById(command.userId)

    const playerDTO: CreatePlayerDTO = {
      id: randomUUID(),
      score: 0,
      userId: command.userId,
      login: user!.login,
      answers: [],
      gamePairId: pendingGamePair.id,
    }
    await this.playerQuizRepository.createPlayer(playerDTO)

    if (pendingGamePair) {
      // если да, то добавляем игрока в эту пару и начинаем игру
      // todo - надо еще добавить 5 вопросов
      const dto: addPlayerToGamePairDto = {
        id: pendingGamePair.id,
        startGameDate: new Date(),
        secondPlayerId: playerDTO.id,
      }
      return this.playerQuizRepository.addPlayerToGamePair(dto)

    } else {
      // иначе создаем новую игру и ждем следующего игрока
      const dto: CreateGamePairDTO = {
        id: randomUUID(),
        status: GamePairStatus.pending,
        pairCreatedDate: new Date(),
        firstPlayerId: playerDTO.id,
      }
      return this.playerQuizRepository.createGamePair(dto)
    }
  }
}