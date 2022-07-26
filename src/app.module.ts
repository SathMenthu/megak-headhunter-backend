import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { typeOrmConfig } from './config/config';
import { MailModule } from './mail/mail.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UtilitiesModule,
    MailModule,
    CronModule,
  ],
  controllers: [],
})
export class AppModule {}
