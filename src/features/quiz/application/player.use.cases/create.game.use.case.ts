import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../infrastructure/quiz.repository';
import {
  GameStatus,
  InternalCode,
} from '../../../../infrastructure/utils/enums';
import { CreateGameDto } from '../../api/models/dto/create.game.dto';
import { randomUUID } from 'crypto';
import { CreatePlayerDTO } from '../../api/models/dto/create.player.dto';
import { UserQueryRepository } from '../../../users/infrastructure/user.query.repository';
import { AddQuestionsToGameDto } from '../../api/models/dto/add.questions.to.game.dto';
import { AddPlayerToGameDto } from '../../api/models/dto/add.player.to.game.dto';
import { DataSource } from 'typeorm';
import { Contract } from '../../../../infrastructure/core/contract';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class CreateGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateGameCommand)
export class CreateGameUseCase implements ICommandHandler<CreateGameCommand> {
  constructor(
    private dataSource: DataSource,
    private gameRepository: GameRepository,
    private quizRepository: QuizRepository,
    private playerRepository: PlayerRepository,
    private userQueryRepository: UserQueryRepository,
  ) {}

  async execute(command: CreateGameCommand): Promise<Contract<any>> {
    const { userId } = command;
    let newGame;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      const activeGame = await this.gameRepository.getActiveGame(
        userId,
        manager,
      );

      // если у юзера есть активная игра, то он не может подключиться к еще одной игре
      if (activeGame.code === InternalCode.Success) {
        return new Contract(InternalCode.Forbidden);
      }

      // смотрим, ждет ли кто-то пару
      const pendingGame = await this.gameRepository.getPendingGame(manager);

      // достаем логин текущего юзера
      const login = await this.userQueryRepository.getUserLogin(
        userId,
        manager,
      );
      if (login.hasError() || !login.payload)
        return new Contract(InternalCode.NotFound, null, 'user not found');

      // создаем игрока
      const playerDTO: CreatePlayerDTO = {
        id: randomUUID(),
        userId,
        login: login.payload,
        gameId: pendingGame.payload ? pendingGame.payload.id : 'mock',
      };
      await this.playerRepository.createPlayer(playerDTO, manager);

      // если кто-то ждет пару, то
      if (pendingGame.code === InternalCode.Success && pendingGame.payload) {
        // достаем всех игроков юэера
        const playerIds = await this.playerRepository.getPlayerIds(
          userId,
          manager,
        );

        // если пару ждет юзер, который ее же создал - 403
        if (playerIds.includes(pendingGame.payload?.firstPlayerId)) {
          return new Contract(InternalCode.Forbidden);
        }

        // добавляем 5 рандомных вопросов в игру
        const questionsId = await this.quizRepository.getFiveQuestionId(
          manager,
        );

        const questionsDto: AddQuestionsToGameDto = {
          gameId: pendingGame.payload.id,
          questionsId: questionsId.map((q) => q.id),
        };
        await this.quizRepository.createFiveGameQuestions(
          questionsDto,
          manager,
        );

        // добавляем игрока в эту пару и начинаем игру
        const dto: AddPlayerToGameDto = {
          id: pendingGame.payload.id,
          secondPlayerId: playerDTO.id,
        };
        newGame = await this.gameRepository.addPlayerToGame(dto, manager);
      }

      // если никто не ждет пару, то
      if (pendingGame.code === InternalCode.NotFound) {
        // создаем новую игру, первого игрока и ждем следующего игрока
        const dto: CreateGameDto = {
          id: randomUUID(),
          status: GameStatus.pending,
          pairCreatedDate: new Date(),
          firstPlayerId: playerDTO.id,
        };
        await this.playerRepository.updatePlayersGameId(
          playerDTO.id,
          dto.id,
          manager,
        );

        newGame = await this.gameRepository.createGame(dto, manager);
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log({ create_game_error: e });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    // console.log({ newGame: newGame });
    if (!newGame)
      return new Contract(InternalCode.Internal_Server, null, 'i dont know');

    console.log('create game successfully');

    return new Contract(InternalCode.Success, newGame.payload);
  }
}
