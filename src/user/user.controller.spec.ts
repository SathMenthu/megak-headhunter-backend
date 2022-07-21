import { FindUsersResponse, RolesEnum } from 'types';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(dto => ({
      id: 'test_id',
      ...dto,
    })),

    findAll: jest.fn(
      (): FindUsersResponse => ({
        isSuccess: true,
        message: 'test message',
        users: [],
      }),
    ),
  };

  const user = {
    email: 'test@example.com',
    password: 'test',
    permissions: [RolesEnum.STUDENT],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create user', () => {
    expect(controller.create(user)).toEqual({
      id: expect.any(String),
      ...user,
    });
    expect(mockUserService.create).toHaveBeenCalledWith(user);
  });

  it('should return users list', () => {
    expect(controller.findAll()).toEqual({
      isSuccess: true,
      message: expect.any(String),
      users: [],
    });
    expect(mockUserService.findAll).toHaveBeenCalled();
  });
});
