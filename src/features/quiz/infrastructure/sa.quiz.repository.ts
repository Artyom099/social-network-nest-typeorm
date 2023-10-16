import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {Column, DataSource} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {Question} from '../entity/question.entity';

@Injectable()
export class SAQuizRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getQuestions() {}
  async createQuestion(dto) {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Question)
      .values({
        id: dto.id,
        body: dto.body,
        correctAnswers: dto.correctAnswers,
        published: dto.published,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
      })
      .execute()
  }
  async updateQuestion() {}
  async deleteQuestion(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Question)
      .where("id = :id", { id })
      .execute()
  }
  async publishQuestion(id: string, published: boolean) {
    return this.dataSource
      .createQueryBuilder()
      .update(Question)
      .set({ published: published})
      .where("id = :id", { id })
      .execute()
  }
}