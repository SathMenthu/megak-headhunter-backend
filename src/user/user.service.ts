import { Inject, Injectable } from '@nestjs/common';
import { DefaultResponse, RolesEnum } from 'types';
import { User } from './entities/user.entity';
import {
  EditedUserData,
  FilteredUser,
  FindUserResponse,
  FindUsersResponse,
  UserBasicData,
} from '../../types/interfaces/user';
import { UtilitiesService } from '../utilities/utilities.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(UtilitiesService)
    private readonly utilitiesService: UtilitiesService,
  ) {}

  userFilter(user: User): FilteredUser {
    const { id, email, permissions } = user;

    return {
      id,
      email,
      permissions,
    };
  }

  async findAll(): Promise<FindUsersResponse> {
    try {
      const users = await User.find();
      const usersAfterFiltration: FilteredUser[] = users.map(user =>
        this.userFilter(user),
      );
      return {
        users: usersAfterFiltration,
        message: 'The user list has been successfully downloaded',
        isSuccess: true,
      };
    } catch (error) {
      return {
        message: 'An error occurred while downloading the user list',
        isSuccess: false,
      };
    }
  }

  async findOne(id: string): Promise<FindUserResponse> {
    try {
      const user = this.userFilter(await User.findOneByOrFail({ id }));
      return {
        user,
        message: 'User data successfully retrieved.',
        isSuccess: true,
      };
    } catch (e) {
      return {
        message: 'User not found.',
        isSuccess: false,
      };
    }
  }

  async update(
    id: string,
    { email, password, permissions }: EditedUserData,
  ): Promise<FindUserResponse> {
    try {
      const user = await User.findOneByOrFail({ id });
      user.email = email || user.email;
      user.password = password
        ? this.utilitiesService.hashPassword(password)
        : user.password;
      user.permissions = permissions || user.permissions;
      await user.save();

      return {
        message: `User data successfully changed for user: ${user.email}.`,
        user: this.userFilter(user),
        isSuccess: true,
      };
    } catch (e) {
      return {
        message: 'An error occurred while editing the user data.',
        isSuccess: false,
      };
    }
  }

  async remove(id: string): Promise<DefaultResponse> {
    try {
      await User.delete(id);
      return {
        message: `User was successfully deleted.`,
        isSuccess: true,
      };
    } catch (e) {
      return {
        message: `An error occurred while deleting the user`,
        isSuccess: false,
      };
    }
  }

  async create(user: Omit<UserBasicData, 'id'>) {
    try {
      const { email, password, permissions } = user;
      const foundUser = await User.findOneBy({ email });
      if (foundUser) {
        return {
          message: 'E-mail address is in use.',
          isSuccess: false,
        };
      } else {
        const newUser = new User();
        newUser.email = email;
        newUser.password = this.utilitiesService.hashPassword(password);
        newUser.permissions = permissions
          ? [RolesEnum.STUDENT, ...permissions]
          : [RolesEnum.STUDENT];
        await newUser.save();
        const filtratedUser = this.userFilter(newUser);
        return {
          message: `User was successfully created.`,
          isSuccess: true,
          user: filtratedUser,
        };
      }
    } catch (error) {
      return {
        message: 'An error occurred while creating the user',
        isSuccess: false,
      };
    }
  }
}
