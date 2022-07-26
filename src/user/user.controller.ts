import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DefaultResponse,
  FindUserResponse,
  FindUsersResponse,
  UserBasicData,
} from 'types';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/add-many-students')
  @UseInterceptors(FileInterceptor('file'))
  addManyStudents(@UploadedFile() file: Express.Multer.File): Promise<string> {
    return this.userService.addManyStudents(file.buffer.toString());
  }

  // @TODO delete in future, just for tests (later will import users from .csv)
  @Post('/')
  create(@Body() user: Omit<UserBasicData, 'id'>): Promise<FindUsersResponse> {
    return this.userService.create(user);
  }

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
    @Body() editedUserData: UserBasicData,
  ): Promise<FindUserResponse> {
    return this.userService.update(id, editedUserData);
  }

  @Delete('/:id')
  remove(@Param('id') id: string): Promise<DefaultResponse> {
    return this.userService.remove(id);
  }
}
