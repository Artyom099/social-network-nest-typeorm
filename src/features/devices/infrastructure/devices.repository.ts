import {Injectable} from '@nestjs/common';
import {DeviceViewModel} from '../api/models/device.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {CreateDeviceDTO} from '../api/models/create.device.dto';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createDevice(dto: CreateDeviceDTO): Promise<DeviceViewModel> {
    return this.dataSource.query(`
    insert into "devices"
    ("ip", "title", "lastActiveDate", "deviceId", "userId")
    values ($1, $2, $3, $4, $5)
    `, [
      // dto.id,
      dto.ip,
      dto.title,
      dto.lastActiveDate,
      dto.deviceId,
      dto.userId,
    ])
  }

  async updateLastActiveDate(deviceId: string, date: Date) {
    return this.dataSource.query(`
    update "devices"
    set "lastActiveDate" = $1
    where "deviceId" = $2
    `, [date, deviceId])
  }

  async deleteCurrentDevice(deviceId: string) {
    return this.dataSource.query(`
    delete from "devices"
    where "deviceId" = $1
    `, [deviceId])
  }
  async deleteOtherDevices(deviceId: string, userId: string) {
    return this.dataSource.query(`
    delete from "devices"
    where "deviceId" != $1 and "userId" = $2
    `, [deviceId, userId])
  }
  async deleteAllDevices(userId: string) {
    return this.dataSource.query(`
    delete from "devices"
    where "userId" = $1
    `, [userId])
  }
}
