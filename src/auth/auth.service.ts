import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload, sign } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';
import { AuthLoginData, TokenPayload } from '../types';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from '../user/entities/user.entity';
import { secretConfig } from '../config/config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UtilitiesService)
    private readonly utilitiesService?: UtilitiesService,
    private readonly userService?: UserService,
  ) {}

  // Create JWT Token

  private createToken(currentTokenId: string): TokenPayload {
    const payload: JwtPayload = { id: currentTokenId };
    const expiresIn = 1000 * 60 * 60 * 24 * 31; // 1 Month
    const accessToken = sign(payload, secretConfig.TOKEN_SECRET, { expiresIn });
    return {
      accessToken,
      expiresIn,
    };
  }

  // Function that looks for token in database, and create new by createToken function

  private async generateToken(user: User): Promise<string> {
    let token: string;
    let userWithThisToken = null;
    do {
      token = uuid();
      userWithThisToken = await User.findOneBy({ activeTokenId: token });
    } while (!!userWithThisToken);
    user.activeTokenId = token;
    await user.save();

    return token;
  }

  // Login function

  async login(request: AuthLoginData, response: Response): Promise<Response> {
    try {
      const user = await User.findOneBy({
        email: request.email,
        password: this.utilitiesService.hashPassword(request.password),
      });
      if (!user) {
        return response.json({
          message: 'Incorrect login data.',
          isSuccess: false,
        });
      }
      if (user.accountBlocked) {
        return response.json({
          message: 'Account is not activated.',
          isSuccess: false,
        });
      }
      const token = this.createToken(await this.generateToken(user));

      return response
        .cookie('jwt', token.accessToken, {
          secure: false,
          httpOnly: true,
          expires: new Date(new Date().getTime() + token.expiresIn),
        })
        .json({
          isSuccess: true,
          message: 'Successfully logged in.',
          user: {
            id: user.id,
            email: user.email,
            permission: user.permission,
          },
        });
    } catch (e) {
      return response.json({
        isSuccess: false,
        message: 'An error occurred while logging in',
      });
    }
  }

  // Logout function protected by AuthGuard

  public async logout(user: User, res: Response): Promise<Response> {
    try {
      // Clear Token in Database
      user.activeTokenId = null;
      await user.save();

      // Clear Cookies
      res.clearCookie('jwt', {
        secure: false,
        httpOnly: true,
      });

      // Response when successfully logout
      return res.json({
        isSuccess: true,
        message: 'User successfully logged off.',
      });
    } catch (e) {
      // Response when got error during the logout
      return res.json({
        isSuccess: false,
        message: 'An error occurred while logging out the user.',
      });
    }
  }

  // Service for valid user auth

  async me(user: User) {
    return this.userService.baseUserFilter(user);
  }
}
