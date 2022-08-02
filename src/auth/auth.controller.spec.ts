import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { AuthLoginData, RoleEnum } from '../../types';
import { User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';

describe('AuthController', () => {
  let controller: AuthController;

  const mockMailService = {};

  const mailServiceProvider = {
    provide: MailService,
    useValue: mockMailService,
  };

  const mockUser = new User();
  mockUser.id = 'abc';
  mockUser.email = 'test@example.com';
  mockUser.password = 'pwd';
  mockUser.firstName = 'Test_Firstname';
  mockUser.lastName = 'Test_Lastname';
  mockUser.permission = RoleEnum.STUDENT;

  const responseMock = {
    json: jest.fn(x => x),
    cookie: jest.fn(x => x),
  } as unknown as Response;

  const mockAuthService = {
    login: jest.fn((request: AuthLoginData, response: Response) => ({
      isSuccess: true,
      message: 'success_message',
      user: [
        {
          id: 'abc',
          email: 'test@example.com',
          permission: RoleEnum.STUDENT,
        },
      ],
    })),

    logout: jest.fn((user: User, res: Response) => ({
      isSuccess: true,
      message: 'success_message',
    })),

    me: jest.fn((user: User) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      permission: user.permission,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        UtilitiesService,
        mailServiceProvider,
      ],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login user', async () => {
    const request: AuthLoginData = {
      email: 'test@example.com',
      password: 'pwd',
    };

    const result = {
      isSuccess: true,
      message: expect.any(String),
      user: [
        {
          id: expect.any(String),
          email: expect.any(String),
          permission: expect.any(String),
        },
      ],
    };

    expect(await controller.login(request, responseMock)).toEqual(result);
    expect(mockAuthService.login).toHaveBeenCalledWith(request, responseMock);
  });

  it('should logout user', async () => {
    const result = {
      isSuccess: true,
      message: expect.any(String),
    };

    expect(await controller.logout(mockUser, responseMock)).toEqual(result);
    expect(mockAuthService.logout).toHaveBeenCalledWith(mockUser, responseMock);
  });

  it('should return user object', () => {
    const dto = { user: mockUser };

    const result = {
      id: expect.any(String),
      email: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      permission: expect.any(String),
    };

    expect(controller.findMe(dto)).toEqual(result);
    expect(mockAuthService.me).toHaveBeenCalledWith(mockUser);
  });
});
