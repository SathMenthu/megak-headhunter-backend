import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { secretConfig } from '../config/config';

@Injectable()
export class UtilitiesService {
  hashPassword(password: string): string {
    if (!password)
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Passwords must be provided',
        },
        HttpStatus.FORBIDDEN,
      );
    const hmac = createHmac('sha512', secretConfig.HASH_SECRET_KEY);
    hmac.update(password);
    return hmac.digest('hex');
  }
}
