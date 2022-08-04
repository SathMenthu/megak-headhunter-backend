import {
  ExpectedContractTypeEnum,
  ExpectedTypeWorkEnum,
  RoleEnum,
} from '../../enums';
import { BaseOfSort, ConvertedPayload, DefaultResponse } from '../global';
import { StudentStatus } from '../../enums/student.status.enum';

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

export type FilteredUser = Omit<Student & Hr, 'password'>;

export type ConfirmRegisterUserDto = Student & Hr;

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
  permission: RoleEnum;
}

export interface UrlAndEmailToSend {
  url: string;
  email: string;
  permission: RoleEnum;
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
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  permission: {
    text: string;
    value: RoleEnum | null;
  };
  accountBlocked: boolean | null;
}

export interface HrFilters extends BaseOfSort {
  courseCompletion: Array<number>;
  courseEngagement: Array<number>;
  projectDegree: Array<number>;
  teamProjectDegree: Array<number>;
  expectedTypeWork: ExpectedTypeWorkEnum[];
  expectedContractType: ExpectedContractTypeEnum[];
  minSalary: number | null;
  maxSalary: number | null;
  canTakeApprenticeship: boolean | null;
  monthsOfCommercialExp: number | null;
}

export interface AdminFilters extends BaseOfSort {
  permission: {
    text: string;
    value: RoleEnum | null;
  };
  accountBlocked: boolean | null;
}

export interface CheckRegisterDto {
  id: string;
  token: string;
}

export interface Hr extends UserBasicData {
  company: string | null;
  maxReservedStudents: number | null;
}

export interface Student extends UserBasicData {
  resetPasswordLink: string | null;
  reservationEndDate: Date | null;
  studentStatus: StudentStatus | null;
  phoneNumber: number | null;
  githubUsername: string | null;
  portfolioUrls: string[] | null;
  projectUrls: string[] | null;
  bio: string | null;
  expectedTypeWork: ExpectedTypeWorkEnum | null;
  targetWorkCity: string | null;
  expectedContractType: ExpectedContractTypeEnum | null;
  expectedSalary: number | null;
  canTakeApprenticeship: boolean | null;
  monthsOfCommercialExp: number | null;
  education: string | null;
  workExperience: string | null;
  courses: string | null;
  courseCompletion: number | null;
  courseEngagement: number | null;
  projectDegree: number | null;
  teamProjectDegree: number | null;
  bonusProjectUrls: string[] | null;
  activationLink: string | null;
}
