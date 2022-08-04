import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { UserService } from './user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';
import {
  FilterPayload,
  ManuallyCreatedUser,
  RoleEnum,
  UserBasicData,
  UserFilters,
} from '../../types';
import { MailService } from '../mail/mail.service';

describe('UserService', () => {
  let service: UserService;

  const mockMailService = {};

  const mailServiceProvider = {
    provide: MailService,
    useValue: mockMailService,
  };

  const testUserObj: UserBasicData = {
    id: 'abc',
    email: 'example@test.com',
    password: 'test',
    firstName: 'Test_Name',
    lastName: 'Test_Name',
    accountBlocked: false,
    avatar: '',
    permission: RoleEnum.STUDENT,
  };

  const errorResponse = {
    isSuccess: false,
    message: expect.any(String),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UtilitiesService, mailServiceProvider],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const payload: FilterPayload<UserFilters> = {
      page: 1,
      limit: 2,
      filters: {
        search: null,
        email: null,
        firstName: null,
        lastName: null,
        permission: {
          text: '',
          value: null,
        },
        accountBlocked: null,
        sortDirection: true,
        sortTarget: '',
      },
    };

    it('should handle error', async () => {
      expect(await service.findAll(payload)).toEqual(errorResponse);
    });

    it('should return users list', async () => {
      jest.spyOn(User, 'findAndCount').mockResolvedValue([[], 0]);

      const result = {
        isSuccess: true,
        total: 0,
        message: expect.any(String),
        users: expect.any(Array),
      };

      expect(await service.findAll(payload)).toEqual(result);
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
        avatar: '',
        accountBlocked: false,
        permission: RoleEnum.STUDENT,
      });

      const result = {
        isSuccess: true,
        message: expect.any(String),
        user: {
          id: expect.any(String),
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          accountBlocked: expect.any(Boolean),
          avatar: expect.any(String),
          permission: RoleEnum.STUDENT,
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
    const dto: ManuallyCreatedUser = {
      email: 'example@test.com',
      firstName: 'Test_Name',
      lastName: 'Test_Name',
      company: null,
      maxReservedStudents: null,
      permission: RoleEnum.STUDENT,
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
