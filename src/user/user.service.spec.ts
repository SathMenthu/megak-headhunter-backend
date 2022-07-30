import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { UserService } from './user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';
import { RoleEnum } from '../../types';

describe('UserService', () => {
  let service: UserService;

  const testUserObj = {
    id: 'abc',
    email: 'example@test.com',
    password: 'test',
    firstName: 'Test_Name',
    lastName: 'Test_Name',
    permissions: RoleEnum.STUDENT,
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
      jest.spyOn(service, 'baseUserFilter').mockReturnValue({
        id: 'abc',
        email: 'example@test.com',
        firstName: 'Test_Name',
        lastName: 'Test_Name',
        permissions: RoleEnum.STUDENT,
      });

      const result = {
        isSuccess: true,
        message: expect.any(String),
        user: {
          id: expect.any(String),
          email: expect.any(String),
          permissions: RoleEnum.STUDENT,
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

  describe('create', () => {
    const dto = {
      email: 'example@test.com',
      password: 'test',
      permissions: RoleEnum.STUDENT,
    };

    it('should handle error', async () => {
      expect(await service.create(dto)).toEqual(errorResponse);
    });

    it('should detect email in use', async () => {
      jest.spyOn(User.prototype, 'save').mockResolvedValue(new User());
      jest.spyOn(User, 'findOneBy').mockResolvedValue(new User());

      const result = {
        isSuccess: false,
        message: 'E-mail address is in use.',
      };

      expect(await service.create(dto)).toEqual(result);
    });

    it('should add user', async () => {
      jest.spyOn(User.prototype, 'save').mockImplementation(() => {
        User.prototype.id = uuid();
        return this;
      });
      jest.spyOn(User, 'findOneBy').mockResolvedValue(null);

      const result = {
        isSuccess: true,
        message: expect.any(String),
        user: {
          id: expect.any(String),
          email: expect.any(String),
          permissions: RoleEnum.STUDENT,
        },
      };

      expect(await service.create(dto)).toEqual(result);
    });
  });
});
