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
import {PlayerQueryRepository} from '../../infrastructure/player.query.repository';
import {AnswerInputModel} from '../models/input/answer.input.model';

@Controller('pair-game-quiz/pairs')
@UseGuards(BearerAuthGuard)
export class PlayerQuizController {
  constructor(
    private commandBus: CommandBus,
    private playerQueryRepository: PlayerQueryRepository,
    ) {}

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async getCurrentGame(@Req() req) {
    const currentGame = await this.playerQueryRepository.getCurrentGame(req.userId)
    if (!currentGame) {
      throw new NotFoundException();
    } else {
      return currentGame
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getGame(@Req() req, @Param('id') gameId: string) {
    const gamePair = await this.playerQueryRepository.getGameById(gameId);
    if (!gamePair) throw new NotFoundException();

    if (req.userId !== gamePair.firstPlayerProgress.player.id ||
      req.userId !== gamePair.secondPlayerProgress.player.id) {
      throw new ForbiddenException();
    } else {
      return gamePair;
    }
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async createGame(@Req() req) {
    const currentGame = await this.playerQueryRepository.getCurrentGame(req.userId)
    if (currentGame) {
      throw new ForbiddenException();
    } else {
      // todo - useCase
    }
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer(@Req() req, @Body() inputModel: AnswerInputModel) {
    const currentGame = await this.playerQueryRepository.getCurrentGame(req.userId)
    if (!currentGame) { //todo - добавить кейс, что игрок ответил на все вопросы
      throw new ForbiddenException();
    } else {
      // todo - useCase
      // return this.commandBus.execute(new CreateAnswerCommand())
    }
  }
}