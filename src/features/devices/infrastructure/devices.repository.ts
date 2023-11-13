import {Injectable} from '@nestjs/common';
import {DeviceViewModel} from '../api/models/device.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {CreateDeviceDTO} from '../api/models/create.device.dto';
import {Devices} from '../entity/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createDevice(dto: CreateDeviceDTO): Promise<DeviceViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Devices)
      .values({
        ip: dto.ip,
        title: dto.title,
        lastActiveDate: dto.lastActiveDate,
        deviceId: dto.deviceId,
        userId: dto.userId,
      })
      // .returning(['deviceId', 'ip'])
      .execute()

    const [device] = await this.dataSource.query(`
    select "ip", "title", "lastActiveDate", "deviceId"
    from "devices"
    where "deviceId" = $1
    `, [dto.deviceId])

    return device ? device : null
  }
  async updateLastActiveDate(deviceId: string, date: Date) {
    return this.dataSource
      .createQueryBuilder()
      .update(Devices)
      .set({ lastActiveDate: date})
      .where("deviceId = :deviceId", { deviceId })
      .execute()
  }

  async deleteCurrentDevice(deviceId: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Devices)
      .where("deviceId = :deviceId", { deviceId })
      .execute()
  }
  async deleteOtherDevices(deviceId: string, userId: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Devices)
      .where("deviceId != :deviceId and userId = :userId", { deviceId, userId })
      .execute()
  }
  async deleteAllDevices(userId: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Devices)
      .where("userId = :userId", { userId })
      .execute()
  }
}
