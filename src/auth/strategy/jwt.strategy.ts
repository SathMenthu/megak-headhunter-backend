import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { secretConfig } from '../../config/config';

function cookieExtractor(req: Request): null | string {
  return req && req.cookies ? req.cookies?.jwt ?? null : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      ignoreExpiration: false,
      jwtFromRequest: cookieExtractor,
      secretOrKey: secretConfig.TOKEN_SECRET,
    });
  }

  async validate(
    payload: JwtPayload,
    done: (error: UnauthorizedException | null, user: User | boolean) => void,
  ) {
    if (!payload || !payload.id) {
      return done(new UnauthorizedException(), false);
    }
    const user = await User.findOneBy({ activeTokenId: payload.id });
    if (!user) {
      return done(new UnauthorizedException(), false);
    }

    if (user.accountBlocked) {
      return done(new UnauthorizedException(), false);
    }

    return done(null, user);
  }
}
