import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;

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
      const result = {
        isSuccess: false,
        message: expect.any(String),
      };

      expect(await service.findAll()).toEqual(result);
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
      const result = {
        isSuccess: false,
        message: expect.any(String),
      };

      expect(await service.findOne('abc')).toEqual(result);
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
});
