import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from '../user/entities/user.entity';
import { AuthLoginData, RoleEnum } from '../../types';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = new User();
  mockUser.id = 'abc';
  mockUser.email = 'test@example.com';
  mockUser.password = 'pwd';
  mockUser.firstName = 'Test_Firstname';
  mockUser.lastName = 'Test_Lastname';
  mockUser.permission = RoleEnum.STUDENT;

  const responseMock = {
    json: jest.fn(x => x),
    cookie: jest.fn(x => ({
      json: jest.fn(y => y),
    })),
  } as unknown as Response;

  const errorResponse = {
    isSuccess: false,
    message: expect.any(String),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, UtilitiesService],
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
});
