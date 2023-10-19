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
    const user = await this.questionRepo
      .createQueryBuilder('question')
      .where('question.id = :id', {id: id})
      .getOne();
  }
  async getQuestions(query: GamePairPaginationInput) {

    const items = [
      {
        id: 'uuid',
        body: 'uuid',
        correctAnswers: [ 'string', 'string' ],
        published: false,
        crestedAt: 'uuid',
        updatedAt: 'uuid',
      }
    ]
    const totalCount = { count: '0' };

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }
}