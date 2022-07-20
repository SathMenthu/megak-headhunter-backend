import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
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
}
