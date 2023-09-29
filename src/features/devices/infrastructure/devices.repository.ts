import {Injectable} from '@nestjs/common';
import {DeviceViewModel} from '../api/models/device.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {CreateDeviceDTO} from '../api/models/create.device.dto';
import {Users} from '../../users/entity/user.entity';
import {Devices} from '../entity/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createDevice1(dto: CreateDeviceDTO): Promise<DeviceViewModel> {
    return this.dataSource.query(`
    insert into "devices"
    ("ip", "title", "lastActiveDate", "deviceId", "userId")
    values ($1, $2, $3, $4, $5)
    `, [
      dto.ip,
      dto.title,
      dto.lastActiveDate,
      dto.deviceId,
      dto.userId,
    ])
  }
  async createDevice(dto: CreateDeviceDTO): Promise<DeviceViewModel> {
    const test = await this.dataSource
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

    // console.log(test, 'ret val');

    const [device] = await this.dataSource.query(`
    select "ip", "title", "lastActiveDate", "deviceId"
    from "devices"
    where "deviceId" = $1
    `, [dto.deviceId])

    return device ? device : null
  }

  async updateLastActiveDate1(deviceId: string, date: Date) {
    return this.dataSource.query(`
    update "devices"
    set "lastActiveDate" = $1
    where "deviceId" = $2
    `, [date, deviceId])
  }
  async updateLastActiveDate(deviceId: string, date: Date) {
    return this.dataSource
      .createQueryBuilder()
      .update(Devices)
      .set({ lastActiveDate: date})
      .where("deviceId = :deviceId", { deviceId })
      .execute()
  }

  async deleteCurrentDevice1(deviceId: string) {
    return this.dataSource.query(`
    delete from "devices"
    where "deviceId" = $1
    `, [deviceId])
  }
  async deleteCurrentDevice(deviceId: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Devices)
      .where("deviceId = :deviceId", { deviceId })
      .execute()
  }

  async deleteOtherDevices1(deviceId: string, userId: string) {
    return this.dataSource.query(`
    delete from "devices"
    where "deviceId" != $1 and "userId" = $2
    `, [deviceId, userId])
  }
  async deleteOtherDevices(deviceId: string, userId: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Devices)
      .where("deviceId != :deviceId and userId = :userId", { deviceId, userId })
      .execute()
  }

  async deleteAllDevices1(userId: string) {
    return this.dataSource.query(`
    delete from "devices"
    where "userId" = $1
    `, [userId])
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
