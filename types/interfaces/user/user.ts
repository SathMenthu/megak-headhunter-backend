import { RoleEnum } from '../../enums';
import { DefaultResponse } from '../global';

export interface UserBasicData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: RoleEnum;
}

export type FilteredUser = Omit<UserBasicData, 'password'>;

export interface FindUserResponse extends DefaultResponse {
  user?: FilteredUser;
}

export interface FindUsersResponse extends DefaultResponse {
  users?: FilteredUser[];
}

export interface EditedUserData
  extends Omit<UserBasicData, 'id'>,
    DefaultResponse {}
