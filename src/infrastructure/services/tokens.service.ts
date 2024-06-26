import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadModel } from '../../features/auth/api/models/token.payload.model';
import { PayloadModel } from '../../features/auth/api/models/payload.model';
import { TokenOutputModel } from '../../features/auth/api/models/token.output.model';
import { appConfig, AppConfig } from '../../config/app-config';

@Injectable()
export class TokensService {
  constructor(
    private jwtService: JwtService,
    @Inject(AppConfig.name) private appConfig: AppConfig,
  ) {}

  async getTokenPayload(token: string): Promise<any | null> {
    try {
      // { userId: '1682507411257', deviceId: '1682507411257', iat: 1682507422, exp: 1682511022 }
      return this.jwtService.decode(token);
    } catch (e) {
      return null;
    }
  }

  async createJWT(payload: PayloadModel): Promise<TokenOutputModel> {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        // secret: jwtConstants.accessSecret,
        expiresIn: appConfig.settings.jwt.ACCESS_TOKEN_LIFETIME_SECONDS,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        // secret: jwtConstants.refreshSecret,
        expiresIn: appConfig.settings.jwt.REFRESH_TOKEN_LIFETIME_SECONDS,
      }),
    };
  }

  async updateJWT(payload: TokenPayloadModel): Promise<TokenOutputModel> {
    const newPayload = { userId: payload.userId, deviceId: payload.deviceId };
    return {
      accessToken: await this.jwtService.signAsync(newPayload, {
        // secret: jwtConstants.accessSecret,
        expiresIn: appConfig.settings.jwt.ACCESS_TOKEN_LIFETIME_SECONDS,
      }),
      refreshToken: await this.jwtService.signAsync(newPayload, {
        // secret: jwtConstants.refreshSecret,
        expiresIn: appConfig.settings.jwt.REFRESH_TOKEN_LIFETIME_SECONDS,
      }),
    };
  }
}
