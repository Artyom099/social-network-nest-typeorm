import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {appSettings} from './infrastructure/settings/app.settings';

export const bootstrap = async () => {
  try {
    const app = await NestFactory.create(AppModule);
    appSettings(app);
    const PORT = process.env.PORT || 3000;
    await app.listen(PORT, () => {
      console.log(`App started at ${PORT} port`);
    });
  } catch (e) {
    console.log('cant start', e);
  }
}
bootstrap();
