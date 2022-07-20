import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export class TypeOrmConfig {
  static getOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'username',
      password: 'password',
      database: 'databasename',
      entities: ['dist/**/**.entity{.ts,.js}'],
      bigNumberStrings: false,
      logging: false,
      synchronize: true, // change to false on production or if you are afraid of data loss
    };
  }
}

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (): Promise<TypeOrmModuleOptions> =>
    TypeOrmConfig.getOrmConfig(),
  inject: [ConfigService],
};

export const secretConfig = {
  HASH_SECRET_KEY: 'secret',
};
