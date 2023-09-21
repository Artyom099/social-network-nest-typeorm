import {Injectable} from '@nestjs/common';
import {DeviceViewModel} from '../api/models/device.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDevice(deviceId: string): Promise<DeviceViewModel | null> {
    const device = await this.dataSource.query(`
    select "ip", "title", "lastActiveDate", "deviceId"
    from "Devices"
    where "deviceId" = $1
    `, [deviceId])

    return device.length ? device[0] : null
  }

  async getDevices(userId: string): Promise<DeviceViewModel[]> {
    return this.dataSource.query(`
    select "ip", "title", "lastActiveDate", "deviceId"
    from "Devices"
    where "userId" = $1
    `, [userId])
  }
}
