import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import {
  FilteredUser,
  FindUserResponse,
  FindUsersResponse,
} from '../types/interfaces/user';

@Injectable()
export class UserService {
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
        message: 'Pomyślnie pobrano listę użytkowników.',
        isSuccess: true,
      };
    } catch (error) {
      return {
        message: 'Wystąpił bład podczas pobierania listy użytkowników.',
        isSuccess: false,
      };
    }
  }

  async findOne(id: string): Promise<FindUserResponse> {
    try {
      const user = this.userFilter(await User.findOneByOrFail({ id }));
      return {
        user,
        message: 'Pomyślnie pobrano dane użytkownika.',
        isSuccess: true,
      };
    } catch (e) {
      return {
        message: 'Nie znaleziono użytkownika.',
        isSuccess: false,
      };
    }
  }

  update(id: number, updateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
