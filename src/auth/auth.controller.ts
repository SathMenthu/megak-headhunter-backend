import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { UserData } from '../decorators/user-data-decorator';
import { AuthLoginData } from '../types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() request: AuthLoginData,
    @Res() response: Response,
  ): Promise<Response> {
    return this.authService.login(request, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  async logout(
    @UserData() user: User,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.logout(user, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  findMe(@Req() request: { user: User }) {
    if (request.user.accountBlocked) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.me(request.user);
  }
}
