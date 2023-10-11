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
  async updateBlog(id: string, dto: BlogInputModel) {
    return this.dataSource
      .createQueryBuilder()
      .update(Blogs)
      .set({ name: dto.name, description: dto.description, websiteUrl: dto.websiteUrl})
      .where("id = :id", { id, InputModel: dto })
      .execute()
  }
  async deleteBlog(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Blogs)
      .where("id = :id", { id })
      .execute()
  }

  async updateBlogOwner(id: string, userId: string, login: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Blogs)
      .set({ userId: userId, userLogin: login})
      .where("id = :id", { id, userId, login })
      .execute()
  }

  async banBlog(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .update(Blogs)
      .set({ isBanned: true, banDate: new Date()})
      .where("id = :id", { id })
      .execute()
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
