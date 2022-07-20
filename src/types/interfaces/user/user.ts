import { RolesEnum } from '../../enums';
import { DefaultResponse } from '../global';

export interface UserBasicData {
  id: string;
  email: string;
  password: string;
  permissions: RolesEnum[];
}

export type FindUserResponse = Omit<UserBasicData, 'password'>;

export interface FindUsersResponse extends DefaultResponse {
  users?: FindUserResponse[];
}
