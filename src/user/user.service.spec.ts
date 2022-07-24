import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;

  jest.spyOn(User, 'find').mockResolvedValue([]);
  jest.spyOn(User, 'findOneByOrFail').mockResolvedValue(new User());

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UtilitiesService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return users list', async () => {
    const result = {
      isSuccess: true,
      message: expect.any(String),
      users: expect.any(Array),
    };

    expect(await service.findAll()).toEqual(result);
  });

  it('should return user', async () => {
    const result = {
      isSuccess: true,
      message: expect.any(String),
      user: {},
    };

    expect(await service.findOne('abc')).toEqual(result);
  });
});
