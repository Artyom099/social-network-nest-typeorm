import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GamePairPaginationInput } from '../../../infrastructure/pagination/pagination.input.models';
import { Question } from '../entity/question.entity';
import { Pagination } from '../../../infrastructure/pagination/pagination';
import { QuestionViewModel } from '../api/models/view/question.view.model';

@Injectable()
export class SAQuizQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getQuestion(id: string): Promise<Question | null> {
    const [question] = await this.dataSource.query(
      `
    select * 
    from question
    where "id" = $1
    `,
      [id],
    );

    return question ? question : null;
  }

  async getQuestions(
    query: GamePairPaginationInput,
  ): Promise<Pagination<QuestionViewModel>> {
    const [totalCount] = await this.dataSource.query(
      `
      select count(*)
      from question
      where ("body" ilike $1)
      and ("published" = $2 or $2 is null)
    `,
      [`%${query.bodySearchTerm}%`, query.publishedStatus],
    );

    const sortedQuestions = await this.dataSource.query(
      `
      select *
      from question
      where ("body" ilike $1)
      and ("published" = $2 or $2 is null)
      order by "${query.sortBy}" ${query.sortDirection}
      limit $3
      offset $4
    `,
      [
        `%${query.bodySearchTerm}%`,
        query.publishedStatus,
        query.pageSize,
        query.offset(),
      ],
    );

    const items = sortedQuestions.map((q) => {
      return {
        id: q.id,
        body: q.body,
        correctAnswers: q.correctAnswers,
        published: q.published,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }
}
