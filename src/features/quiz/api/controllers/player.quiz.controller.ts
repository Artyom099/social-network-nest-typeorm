import {
  Body,
  Controller, ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {BearerAuthGuard} from '../../../../infrastructure/guards/bearer-auth.guard';
import {PlayerQuizQueryRepository} from '../../infrastructure/player.quiz.query.repository';
import {AnswerInputModel} from '../models/input/answer.input.model';
import {CreateGameCommand} from '../../application/player.use.cases/create.game.use.case';
import {CreateAnswerCommand} from '../../application/player.use.cases/create.answer.use.case';
import {GameIdInputModel} from '../models/input/game.id.input.model';

@Controller('pair-game-quiz/pairs')
@UseGuards(BearerAuthGuard)
export class PlayerQuizController {
  constructor(
    private commandBus: CommandBus,
    private playerQuizQueryRepository: PlayerQuizQueryRepository,
  ) {}

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async getCurrentGame(@Req() req) {
    const currentGame = await this.playerQuizQueryRepository.getActiveOrPendingGame(req.userId);
    console.log({ currentGame: currentGame });
    if (!currentGame) {
      throw new NotFoundException();
    } else {
      return currentGame;
    }
  }

  @Get(':gameId')
  @HttpCode(HttpStatus.OK)
  async getGame(@Req() req, @Param() param: GameIdInputModel) {
    const game = await this.playerQuizQueryRepository.getGameById(param.gameId);
    if (!game) throw new NotFoundException();

    const firstPlayerUserId = await this.playerQuizQueryRepository.getUserIdByPlayerId(game.firstPlayerProgress.player.id);

    let secondPlayerUserId: string | null = null;
    if (game.secondPlayerProgress && game.secondPlayerProgress.player.id) {
      secondPlayerUserId = await this.playerQuizQueryRepository.getUserIdByPlayerId(game.secondPlayerProgress.player.id);
    }
    // если айди юзера не равно айди плеера1 и плеера2
    if (req.userId !== firstPlayerUserId && req.userId !== secondPlayerUserId) {
      throw new ForbiddenException();
    } else {
      return game;
    }
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async createGame(@Req() req) {
    // если есть активная игра, то юзер не может подключиться к еще одной игре
    const currentGame = await this.playerQuizQueryRepository.getActiveOrPendingGame(req.userId);
    if (currentGame) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(new CreateGameCommand(req.userId));
    }
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer(@Req() req, @Body() inputModel: AnswerInputModel) {
    const currentGame = await this.playerQuizQueryRepository.getActiveGame(req.userId);
    if (!currentGame) {
      // console.log('no');
      throw new ForbiddenException();
    } else {
      // console.log('yes');
      return this.commandBus.execute(new CreateAnswerCommand(req.userId, inputModel.answer));
    }
  }
}