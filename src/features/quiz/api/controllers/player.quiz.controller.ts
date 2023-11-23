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

@Controller('pair-game-quiz/pairs')
@UseGuards(BearerAuthGuard)
export class PlayerQuizController {
  constructor(
    private commandBus: CommandBus,
    private playerQueryRepository: PlayerQuizQueryRepository,
  ) {}

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async getCurrentGame(@Req() req) {

    const currentGame = await this.playerQueryRepository.getActiveGame(req.userId);
    if (!currentGame) {
      throw new NotFoundException();
    } else {
      return currentGame;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getGame(@Req() req, @Param('id') gameId: string) {
    const game = await this.playerQueryRepository.getGameById(gameId);
    if (!game) throw new NotFoundException();

    const firstPlayerUserId = await this.playerQueryRepository.getUserIdByPlayerId(game.firstPlayerProgress.player.id);
    if (!game.secondPlayerProgress.player.id) throw new ForbiddenException();
    const secondPlayerUserId = await this.playerQueryRepository.getUserIdByPlayerId(game.secondPlayerProgress.player.id);

    if (req.userId !== firstPlayerUserId && req.userId !== secondPlayerUserId) {
      throw new ForbiddenException();
    } else {
      return game;
    }
  }


  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async createGame(@Req() req) {
    const currentGame = await this.playerQueryRepository.getActiveGame(req.userId);
    if (currentGame) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(new CreateGameCommand(req.userId));
    }
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer(@Req() req, @Body() inputModel: AnswerInputModel) {
    const currentGame = await this.playerQueryRepository.getActiveGame(req.userId)
    //todo - добавить кейс, что игрок ответил на все вопросы и ждет ответов другого игрока
    if (!currentGame) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(new CreateAnswerCommand(req.userId, inputModel.answer));
    }
  }
}