import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put, Query,
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
import {GameIdInputModel} from '../models/input/game.id.input.model';
import {QuestionIdInputModel} from '../models/input/question.id.input.model';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class SAQuizController {
  constructor(
    private commandBus: CommandBus,
    private saQuizQueryRepository: SAQuizQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getQuestions(@Query() query: GamePairPaginationInput) {
    return this.saQuizQueryRepository.getQuestions(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() inputModel: CreateQuestionInputModel) {
    return this.commandBus.execute(new CreateQuestionCommand(inputModel));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string) {
    const question = await this.saQuizQueryRepository.getQuestion(id);
    if (!question) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(new DeleteQuestionCommand(id));
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') id: string,
    @Body() inputModel: CreateQuestionInputModel,
  ) {
    const question = await this.saQuizQueryRepository.getQuestion(id);
    if (!question) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(new UpdateQuestionCommand(id, inputModel));
    }
  }

  @Put(':questionId/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param() id: QuestionIdInputModel,
    @Body() inputModel: PublishQuestionInputModel,
  ) {
    // console.log('1----1');
    // console.log({id_1: id});
    // console.log({id_2: id.gameId});
    const question = await this.saQuizQueryRepository.getQuestion(id.questionId);
    // console.log({ ques: question});

    if (!question) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(new PublishQuestionCommand(id.questionId, inputModel));
    }
  }
}