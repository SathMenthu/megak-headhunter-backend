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
import { User } from './entities/user.entity';
import { StudentBasicData } from '../../types/interfaces/user/student';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/add-many-students')
  @UseInterceptors(FileInterceptor('file'))
  addManyStudents(@UploadedFile() file: Express.Multer.File): Promise<boolean> {
    return this.userService.addManyStudents(file.buffer.toString());
  }

  // @TODO delete in future, just for tests (later will import users from .csv), you could try to use it for HR users
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

  @Patch('/register/:id')
  async registerStudent(
    @Param('id') id: string,
    @Body() studentData: Partial<StudentBasicData>,
  ): Promise<DefaultResponse> {
    const foundedStudent = await User.findOneBy({ activationLink: id });
    return foundedStudent
      ? this.userService.registerStudent(foundedStudent, studentData)
      : { isSuccess: false, message: 'Link is no longer active' };
  }

  @Delete('/:id')
  remove(@Param('id') id: string): Promise<DefaultResponse> {
    return this.userService.remove(id);
  }
}
