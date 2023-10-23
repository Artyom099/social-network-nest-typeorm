import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateQuestionInputModel} from '../../api/models/input/create.question.input.model';
import {SAQuizRepository} from '../../infrastructure/sa.quiz.repository';
import {randomUUID} from 'crypto';
import {CreateQuestionDTO} from '../../api/models/dto/create.question.dto';
import {SAQuizQueryRepository} from '../../infrastructure/sa.quiz.query.repository';

export class CreateQuestionCommand {
  constructor(public inputModel: CreateQuestionInputModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(
    private saQuizRepository: SAQuizRepository,
    private saQuizQueryRepository: SAQuizQueryRepository,
  ) {}

  async execute(command: CreateQuestionCommand) {
    const dto: CreateQuestionDTO = {
      id: randomUUID(),
      body: command.inputModel.body,
      correctAnswers: command.inputModel.correctAnswers,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await this.saQuizRepository.createQuestion(dto)
    return this.saQuizQueryRepository.getQuestion(dto.id)
  }
}