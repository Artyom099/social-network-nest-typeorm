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
import {CreatePairCommand} from '../../application/player.use.cases/create.pair.use.case';
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
      return this.commandBus.execute(new CreatePairCommand(req.userId))
    }
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer(@Req() req, @Body() inputModel: AnswerInputModel) {
    const currentGame = await this.playerQueryRepository.getCurrentGame(req.userId)
    //todo - добавить кейс, что игрок ответил на все вопросы и ждет ответов другого игрока
    if (!currentGame || (currentGame && 1 !== 1)) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(new CreateAnswerCommand(req.userId, inputModel.answer))
    }
  }
}