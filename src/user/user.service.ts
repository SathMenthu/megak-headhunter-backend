import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { FindUserResponse, FindUsersResponse } from '../types/interfaces/user';

@Injectable()
export class UserService {
  userFilter(user: User): FindUserResponse {
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
      const usersAfterFiltration: FindUserResponse[] = users.map(user =>
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
