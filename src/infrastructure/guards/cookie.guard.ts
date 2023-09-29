import {CanActivate, ExecutionContext, Injectable, UnauthorizedException,} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Request} from 'express';
import {DevicesQueryRepository} from '../../features/devices/infrastructure/devices.query.repository';
import {jwtConstants} from '../utils/settings';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private devicesQueryRepository: DevicesQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = CookieGuard.extractTokenFromCookie(request);
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {secret: jwtConstants.refreshSecret});
      console.log({payload_1: payload});
      const tokenIssuedAt = new Date(payload.iat * 1000).toString();
      console.log({tokenIssuedAt_2: tokenIssuedAt});
      const lastActiveSession = await this.devicesQueryRepository.getDevice(payload.deviceId);
      console.log({lastActiveSession_3: lastActiveSession});

      console.log({ yyyy_4: !lastActiveSession || tokenIssuedAt !== lastActiveSession.lastActiveDate.toString() });

      if (!lastActiveSession || tokenIssuedAt !== lastActiveSession.lastActiveDate.toString()) {
        throw new UnauthorizedException();
      } else {
        request.userId = payload.userId;
        return true;
      }

    } catch (e) {
      console.log('error', e);
      throw new UnauthorizedException();
    }
  }

  private static extractTokenFromCookie(request: Request): string | null {
    if (request.cookies && request.cookies.refreshToken) {
      return request.cookies.refreshToken;
    }
    return null;
  }
}
