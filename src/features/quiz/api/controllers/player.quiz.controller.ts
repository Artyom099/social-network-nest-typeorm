import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../../../infrastructure/guards/bearer-auth.guard';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { AnswerInputModel } from '../models/input/answer.input.model';
import { CreateGameCommand } from '../../application/player.use.cases/create.game.use.case';
import { CreateAnswerCommand } from '../../application/player.use.cases/create.answer.use.case';
import { GameIdInputModel } from '../models/input/game.id.input.model';
import { ExceptionResponseHandler } from '../../../../infrastructure/core/exception.response.handler';
import { ApproachType } from '../../../../infrastructure/utils/enums';
import { GameViewModel } from '../models/view/game.view.model';
import { CurrentUserId } from '../../../../infrastructure/decorators/current.user.id.decorator';
import { PlayerRepository } from '../../infrastructure/player.repository';

@Controller('pair-game-quiz/pairs')
@UseGuards(BearerAuthGuard)
export class PlayerQuizController extends ExceptionResponseHandler {
  constructor(
    private commandBus: CommandBus,
    private playerRepository: PlayerRepository,
    private gameQueryRepository: GameQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async getCurrentGame(
    @CurrentUserId() userId: string,
  ): Promise<GameViewModel> {
    const currentGameResult =
      await this.gameQueryRepository.getActiveOrPendingGame(userId);

    return this.sendExceptionOrResponse(currentGameResult);
  }

  @Get(':gameId')
  @HttpCode(HttpStatus.OK)
  async getGame(
    @CurrentUserId() userId: string,
    @Param() param: GameIdInputModel,
  ) {
    const game = await this.gameQueryRepository.getGameById(param.gameId);
    if (!game) throw new NotFoundException();

    const firstPlayerUserId = await this.playerRepository.getUserIdByPlayerId(
      game.firstPlayerProgress.player.id,
    );

    let secondPlayerUserId: string | null = null;
    if (game.secondPlayerProgress?.player.id) {
      secondPlayerUserId = await this.playerRepository.getUserIdByPlayerId(
        game.secondPlayerProgress.player.id,
      );
    }

    // если айди юзера не равно айди плеера1 и плеера2
    if (userId !== firstPlayerUserId && userId !== secondPlayerUserId) {
      throw new ForbiddenException();
    } else {
      return game;
    }
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async createGame(@CurrentUserId() userId: string) {
    const createGameResult = await this.commandBus.execute(
      new CreateGameCommand(userId),
    );

    return this.sendExceptionOrResponse(createGameResult);
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer(
    @CurrentUserId() userId: string,
    @Body() body: AnswerInputModel,
  ) {
    const createAnswerResult = await this.commandBus.execute(
      new CreateAnswerCommand(userId, body.answer),
    );

    return this.sendExceptionOrResponse(createAnswerResult);
  }
}
