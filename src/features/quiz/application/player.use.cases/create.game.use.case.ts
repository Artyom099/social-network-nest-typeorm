import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerQuizRepository } from '../../infrastructure/player.quiz.repository';
import { PlayerQuizQueryRepository } from '../../infrastructure/player.quiz.query.repository';
import {
  GameStatus,
  InternalCode,
} from '../../../../infrastructure/utils/enums';
import { CreateGameDto } from '../../api/models/dto/create.game.dto';
import { randomUUID } from 'crypto';
import { CreatePlayerDTO } from '../../api/models/dto/create.player.dto';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { AddQuestionsToGameDto } from '../../api/models/dto/addQuestionsToGameDto';
import { AddPlayerToGameDto } from '../../api/models/dto/add.player.to.game.dto';
import { DataSource } from 'typeorm';
import { ContractDto } from '../../../../infrastructure/core/contract.dto';

export class CreateGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateGameCommand)
export class CreateGameUseCase implements ICommandHandler<CreateGameCommand> {
  constructor(
    private dataSource: DataSource,
    private usersQueryRepository: UsersQueryRepository,
    private playerQuizRepository: PlayerQuizRepository,
    private playerQuizQueryRepository: PlayerQuizQueryRepository,
  ) {}

  async execute(command: CreateGameCommand) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { userId } = command;

    try {
      const activeGame = await this.playerQuizQueryRepository.getActiveGame(
        userId,
      );

      // если у юзера есть активная игра, то он не может подключиться к еще одной игре
      if (activeGame) {
        return new ContractDto(InternalCode.Forbidden);
      }

      // смотрим, ждет ли кто-то пару
      const pendingGame = await this.playerQuizQueryRepository.getPendingGame();
      const user = await this.usersQueryRepository.getUserById(userId);

      // создаем игрока
      const playerDTO: CreatePlayerDTO = {
        id: randomUUID(),
        score: 0,
        userId,
        login: user!.login,
        answers: [],
        gameId: pendingGame?.id,
      };
      await this.playerQuizRepository.createPlayer(playerDTO);

      // если кто-то ждет пару, то
      if (pendingGame) {
        // добавляем 5 рандомных вопросов
        const questionsId =
          await this.playerQuizQueryRepository.getFiveQuestionsId();
        const questionsDto: AddQuestionsToGameDto = {
          gameId: pendingGame.id,
          questionsId: questionsId.map((q) => q.id),
        };
        await this.playerQuizRepository.crateFiveGameQuestions(questionsDto);

        // добавляем игрока в эту пару и начинаем игру
        const dto: AddPlayerToGameDto = {
          id: pendingGame.id,
          startGameDate: new Date(),
          secondPlayerId: playerDTO.id,
        };
        const activeGame = await this.playerQuizRepository.addPlayerToGame(dto);

        await queryRunner.commitTransaction();

        if (activeGame.hasError())
          return new ContractDto(InternalCode.Internal_Server);

        return new ContractDto(InternalCode.Success, activeGame.payload);
      } else {
        // иначе создаем новую игру, первого игрока и ждем следующего игрока
        const dto: CreateGameDto = {
          id: randomUUID(),
          status: GameStatus.pending,
          pairCreatedDate: new Date(),
          firstPlayerId: playerDTO.id,
        };
        await this.playerQuizRepository.updatePlayersGameId(
          playerDTO.id,
          dto.id,
        );

        const newGame = await this.playerQuizRepository.createGame(dto);

        await queryRunner.commitTransaction();

        if (newGame.hasError())
          return new ContractDto(InternalCode.Internal_Server);

        return new ContractDto(InternalCode.Success, newGame.payload);
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return new ContractDto(InternalCode.Internal_Server);
    } finally {
      await queryRunner.release();
    }
  }
}
