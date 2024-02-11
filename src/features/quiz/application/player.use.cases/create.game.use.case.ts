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

  async execute(command: CreateGameCommand): Promise<ContractDto<any>> {
    const { userId } = command;
    let newGame;

    // достаем логин текущего юзера
    // todo - логин достается как null во время транзакции, тк создается какой-то отдельный экземпляр репозитория
    const user = await this.usersQueryRepository.getUserForQuiz(userId);
    if (user.hasError())
      return new ContractDto(InternalCode.NotFound, null, 'user not found');

    // вся сложность в том, что немозможно создать и первого игрока и игру одновременно
    // а если мы хотим сохнить ограничения, то для создания игры нужен playerId, а для создания игрока нужен gameId

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // const manager = queryRunner.manager;

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

      // создаем игрока
      const playerDTO: CreatePlayerDTO = {
        id: randomUUID(),
        userId,
        login: user.payload!,
        answers: [],
        gameId: pendingGame.payload ? pendingGame.payload.id : 'mock',
      };
      await this.playerQuizRepository.createPlayer(playerDTO);

      // если кто-то ждет пару, то
      if (pendingGame.code === InternalCode.Success && pendingGame.payload) {
        // создаем игрока
        // const playerDTO: CreatePlayerDTO = {
        //   id: randomUUID(),
        //   score: 0,
        //   userId,
        //   login: user.payload!,
        //   answers: [],
        //   gameId: pendingGame.payload?.id,
        // };
        // await this.playerQuizRepository.createPlayer(playerDTO);

        // добавляем 5 рандомных вопросов в игру
        const questionsId =
          await this.playerQuizQueryRepository.getFiveQuestionsId();
        const questionsDto: AddQuestionsToGameDto = {
          gameId: pendingGame.payload.id,
          questionsId: questionsId.map((q) => q.id),
        };
        await this.playerQuizRepository.crateFiveGameQuestions(questionsDto);

        // добавляем игрока в эту пару и начинаем игру
        const dto: AddPlayerToGameDto = {
          id: pendingGame.payload.id,
          startGameDate: new Date(),
          secondPlayerId: playerDTO.id,
        };
        newGame = await this.playerQuizRepository.addPlayerToGame(dto);

        await queryRunner.commitTransaction();
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
        );

        newGame = await this.playerQuizRepository.createGame(dto);

        await queryRunner.commitTransaction();
      }
    } catch (e) {
      console.log({ create_game_error: e });
      await queryRunner.rollbackTransaction();
      return new ContractDto(InternalCode.Internal_Server, null, 'rollback');
    } finally {
      await queryRunner.release();
    }

    if (newGame.hasError())
      return new ContractDto(InternalCode.Internal_Server, null, 'i dont know');

    return new ContractDto(InternalCode.Success, newGame.payload);
  }
}
