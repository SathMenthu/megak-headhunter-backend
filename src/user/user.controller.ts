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
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import {
  CheckRegisterDto,
  ConfirmRegisterUserDto,
  DefaultResponse,
  FilteredUser,
  FilterPayload,
  FilterPayloadForHr,
  FindUserResponse,
  FindUsersResponse,
  HrFilters,
  ManuallyCreatedUser,
  RoleEnum,
  UserFilters,
  StudentStatus
} from '../types';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ForgotPasswordDto } from './forgot-password/forgot-password.dto';
import { RolesGuard } from '../guards/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.HR)
  @Get('/:id')
  findOne(@Param('id') id: string): Promise<FindUserResponse> {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.ADMIN)
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.HR)
  @Post('/users-for-hr')
  usersForHR(@Body() payload: FilterPayloadForHr<HrFilters>) {
    return this.userService.findUsersForHR(payload);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.HR)
  @Post('/reserve-user/:id')
  reserveUser(@Param('id') id: string, @Body() payload: FilteredUser) {
    return this.userService.reserveUser(id, payload);
  }

  @Post('/forgot-pass')
  findOneAndSendEmail(
    @Body() emailObj: ForgotPasswordDto,
  ): Promise<DefaultResponse> {
    return this.userService.getOneAndSendEmailWithPassRecovery(emailObj);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Post('/')
  create(@Body() user: ManuallyCreatedUser): Promise<FindUsersResponse> {
    return this.userService.create(user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Post('/users')
  findAll(
    @Body() payload: FilterPayload<UserFilters>,
  ): Promise<FindUsersResponse> {
    return this.userService.findAll(payload);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.STUDENT, RoleEnum.HR)
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() userData: ConfirmRegisterUserDto,
  ): Promise<FindUserResponse> {
    const foundedUser = await User.findOneBy({ id });
    return this.userService.editUser(foundedUser, userData);
  }

  @Patch('/password/:id')
  restartPassword(
    @Param('id') id: string,
    @Body() payload: { password: string },
  ) {
    return this.userService.resetPasswordForTargetUser(id, payload);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.ADMIN)
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Patch('/close-account/:id')
  async closeStudentAccount(@Param('id') id: string): Promise<DefaultResponse> {
    return this.userService.closeStudentAccount(id);
  }

  @Patch('/change-student-status/:id')
  async changeStudentStatus(
    @Param('id') id: string,
    @Body() payload: { status: StudentStatus },
  ): Promise<DefaultResponse> {
    return this.userService.changeStudentStatus(id, payload);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete('/:id')
  remove(@Param('id') id: string): Promise<DefaultResponse> {
    return this.userService.remove(id);
  }
}
