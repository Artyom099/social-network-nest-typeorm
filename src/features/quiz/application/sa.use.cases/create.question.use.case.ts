import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateQuestionInputModel} from '../../api/models/input/create.question.input.model';
import {SAQuizRepository} from '../../infrastructure/sa.quiz.repository';
import {randomUUID} from 'crypto';

export class CreateQuestionCommand {
  constructor(public inputModel: CreateQuestionInputModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(private saQueryRepository: SAQuizRepository) {
  }

  async execute(command: CreateQuestionCommand) {
    const dto = {
      id: randomUUID(),
      body: command.inputModel.body,
      correctAnswers: command.inputModel.correctAnswers,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await this.saQueryRepository.createQuestion(dto)
  }
}