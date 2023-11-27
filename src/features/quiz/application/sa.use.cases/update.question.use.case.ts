import {PublishQuestionInputModel} from '../../api/models/input/publish.question.input.model';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {SAQuizRepository} from '../../infrastructure/sa.quiz.repository';
import {CreateQuestionInputModel} from '../../api/models/input/create.question.input.model';

export class UpdateQuestionCommand {
  constructor(
    public questionId: string,
    public inputModel: CreateQuestionInputModel,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(private saQuizRepository: SAQuizRepository) {}

  async execute(command: UpdateQuestionCommand) {
    return this.saQuizRepository.updateQuestion(command.questionId, command.inputModel)
  }
}