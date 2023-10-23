import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PlayerQuizRepository} from '../../infrastructure/player.quiz.repository';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';
import {GamePairStatus} from '../../../../infrastructure/utils/constants';
import {CreateGamePairDTO} from '../../api/models/dto/create.game.pair.dto';
import {addPlayerDTO} from '../../api/models/dto/add.player.dto';

export class CreatePairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreatePairCommand)
export class CreatePairUseCase implements ICommandHandler<CreatePairCommand> {
  constructor(
    private playerQuizRepository: PlayerQuizRepository,
    private playerQuizQueryRepository: PlayerQuizQueryRepository,
  ) {}

  async execute(command: CreatePairCommand) {
    // смотрим, ждет ли кто-то пару
    const pendingGamePair = await this.playerQuizQueryRepository.getPendingGame();
    if (pendingGamePair) {
      // если да, то добавляем игрока в эту пару и начинаем игру
      const dto: addPlayerDTO = {
        startGameDate: new Date(),
        secondPlayerId: command.userId,
      }
      return this.playerQuizRepository.addPlayerToGamePair(dto)
    } else {
      // иначе создаем новую игру и ждем следующего игрока
      const dto: CreateGamePairDTO = {
        status: GamePairStatus.pending,
        pairCreatedDate: new Date(),
        firstPlayerId: command.userId,
      }
      return this.playerQuizRepository.createGamePair(dto)
    }
  }
}