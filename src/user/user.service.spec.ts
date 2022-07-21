import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UtilitiesService } from '../utilities/utilities.service';

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
});
