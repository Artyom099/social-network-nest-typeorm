import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {jwtConstants} from '../utils/settings';
import {TokenPayloadModel} from '../../features/auth/api/models/token.payload.model';
import {PayloadModel} from '../../features/auth/api/models/payload.model';
import {TokenOutputModel} from '../../features/auth/api/models/token.output.model';

@Injectable()
export class TokensService {
  constructor(
    private jwtService: JwtService,
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
        secret: jwtConstants.accessSecret,
        expiresIn: '5m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: '20s',
      }),
    };
  }
  async updateJWT(payload: TokenPayloadModel): Promise<TokenOutputModel> {
    const newPayload = { userId: payload.userId, deviceId: payload.deviceId };
    return {
      accessToken: await this.jwtService.signAsync(newPayload, {
        secret: jwtConstants.accessSecret,
        expiresIn: '5m',
      }),
      refreshToken: await this.jwtService.signAsync(newPayload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: '20s',
      }),
    };
  }
}
