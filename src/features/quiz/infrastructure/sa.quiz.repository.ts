import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Question } from '../entity/question.entity';
import { CreateQuestionInputModel } from '../api/models/input/create.question.input.model';
import { CreateQuestionDTO } from '../api/models/dto/create.question.dto';

@Injectable()
export class SAQuizRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createQuestion(dto: CreateQuestionDTO) {
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
      })
      .execute();
  }

  async deleteQuestion(id: string) {
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Question)
      .where('id = :id', { id })
      .execute();
  }

  async updateQuestion(id: string, dto: CreateQuestionInputModel) {
    return this.dataSource
      .createQueryBuilder()
      .update(Question)
      .set({
        body: dto.body,
        correctAnswers: dto.correctAnswers,
        updatedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
  }

  async publishQuestion(id: string, published: boolean) {
    return this.dataSource
      .createQueryBuilder()
      .update(Question)
      .set({ published, updatedAt: new Date() })
      .where('id = :id', { id })
      .execute();
  }
}
