import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { typeOrmConfig } from '../config/config';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UtilitiesModule,
  ],
  controllers: [],
})
export class AppModule {}
