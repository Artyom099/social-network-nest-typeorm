import {Controller, Get, HttpCode, HttpStatus, Post, UseGuards} from '@nestjs/common';
import {BasicAuthGuard} from '../../../infrastructure/guards/basic-auth.guard';
import {CommandBus} from '@nestjs/cqrs';
import {BearerAuthGuard} from '../../../infrastructure/guards/bearer-auth.guard';

@Controller('pair-game-quiz/pairs')
@UseGuards(BearerAuthGuard)
export class PlayerQuizController {
  constructor(private commandBus: CommandBus) {}

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async getCurrentGame() {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getGame() {}

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async createGame() {}

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer() {}
}