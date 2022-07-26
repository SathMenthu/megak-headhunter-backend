import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import * as cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true, origin: 'http://127.0.0.1:8080/' });
  app.setGlobalPrefix('api');
  app.use(json({ limit: '5mb' }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 1000,
    }),
  );
  await app.listen(3004);
}
bootstrap();
