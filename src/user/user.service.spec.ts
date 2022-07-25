import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';
import { RolesEnum } from '../../types';

describe('UserService', () => {
  let service: UserService;

  const testUserObj = {
    id: 'abc',
    email: 'example@test.com',
    password: 'test',
    permissions: [RolesEnum.STUDENT],
  };

  const errorResponse = {
    isSuccess: false,
    message: expect.any(String),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UtilitiesService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should handle error', async () => {
      expect(await service.findAll()).toEqual(errorResponse);
    });

    it('should return users list', async () => {
      jest.spyOn(User, 'find').mockResolvedValue([]);

      const result = {
        isSuccess: true,
        message: expect.any(String),
        users: expect.any(Array),
      };

      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should handle error', async () => {
      expect(await service.findOne('abc')).toEqual(errorResponse);
    });

    it('should return user', async () => {
      jest.spyOn(User, 'findOneByOrFail').mockResolvedValue(new User());

      const result = {
        isSuccess: true,
        message: expect.any(String),
        user: {},
      };

      expect(await service.findOne('abc')).toEqual(result);
    });
  });

  describe('update', () => {
    it('should handle error', async () => {
      expect(await service.update('abc', testUserObj)).toEqual(errorResponse);
    });

    it('should update user data', async () => {
      jest.spyOn(User.prototype, 'save').mockResolvedValue(new User());
      jest.spyOn(User, 'findOneByOrFail').mockResolvedValue(new User());
      jest.spyOn(service, 'userFilter').mockReturnValue({
        id: 'abc',
        email: 'example@test.com',
        permissions: [RolesEnum.STUDENT],
      });

      const result = {
        isSuccess: true,
        message: expect.any(String),
        user: {
          id: expect.any(String),
          email: expect.any(String),
          permissions: [RolesEnum.STUDENT],
        },
      };

      expect(await service.update('abc', testUserObj)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should handle error', async () => {
      expect(await service.remove('abc')).toEqual(errorResponse);
    });

    it('should remove user', async () => {
      jest.spyOn(User, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });

      const result = {
        isSuccess: true,
        message: expect.any(String),
      };

      expect(await service.remove('abc')).toEqual(result);
    });
  });
});
