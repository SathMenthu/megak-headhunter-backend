import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { UserToUser } from '../user/entities/user-to-user.entity';

@Injectable()
export class CronService {
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async removeOldMeetings() {
    const arrayOfExpiredUserToUserRelation = await UserToUser.find({
      where: {
        reservationEndDate: LessThan(
          new Date(new Date().setDate(new Date().getDate())),
        ),
      },
    });
    if (arrayOfExpiredUserToUserRelation) {
      arrayOfExpiredUserToUserRelation.map(async (relation): Promise<void> => {
        await UserToUser.remove(relation);
      });
    }
  }
}
