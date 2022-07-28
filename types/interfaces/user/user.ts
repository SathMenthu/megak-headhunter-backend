import { RolesEnum } from '../../enums';
import { DefaultResponse } from '../global';

export interface UserBasicData {
  id: string;
  email: string;
  password: string;
  permissions: RolesEnum;
}

export type FilteredUser = Omit<UserBasicData, 'password'>;

export interface FindUserResponse extends DefaultResponse {
  user?: FilteredUser;
}

export interface FindUsersResponse extends DefaultResponse {
  users?: FilteredUser[];
}

export interface ImportedStudentData {
  email: string;
  courseCompletion: number;
  courseEngagement: number;
  projectDegree: number;
  teamProjectDegree: number;
  bonusProjectUrls: string | string[];
  registerToken: string;
}

export interface MinimalInformationToCreateEmail {
  id: string;
  email: string;
  registerToken: string;
}

export interface EditedUserData
  extends Omit<UserBasicData, 'id'>,
    DefaultResponse {}
