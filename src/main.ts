import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { errorHandler } from './shared/middleware/error';

dotenv.config();

const localhost = new RegExp('^https?://localhost*(:[0-9]+)?(/.*)?$');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('app.name', 'NovaCrust');
  const port = configService.get<number>('app.port');
  const logger = new Logger(`${appName} Core Service`);

  app.use(morgan('dev'));
  app.use(errorHandler);
  app.enableCors({
    credentials: true,
    origin: [localhost],
    optionsSuccessStatus: 204,
  });
  app.useGlobalPipes(new ValidationPipe());
  
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  //   prefix: 'api/v',
  // });

  await app.listen(port);

  app.use(helmet());
  app.use(helmet.xssFilter());

  logger.debug(`${appName} core service running on: ${await app.getUrl()}`);
}

bootstrap();
