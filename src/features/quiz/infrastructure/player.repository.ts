import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class PlayerRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createAnswer() {}
}