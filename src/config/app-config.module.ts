import { Global, Module } from '@nestjs/common';
import { AppConfig, appConfig } from './app-config';

@Global()
@Module({
  providers: [
    {
      provide: AppConfig.name,
      useValue: appConfig,
    },
  ],
  exports: [AppConfig.name],
})
export class AppConfigModule {}
