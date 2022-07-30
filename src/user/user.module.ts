import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UtilitiesModule } from '../utilities/utilities.module';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [UtilitiesModule, MailModule],
  exports: [UserService],
})
export class UserModule {}
