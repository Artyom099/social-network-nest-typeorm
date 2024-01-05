import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {DevicesService} from '../application/devices.service';
import {TokensService} from '../../../infrastructure/services/tokens.service';
import {DevicesQueryRepository} from '../infrastructure/devices.query.repository';
import {CookieGuard} from '../../../infrastructure/guards/cookie.guard';

@Controller('security')
@UseGuards(CookieGuard)
export class DevicesController {
  constructor(
    private tokensService: TokensService,
    private devicesService: DevicesService,
    private devicesQueryRepository: DevicesQueryRepository,
  ) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getDevices(@Req() req: any) {
    const payload = await this.tokensService.getTokenPayload(req.cookies.refreshToken);
    return this.devicesQueryRepository.getDevices(payload.userId);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(@Req() req: any) {
    const payload = await this.tokensService.getTokenPayload(req.cookies.refreshToken);
    return this.devicesService.deleteOtherDevices(payload.deviceId, payload.userId);
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentDevice(@Req() req: any, @Param('id') deviceId: string) {
    const currentDevice = await this.devicesQueryRepository.getDevice(deviceId);
    if (!currentDevice) throw new NotFoundException();

    const payload = await this.tokensService.getTokenPayload(req.cookies.refreshToken);
    const activeDevices = await this.devicesQueryRepository.getDevices(payload.userId);

    if (!activeDevices.find((s) => s.deviceId === currentDevice.deviceId)) {
      throw new ForbiddenException();
    } else {
      return this.devicesService.deleteCurrentDevice(deviceId);
    }
  }
}
