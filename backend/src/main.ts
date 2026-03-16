import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { Express } from 'express';

let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix('v1');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    
    await app.init();
  }
  return app;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async (nestApp) => {
    await nestApp.listen(process.env.PORT ?? 4000);
    console.log(`Application is running on: ${await nestApp.getUrl()}`);
  });
}

// For Vercel serverless
export default async (req: any, res: any) => {
  const nestApp = await bootstrap();
  const instance: Express = nestApp.getHttpAdapter().getInstance();
  return instance(req, res);
};
