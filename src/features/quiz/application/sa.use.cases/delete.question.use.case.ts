import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {SAQuizRepository} from '../../infrastructure/sa.quiz.repository';

export class DeleteQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
  constructor(private saQuizRepository: SAQuizRepository) {}

  async execute(command: DeleteQuestionCommand) {
    await this.saQuizRepository.deleteQuestion(command.questionId)
  }
}