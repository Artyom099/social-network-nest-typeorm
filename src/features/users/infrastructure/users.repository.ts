import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserViewModel } from '../api/models/view/user.view.model';
import { SAUserViewModel } from '../api/models/view/sa.user.view.model';
import { CreateUserDTO } from '../api/models/dto/create.user.dto';
import { Users } from '../entity/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUserByAdmin(dto: CreateUserDTO): Promise<SAUserViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values({
        login: dto.InputModel.login,
        email: dto.InputModel.email,
        passwordSalt: dto.salt,
        passwordHash: dto.hash,
        createdAt: dto.expirationDate,
        isBanned: false,
        confirmationCode: dto.confirmationCode,
        isConfirmed: dto.isConfirmed,
      })
      .execute();

    const [user] = await this.dataSource.query(
      `
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "users"
    where "login" = $1
    `,
      [dto.InputModel.login],
    );

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      // banInfo: {
      //   isBanned: user.isBanned,
      //   banDate: user.banDate,
      //   banReason: user.banReason,
      // },
    };
  }
  async createUserBySelf(dto: CreateUserDTO): Promise<UserViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values({
        login: dto.InputModel.login,
        email: dto.InputModel.email,
        passwordSalt: dto.salt,
        passwordHash: dto.hash,
        createdAt: dto.expirationDate,
        isBanned: false,
        confirmationCode: dto.confirmationCode,
        isConfirmed: dto.isConfirmed,
      })
      .execute();

    const [user] = await this.dataSource.query(
      `
    select "id", "login", "email", "createdAt"
    from "users"
    where "login" = $1
    `,
      [dto.InputModel.login],
    );

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async banUser(id: string, banReason: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ isBanned: true, banReason: banReason, banDate: new Date() })
      .where('id = :id', { id })
      .execute();
  }
  async unbanUser(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ isBanned: false, banReason: null, banDate: null })
      .where('id = :id', { id })
      .execute();
  }
  async confirmEmail(id: string) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ isConfirmed: true })
      .where('id = :id', { id })
      .execute();
    return !!result;
  }

  async updateSaltAndHash(id: string, salt: string, hash: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ passwordSalt: salt, passwordHash: hash })
      .where('id = :id', { id })
      .execute();
  }
  async updateRecoveryCode(id: string, code: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ recoveryCode: code })
      .where('id = :id', { id })
      .execute();
  }
  async updateConfirmationCode(id: string, code: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ confirmationCode: code })
      .where('id = :id', { id })
      .execute();
  }

  async deleteUser(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Users)
      .where('id = :id', { id })
      .execute();
  }
}
