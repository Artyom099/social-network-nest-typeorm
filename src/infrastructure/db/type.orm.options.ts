import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app-config';

@Injectable()
export class TypeOrmOptions implements TypeOrmOptionsFactory {
  constructor(
    private configService: ConfigService,
    @Inject(AppConfig.name) private appConfig: AppConfig,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.getOrThrow<string>('NODE_ENV');

    if (
      (nodeEnv && nodeEnv.toUpperCase() === 'DEVELOPMENT') ||
      nodeEnv.toUpperCase() === 'TEST'
    ) {
      console.log('use_dev_db');
      return this.getLocalDb();
    } else {
      console.log('use_prod_db');
      return this.getRemoteDb();
    }
  }

  private getLocalDb(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.PG_LOCAL_HOST || '127.0.0.1',
      port: Number(process.env.PG_LOCAL_PORT) || 5432,
      username: 'postgres',
      password: 'vgy78uhb',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    };
  }

  private getRemoteDb(): TypeOrmModuleOptions {
    console.log(this.configService.get('PG_REMOTE_URL'));
    return {
      type: 'postgres',
      url: this.configService.getOrThrow<string>('PG_REMOTE_URL'),
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    };
  }
}
