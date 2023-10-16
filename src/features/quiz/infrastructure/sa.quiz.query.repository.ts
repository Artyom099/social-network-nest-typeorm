import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class SAQuizQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

}