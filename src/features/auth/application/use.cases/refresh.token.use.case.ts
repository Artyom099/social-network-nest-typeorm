import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {TokensService} from '../../../../infrastructure/services/tokens.service';
import {TokenOutputModel} from '../../api/models/token.output.model';

export class RefreshTokenCommand {
  constructor(
    public token: string
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private tokensService: TokensService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{ deviceId: string, lastActiveDate: Date, token: TokenOutputModel }> {
    const payload = await this.tokensService.getTokenPayload(command.token);
    const newToken = await this.tokensService.updateJWT(payload);
    const newPayload = await this.tokensService.getTokenPayload(newToken.refreshToken);
    const lastActiveDate= new Date(newPayload.iat * 1000);
    return { deviceId: payload.deviceId, lastActiveDate, token: newToken }
  }
}