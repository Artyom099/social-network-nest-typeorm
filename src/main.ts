import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './infrastructure/settings/app.settings';

export const bootstrap = async () => {
  try {
    const app = await NestFactory.create(AppModule, { abortOnError: false });
    appSettings<AppModule>(app, AppModule);
    const PORT = process.env.PORT || 3003;

    await app.listen(PORT, () => {
      console.log(`App started at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log('cant start', e);
  }
};
bootstrap().catch(console.error);
