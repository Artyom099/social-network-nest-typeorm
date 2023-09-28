import {Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {UserViewModel} from '../api/models/view/user.view.model';
import {SAUserViewModel} from '../api/models/view/sa.user.view.model';
import {CreateUserDTO} from '../api/models/dto/create.user.dto';
import {Users} from '../entity/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ) {}

  async createUserByAdmin1(dto: CreateUserDTO): Promise<SAUserViewModel> {
    await this.dataSource.query(`
    insert into "users"
    ("id", "login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      dto.id,
      dto.InputModel.login,
      dto.InputModel.email,
      dto.salt,
      dto.hash,
      dto.expirationDate,
      false,
      null,
      null,
      dto.confirmationCode,
      null,
      dto.isConfirmed,
      null,
    ])

    const [user] = await this.dataSource.query(`
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "users"
    where "login" = $1
    `, [dto.InputModel.login])

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
        // banDate: null,
        // banReason: null,
        confirmationCode: dto.confirmationCode,
        // expirationDate: null,
        isConfirmed: dto.isConfirmed,
        // recoveryCode: null,
      })
      .execute()

    const [user] = await this.dataSource.query(`
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "users"
    where "login" = $1
    `, [dto.InputModel.login])

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

  async createUserBySelf1(dto: CreateUserDTO): Promise<UserViewModel> {
    await this.dataSource.query(`
    insert into "users"
    ("id", "login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      dto.id,
      dto.InputModel.login,
      dto.InputModel.email,
      dto.salt,
      dto.hash,
      dto.expirationDate,
      false,
      null,
      null,
      dto.confirmationCode,
      null,
      dto.isConfirmed,
      null,
    ])

    const [user] = await this.dataSource.query(`
    select "id", "login", "email", "createdAt"
    from "users"
    where "login" = $1
    `, [dto.InputModel.login])

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
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
        // banDate: null,
        // banReason: null,
        confirmationCode: dto.confirmationCode,
        // expirationDate: null,
        isConfirmed: dto.isConfirmed,
        // recoveryCode: null,
      })
      .execute()

    const [user] = await this.dataSource.query(`
    select "id", "login", "email", "createdAt"
    from "users"
    where "login" = $1
    `, [dto.InputModel.login])

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async banUser1(id: string, banReason: string) {
    return this.dataSource.query(`
    update "users"
    set "isBanned" = true, "banReason" = $1,  "banDate" = $2
    where "id" = $3
    `, [banReason, new Date(), id])
  }
  async banUser(id: string, banReason: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ isBanned: true, banReason: banReason,  banDate: new Date()})
      .where("id = :id", { id })
      .execute()
  }

  async unbanUser1(id: string) {
    return this.dataSource.query(`
    update "users"
    set "isBanned" = false, "banReason" = null,  "banDate" = null
    where "id" = $1
    `, [id])
  }
  async unbanUser(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ isBanned: false, banReason: null,  banDate: null})
      .where("id = :id", { id })
      .execute()
  }

  async confirmEmail1(id: string) {
    return this.dataSource.query(`
    update "users"
    set "isConfirmed" = true
    where "id" = $1
    `, [id])
  }
  async confirmEmail(id: string) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ isConfirmed: true})
      .where("id = :id", { id })
      .execute()
    return !!result
  }

  async updateSaltAndHash1(id: string, salt: string, hash: string) {
    return this.dataSource.query(`
    update "users"
    set "passwordSalt" = $1, "passwordHash" = $2
    where "id" = $3
    `, [salt, hash, id])
  }
  async updateSaltAndHash(id: string, salt: string, hash: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ passwordSalt: salt, passwordHash: hash})
      .where("id = :id", { salt, hash })
      .execute()
  }

  async updateRecoveryCode1(id: string, code: string) {
    return this.dataSource.query(`
    update "users"
    set "recoveryCode" = $1
    where "id" = $2
    `, [code, id])
  }
  async updateRecoveryCode(id: string, code: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ recoveryCode: code})
      .where("id = :id", { code })
      .execute()
  }

  async updateConfirmationCode1(id: string, code: string) {
    return this.dataSource.query(`
    update "users"
    set "confirmationCode" = $1
    where "id" = $2
    `, [code, id])
  }
  async updateConfirmationCode(id: string, code: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ confirmationCode: code})
      .where("id = :id", { code })
      .execute()
  }

  async deleteUser1(id: string) {
    return this.dataSource.query(`
    delete from "users"
    where "id" = $1
    `, [id])
  }
  async deleteUser(id: string) {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Users)
      .where("id = :id", { id })
      .execute()
  }
}
