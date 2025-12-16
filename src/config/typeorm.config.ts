import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async () => ({
    type: process.env.DATABASE as 'postgres',
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DBNAME,
    synchronize: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    cli: {
      migrationsDir: __dirname + '/../migrations',
    },
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
    cache: true,
    logger: 'advanced-console',
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
  }),
};
