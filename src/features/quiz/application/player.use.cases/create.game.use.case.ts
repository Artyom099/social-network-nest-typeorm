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

export class CreateGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateGameCommand)
export class CreateGameUseCase implements ICommandHandler<CreateGameCommand> {
  constructor(
    private playerQuizRepository: PlayerQuizRepository,
    private playerQuizQueryRepository: PlayerQuizQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: CreateGameCommand) {
    // смотрим, ждет ли кто-то пару
    const pendingGame = await this.playerQuizQueryRepository.getPendingGame();
    const user = await this.usersQueryRepository.getUserById(command.userId);

    // создавать игрока текущему юзеру надо после проверки этого юзера на участие в текущей игре
    const playerDTO: CreatePlayerDTO = {
      id: randomUUID(),
      score: 0,
      userId: command.userId,
      login: user!.login,
      answers: [],
      gameId: pendingGame?.id,
    }
    await this.playerQuizRepository.createPlayer(playerDTO);

    if (pendingGame) {
      // если ждет, то

      // добавляем 5 рандомных вопросов
      const questionsId = await this.playerQuizQueryRepository.getFiveQuestionsId();
      const questionsDto: AddQuestionsToGameDto = {
        gameId: pendingGame.id,
        questionsId: questionsId.map((q) => (q.id))
      };
      await this.playerQuizRepository.crateFiveGameQuestions(questionsDto);

      // добавляем игрока в эту пару и начинаем игру
      const dto: AddPlayerToGameDto = {
        id: pendingGame.id,
        startGameDate: new Date(),
        secondPlayerId: playerDTO.id,
      };
      return this.playerQuizRepository.addPlayerToGame(dto);

    } else {

      // иначе создаем новую игру, первого игрока и ждем следующего игрока

      const dto: CreateGameDto = {
        id: randomUUID(),
        status: GameStatus.pending,
        pairCreatedDate: new Date(),
        firstPlayerId: playerDTO.id,
      };
      await this.playerQuizRepository.updatePlayersGameId(playerDTO.id,dto.id);
      return this.playerQuizRepository.createGame(dto);

    }
  }
}