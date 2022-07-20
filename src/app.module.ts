import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [UserModule, AuthModule, TypeOrmModule.forRootAsync(typeOrmConfig)],
  controllers: [],
})
export class AppModule {}
