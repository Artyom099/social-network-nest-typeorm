import {Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards} from '@nestjs/common';
import {BasicAuthGuard} from '../../../infrastructure/guards/basic-auth.guard';
import {CommandBus} from '@nestjs/cqrs';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class SAQuizController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getQuestions() {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createQuestion() {}

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteQuestion() {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateQuestion() {}

  @Put(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publishQuestion() {}
}