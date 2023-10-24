import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import {BasicAuthGuard} from '../../../../infrastructure/guards/basic-auth.guard';
import {CommandBus} from '@nestjs/cqrs';
import {GamePairPaginationInput} from '../../../../infrastructure/models/pagination.input.models';
import {SAQuizQueryRepository} from '../../infrastructure/sa.quiz.query.repository';
import {CreateQuestionInputModel} from '../models/input/create.question.input.model';
import {PublishQuestionInputModel} from '../models/input/publish.question.input.model';
import {PublishQuestionCommand} from '../../application/sa.use.cases/publish.question.use.case';
import {UpdateQuestionCommand} from '../../application/sa.use.cases/update.question.use.case';
import {DeleteQuestionCommand} from '../../application/sa.use.cases/delete.question.use.case';
import {CreateQuestionCommand} from '../../application/sa.use.cases/create.question.use.case';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class SAQuizController {
  constructor(
    private commandBus: CommandBus,
    private saQuizQueryRepository: SAQuizQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getQuestions(query: GamePairPaginationInput) {
    return this.saQuizQueryRepository.getQuestions(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() inputModel: CreateQuestionInputModel) {
    return this.commandBus.execute(new CreateQuestionCommand(inputModel))
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') questionId: string) {
    const question = await this.saQuizQueryRepository.getQuestion(questionId)
    if (!question) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(new DeleteQuestionCommand(questionId))
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') questionId: string,
    @Body() inputModel: CreateQuestionInputModel,
  ) {
    const question = await this.saQuizQueryRepository.getQuestion(questionId)
    if (!question) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(new UpdateQuestionCommand(questionId, inputModel))
    }
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param('id') questionId: string,
    @Body() inputModel: PublishQuestionInputModel,
  ) {
    const question = this.saQuizQueryRepository.getQuestion(questionId)
    if (!question) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(new PublishQuestionCommand(questionId, inputModel))
    }
  }
}