import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UtilitiesModule } from '../utilities/utilities.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [UtilitiesModule],
})
export class UserModule {}
