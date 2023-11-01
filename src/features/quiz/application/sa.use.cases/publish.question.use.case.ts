import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {PublishQuestionInputModel} from '../../api/models/input/publish.question.input.model';
import {SAQuizRepository} from '../../infrastructure/sa.quiz.repository';

export class PublishQuestionCommand {
  constructor(
    public questionId: string,
    public inputModel: PublishQuestionInputModel,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand> {
  constructor(private saQuizRepository: SAQuizRepository) {}

  async execute(command: PublishQuestionCommand) {
    return this.saQuizRepository.publishQuestion(command.questionId, command.inputModel.published);
  }
}