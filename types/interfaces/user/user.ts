import { RoleEnum } from '../../enums';
import { BaseOfSort, DefaultResponse } from '../global';

export interface UserBasicData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permission: RoleEnum;
  avatar: string;
  accountBlocked: boolean;
}

export interface ManuallyCreatedUser {
  email: string;
  firstName: string;
  lastName: string;
  permission: RoleEnum;
  maxReservedStudents: number | null;
  company: string | null;
}

export type FilteredUser = Omit<UserBasicData, 'password'>;

export interface FindUserResponse extends DefaultResponse {
  user?: FilteredUser;
}

export interface FindUsersResponse extends DefaultResponse {
  users?: FilteredUser[];
  total?: number;
}

export interface ImportedStudentData {
  email: string;
  courseCompletion: number;
  courseEngagement: number;
  projectDegree: number;
  teamProjectDegree: number;
  bonusProjectUrls: string[];
  registerToken: string;
}

export interface MinimalInformationToCreateEmail {
  id: string;
  email: string;
  activationLink?: string;
  resetPasswordLink?: string;
}

export interface UrlAndEmailToSend {
  url: string;
  email: string;
}

export interface EditedUserData {
  id: string;
  email: string;
  newPassword: string | null;
  firstName: string;
  lastName: string;
  permission: RoleEnum;
  avatar: string;
  accountBlocked: boolean;
}

export interface UserFilters extends BaseOfSort {
  search: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  permission: {
    text: string;
    value: RoleEnum | null;
  };
  accountBlocked: boolean | null;
}

export interface AdminFilters extends BaseOfSort {
  search: string | null;
  permission: {
    text: string;
    value: RoleEnum | null;
  };
  accountBlocked: boolean | null;
}
