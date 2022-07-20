import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UtilitiesModule } from '../utilities/utilities.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UtilitiesModule],
})
export class AuthModule {}
