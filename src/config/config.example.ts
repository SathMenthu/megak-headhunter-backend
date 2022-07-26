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
  TOKEN_SECRET: 'secret',
};

export const mainConfigInfo = {
  yourDomainName: 'YOUR_DOMAIN_NAME',
};

export const papaParseConfig = {
  maxNumberOfLinesParsed: 300,
};

/** ------------------ COMMENT ONE ---------------------*/
/** ---------------- Outside SMTP Server - config ------------------ */
// export const mailConfig = {
//   mailHost: 'HOST_NAME',
//   mailPort: 'PORT_NAME',
//   mailUserName: 'YOUR-EMAIL_USERNAME',
//   mailPassword: 'YOUR_PASSWORD',
//   adminEmail: 'YOUR-EMAIL',
//   mailSecure: false, // boolean true or false, depending on server status
//   mailPreview: true, // If you want to see emails
// };

/** ------------------- localhost - config ------------------- */
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
