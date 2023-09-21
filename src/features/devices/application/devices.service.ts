import {Injectable} from '@nestjs/common';
import {DevicesRepository} from '../infrastructure/devices.repository';
import {DeviceViewModel} from '../api/models/device.view.model';
import {CreateDeviceDTO} from '../api/models/create.device.dto';

@Injectable()
export class DevicesService {
  constructor(private securityRepository: DevicesRepository) {}

  //todo - переписать на use cases
  async createDevise(createDeviceDTO: CreateDeviceDTO): Promise<DeviceViewModel> {
    return this.securityRepository.createDevice(createDeviceDTO);
  }
  async updateLastActiveDate(deviceId: string, date: Date) {
    return this.securityRepository.updateLastActiveDate(deviceId, date);
  }

  async deleteCurrentDevice(deviceId: string) {
    return this.securityRepository.deleteCurrentDevice(deviceId);
  }
  async deleteOtherDevices(deviceId: string, userId: string) {
    return this.securityRepository.deleteOtherDevices(deviceId, userId);
  }
  async deleteAllDevices(userId: string) {
    return this.securityRepository.deleteAllDevices(userId);
  }
}
