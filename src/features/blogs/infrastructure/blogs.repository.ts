import {Injectable} from '@nestjs/common';
import {BlogViewModel} from '../api/models/view/blog.view.model';
import {BlogInputModel} from '../api/models/input/blog.input.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {CreateBlogModel} from '../api/models/dto/create.blog.model';
import {Users} from '../../users/entity/user.entity';
import {Blogs} from '../entity/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog1(dto: CreateBlogModel): Promise<BlogViewModel> {
    await this.dataSource.query(`
    insert into "blogs"
    ("id", "name", "description", "websiteUrl", "createdAt", "isMembership", 
      "userId", "userLogin", "isBanned", "banDate")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      dto.id,
      dto.inputModel.name,
      dto.inputModel.description,
      dto.inputModel.websiteUrl,
      dto.createdAt,
      dto.isMembership,
      dto.userId,
      dto.userLogin,
      dto.isBanned,
      dto.banDate,
    ])

    const [blog] = await this.dataSource.query(`
    select *
    from "blogs"
    where "id" = $1
    `, [dto.id])

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }
  }
  async createBlog(dto: CreateBlogModel): Promise<BlogViewModel> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Blogs)
      .values({
        id: dto.id,
        name: dto.inputModel.name,
        description: dto.inputModel.description,
        websiteUrl: dto.inputModel.websiteUrl,
        createdAt: dto.createdAt,
        isMembership: dto.isMembership,
        // userId: dto.userId,
        userLogin: dto.userLogin,
        isBanned: dto.isBanned,
        // banDate: dto.banDate,
      })
      .execute()

    const [blog] = await this.dataSource.query(`
    select *
    from "blogs"
    where "id" = $1
    `, [dto.id])

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }
  }

  async updateBlog1(id: string, InputModel: BlogInputModel) {
    return this.dataSource.query(`
    update "blogs"
    set "name" = $1, "description" = $2, "websiteUrl" = $3
    where "id" = $4
    `, [
      InputModel.name,
      InputModel.description,
      InputModel.websiteUrl,
      id,
    ])
  }
  async updateBlog(id: string, InputModel: BlogInputModel) {
    return this.dataSource
      .createQueryBuilder()
      .update(Blogs)
      .set({ name: InputModel.name, description: InputModel.description, websiteUrl: InputModel.websiteUrl})
      .where("id = :id", { id, InputModel })
      .execute()
  }

  async deleteBlog1(id: string) {
    return this.dataSource.query(`
    delete from "blogs"
    where "id" = $1
    `, [id])
  }
  async deleteBlog(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Blogs)
      .where("id = :id", { id })
      .execute()
  }

  async updateBlogOwner1(id: string, userId: string, login: string) {
    return this.dataSource.query(`
    update "blogs"
    set "userId" = $1, "userLogin" = $2
    where "id" = $3
    `, [
      userId,
      login,
      id,
    ])
  }
  async updateBlogOwner(id: string, userId: string, login: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Blogs)
      .set({ userId: userId, userLogin: login})
      .where("id = :id", { id, userId, login })
      .execute()
  }

  async banBlog1(id: string) {
    return this.dataSource.query(`
    update "blogs"
    set "isBanned" = true, "banDate" = $2
    where "id" = $1
    `, [id, new Date()])
  }
  async banBlog(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Blogs)
      .set({ isBanned: true, banDate: new Date()})
      .where("id = :id", { id })
      .execute()
  }
  async unbanBlog1(id: string) {
    return this.dataSource.query(`
    update "blogs"
    set "isBanned" = false
    where "id" = $1
    `, [id])
  }
  async unbanBlog(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Blogs)
      .set({ isBanned: false})
      .where("id = :id", { id })
      .execute()
  }
}
