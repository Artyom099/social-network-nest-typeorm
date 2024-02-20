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
import { AddQuestionsToGameDto } from '../../api/models/dto/add.questions.to.game.dto';
import { AddPlayerToGameDto } from '../../api/models/dto/add.player.to.game.dto';
import { DataSource } from 'typeorm';
import { Contract } from '../../../../infrastructure/core/contract';
import { InjectDataSource } from '@nestjs/typeorm';

export class CreateGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateGameCommand)
export class CreateGameUseCase implements ICommandHandler<CreateGameCommand> {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private usersQueryRepository: UsersQueryRepository,
    private playerQuizRepository: PlayerQuizRepository,
    private playerQuizQueryRepository: PlayerQuizQueryRepository,
  ) {}

  async execute(command: CreateGameCommand): Promise<Contract<any>> {
    const { userId } = command;
    let newGame;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      const activeGame = await this.playerQuizQueryRepository.getActiveGame(
        userId,
        manager,
      );

      // если у юзера есть активная игра, то он не может подключиться к еще одной игре
      if (activeGame.code === InternalCode.Success) {
        return new Contract(InternalCode.Forbidden);
      }

      // смотрим, ждет ли кто-то пару
      const pendingGame = await this.playerQuizQueryRepository.getPendingGame(
        manager,
      );

      // достаем логин текущего юзера
      const login = await this.usersQueryRepository.getUserForQuiz(
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
      await this.playerQuizRepository.createPlayer(playerDTO, manager);

      // если кто-то ждет пару, то
      if (pendingGame.code === InternalCode.Success && pendingGame.payload) {
        // добавляем 5 рандомных вопросов в игру
        const questionsId =
          await this.playerQuizQueryRepository.getFiveQuestionsId(manager);

        const questionsDto: AddQuestionsToGameDto = {
          gameId: pendingGame.payload.id,
          questionsId: questionsId.map((q) => q.id),
        };
        await this.playerQuizRepository.crateFiveGameQuestions(
          questionsDto,
          manager,
        );

        // добавляем игрока в эту пару и начинаем игру
        const dto: AddPlayerToGameDto = {
          id: pendingGame.payload.id,
          secondPlayerId: playerDTO.id,
        };
        newGame = await this.playerQuizRepository.addPlayerToGame(dto, manager);
      }

      // если никто не ждет пару
      if (pendingGame.code === InternalCode.NotFound) {
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
          manager,
        );

        newGame = await this.playerQuizRepository.createGame(dto, manager);
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log({ create_game_error: e });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    console.log({ newGame: newGame });
    if (!newGame)
      return new Contract(InternalCode.Internal_Server, null, 'i dont know');

    return new Contract(InternalCode.Success, newGame.payload);
  }
}
