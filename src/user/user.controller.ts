import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import {
  DefaultResponse,
  EditedUserData,
  FindUserResponse,
  FindUsersResponse,
} from '../types/interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  findAll(): Promise<FindUsersResponse> {
    return this.userService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string): Promise<FindUserResponse> {
    return this.userService.findOne(id);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() editedUserData: EditedUserData,
  ): Promise<FindUserResponse> {
    return this.userService.update(id, editedUserData);
  }

  @Delete('/:id')
  remove(@Param('id') id: string): Promise<DefaultResponse> {
    return this.userService.remove(id);
  }
}
