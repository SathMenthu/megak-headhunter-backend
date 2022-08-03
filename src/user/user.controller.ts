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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CheckRegisterDto,
  ConfirmRegisterUserDto,
  DefaultResponse,
  FilteredUser,
  FilterPayload,
  FindUserResponse,
  FindUsersResponse,
  ManuallyCreatedUser,
  UserFilters,
} from 'types';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ForgotPasswordDto } from './forgot-password/forgot-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  findOne(@Param('id') id: string): Promise<FindUserResponse> {
    return this.userService.findOne(id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('/add-many-students')
  @UseInterceptors(FileInterceptor('file'))
  addManyStudents(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DefaultResponse> {
    return this.userService.addManyStudents(file.buffer.toString() as string);
  }

  @Post('/check-register-link')
  checkRegisterLink(@Body() { id, token }: CheckRegisterDto) {
    return this.userService.checkRegisterLink(id, token);
  }

  @Post('/forgot-pass')
  findOneAndSendEmail(
    @Body() emailObj: ForgotPasswordDto,
  ): Promise<DefaultResponse> {
    return this.userService.getOneAndSendEmailWithPassRecovery(emailObj);
  }

  // @TODO add admin role validation
  @Post('/')
  create(@Body() user: ManuallyCreatedUser): Promise<FindUsersResponse> {
    return this.userService.create(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/users')
  findAll(
    @Body() payload: FilterPayload<UserFilters>,
  ): Promise<FindUsersResponse> {
    return this.userService.findAll(payload);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() userData: ConfirmRegisterUserDto,
  ): Promise<FindUserResponse> {
    const foundedUser = await User.findOneBy({ id });
    return this.userService.editUser(foundedUser, userData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/password/:id')
  restartPassword(
    @Param('id') id: string,
    @Body() payload: { password: string },
  ) {
    return this.userService.resetPasswordForTargetUser(id, payload);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/block/:id')
  blockTargetUser(@Param('id') id: string) {
    return this.userService.blockTargetUser(id);
  }

  @Patch('/confirm-register/:id')
  async registerStudent(
    @Param('id') activationLink: string,
    @Body() userData: FilteredUser,
  ): Promise<DefaultResponse> {
    const foundedUser = await User.findOneBy({ activationLink });
    return foundedUser
      ? this.userService.editUser(foundedUser, userData)
      : { isSuccess: false, message: 'Link is no longer active' };
  }

  @Patch('/close-account/:id')
  async closeStudentAccount(@Param('id') id: string): Promise<DefaultResponse> {
    return this.userService.closeStudentAccount(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  remove(@Param('id') id: string): Promise<DefaultResponse> {
    return this.userService.remove(id);
  }
}
