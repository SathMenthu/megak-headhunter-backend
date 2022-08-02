import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from '../user/entities/user.entity';
import { AuthLoginData, RoleEnum } from '../../types';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;

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
  mockUser.avatar = 'http://test.com';
  mockUser.accountBlocked = false;

  const responseMock = {
    json: jest.fn(x => x),
    cookie: jest.fn(x => ({
      json: jest.fn(y => y),
    })),
    clearCookie: jest.fn(x => x),
  } as unknown as Response;

  const errorResponse = {
    isSuccess: false,
    message: expect.any(String),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        UtilitiesService,
        mailServiceProvider,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: AuthLoginData = {
      email: 'test@example.com',
      password: 'pwd',
    };

    it('should handle error', async () => {
      expect(await service.login(loginDto, responseMock)).toEqual(
        errorResponse,
      );
    });

    it('should return error, when user does not exists', async () => {
      jest.spyOn(User, 'findOneBy').mockResolvedValue(null);

      const result = {
        isSuccess: false,
        message: expect.any(String),
      };

      expect(await service.login(loginDto, responseMock)).toEqual(result);
    });

    it('should login user', async () => {
      jest.spyOn(User, 'findOneBy').mockResolvedValue(new User());
      jest.spyOn(User.prototype, 'save').mockResolvedValue(new User());
      // @ts-ignore
      jest.spyOn(service, 'generateToken').mockResolvedValue('abc');

      const result = {
        isSuccess: true,
        message: expect.any(String),
        user: [{}],
      };

      expect(await service.login(loginDto, responseMock)).toEqual(result);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      jest.spyOn(User.prototype, 'save').mockResolvedValue(new User());
      const result = {
        isSuccess: true,
        message: expect.any(String),
      };

      expect(await service.logout(mockUser, responseMock)).toEqual(result);
    });
  });

  describe('me', () => {
    it('should return user data', async () => {
      const result = {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        permission: mockUser.permission,
        avatar: mockUser.avatar,
        accountBlocked: mockUser.accountBlocked,
      };

      expect(await service.me(mockUser)).toEqual(result);
    });
  });
});
