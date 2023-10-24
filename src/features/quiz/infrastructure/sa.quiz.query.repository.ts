import {Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {GamePairPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {Users} from '../../users/entity/user.entity';
import {Question} from '../entity/question.entity';

@Injectable()
export class SAQuizQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Users) private questionRepo: Repository<Question>,
  ) {}

  async getQuestion(id: string) {
    const question = await this.questionRepo
      .createQueryBuilder('question')
      .where('question.id = :id', {id: id})
      .getOne();

    return question ? question : null
  }

  async getQuestions(query: GamePairPaginationInput) {
    const [totalCount] = await this.dataSource.query(`
      select count(*)
      from question
      where ("body" ilike $1)
      and ("publishedStatus" = $2 or $2 is null)
    `, [
      `%${query.bodySearchTerm}%`,
      query.publishedStatus,
    ]);

    const sortedQuestions = await this.dataSource.query(`
      select *
      from question
      where ("body" ilike $1)
      and ("published" = $2 or $2 is null)
      order by "${query.sortBy}" ${query.sortDirection}
      limit $3
      offset $4
    `, [
      `%${query.bodySearchTerm}%`,
      query.publishedStatus,
      query.pageSize,
      query.offset(),
    ])

    const items = sortedQuestions.map((q) => {
      return {
        id: q.id,
        body: q.body,
        correctAnswers: q.correctAnswers,
        published: q.published,
        crestedAt: q.crestedAt,
        updatedAt: q.updatedAt,
      }
    })

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }
}