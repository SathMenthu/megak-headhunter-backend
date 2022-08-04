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
      username: 'root',
      password: 'test',
      database: 'megak_headhunter',
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
  HASH_SECRET_KEY: "p26=ZUob3tWY4@]ab'~TUAAf5lNBtfsknJk@}XQYQ4wwr.w5oR",
  TOKEN_SECRET: 'P;@4Ct}9iQ41v$V(f(soK(.D$7cW8d2-~5hba(#Y5X}~gA1Q)f',
};

export const mainConfigInfo = {
  yourDomainName: 'http://127.0.0.1:8080',
};

export const papaParseConfig = {
  maxNumberOfLinesParsed: 300,
};

export const mailConfig = {
  mailHost: 'localhost',
  mailPort: 2500,
  mailUserName: 'user-name',
  mailPassword: 'user-pass',
  adminEmail: 'test@example.com',
  mailSecure: false,
  mailPreview: true,
  mailTlsRejectUnauthorized: false,
};
