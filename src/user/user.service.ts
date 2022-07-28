import { Inject, Injectable } from '@nestjs/common';
import {
  DefaultResponse,
  FilteredUser,
  FindUserResponse,
  FindUsersResponse,
  UserBasicData,
} from 'types';
import { User } from './entities/user.entity';
import { UtilitiesService } from '../utilities/utilities.service';
import { StudentBasicData } from '../../types/interfaces/user/student';
import {
  BooleanValidator,
  CityValidator,
  ExpectedContractTypeValidator,
  ExpectedTypeWorkValidator,
  LinksValidator,
  NumberInRangeValidator,
  StudentStatusValidator,
} from './helpers/user.validators';

@Injectable()
export class UserService {
  constructor(
    @Inject(UtilitiesService)
    private readonly utilitiesService: UtilitiesService,
  ) {}

  baseUserFilter(user: User): FilteredUser {
    const { id, email, firstName, lastName, permissions } = user;

    return {
      id,
      email,
      firstName,
      lastName,
      permissions,
    };
  }

  async findAll(): Promise<FindUsersResponse> {
    try {
      const users = await User.find();
      const usersAfterFiltration: FilteredUser[] = users.map(user =>
        this.baseUserFilter(user),
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
      const user = this.baseUserFilter(await User.findOneByOrFail({ id }));
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
    { email, password, permissions }: UserBasicData,
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
        user: this.baseUserFilter(user),
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
        newUser.permissions = permissions;
        await newUser.save();
        const filtratedUser = this.baseUserFilter(newUser);
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

  async registerStudent(
    foundedStudent: User,
    {
      studentStatus,
      portfolioUrls,
      projectUrls,
      bio,
      expectedTypeWork,
      targetWorkCity,
      expectedContractType,
      expectedSalary,
      canTakeApprenticeship,
      monthsOfCommercialExp,
      education,
      workExperience,
      courses,
      courseCompletion,
      courseEngagement,
      projectDegree,
      teamProjectDegree,
      bonusProjectUrls,
    }: Partial<StudentBasicData>,
  ): Promise<DefaultResponse> {
    try {
      // Student Status
      foundedStudent.studentStatus =
        StudentStatusValidator(studentStatus) || foundedStudent.studentStatus;
      // Portfolio Urls
      foundedStudent.portfolioUrls =
        LinksValidator(portfolioUrls) || foundedStudent.portfolioUrls;
      // Project Urls
      foundedStudent.projectUrls =
        LinksValidator(projectUrls) || foundedStudent.projectUrls;
      // Bio
      foundedStudent.bio = bio || foundedStudent.bio;
      // Expected Type Work
      foundedStudent.expectedTypeWork =
        ExpectedTypeWorkValidator(expectedTypeWork) ||
        foundedStudent.expectedTypeWork;
      // Target Work City
      foundedStudent.targetWorkCity =
        CityValidator(targetWorkCity) || foundedStudent.targetWorkCity;
      // Expected Contract Type
      foundedStudent.expectedContractType =
        ExpectedContractTypeValidator(expectedContractType) ||
        foundedStudent.expectedContractType;
      // Expected Salary
      foundedStudent.expectedSalary =
        NumberInRangeValidator(expectedSalary, 1, 9999999) ||
        foundedStudent.expectedSalary;
      // Can Take Apprenticeship
      foundedStudent.canTakeApprenticeship =
        canTakeApprenticeship === 'null' && 'undefined'
          ? foundedStudent.canTakeApprenticeship
          : BooleanValidator(canTakeApprenticeship);
      // Month of Commercial Experience
      foundedStudent.monthsOfCommercialExp =
        NumberInRangeValidator(monthsOfCommercialExp, 1, 999) ||
        foundedStudent.monthsOfCommercialExp;
      // Education
      foundedStudent.education = education || foundedStudent.education;
      // Work Experience
      foundedStudent.workExperience =
        workExperience || foundedStudent.workExperience;
      // Courses
      foundedStudent.courses = courses || foundedStudent.courses;
      // Course Completion
      foundedStudent.courseCompletion =
        NumberInRangeValidator(courseCompletion, 1, 5) ||
        foundedStudent.courseCompletion;
      // Course Engagement
      foundedStudent.courseEngagement =
        NumberInRangeValidator(courseEngagement, 1, 5) ||
        foundedStudent.courseEngagement;
      // Project Degree
      foundedStudent.projectDegree =
        NumberInRangeValidator(projectDegree, 1, 5) ||
        foundedStudent.projectDegree;
      // Team Project Degree
      foundedStudent.teamProjectDegree =
        NumberInRangeValidator(teamProjectDegree, 1, 5) ||
        foundedStudent.teamProjectDegree;
      // Bonus Project Urls
      foundedStudent.bonusProjectUrls =
        LinksValidator(bonusProjectUrls) || foundedStudent.bonusProjectUrls;
      // Clear Token
      foundedStudent.activationLink = null;
      // Save User
      await foundedStudent.save();
      return {
        isSuccess: true,
        message: 'User has been successfully registered.',
      };
    } catch (error) {
      console.log(error);
      return {
        isSuccess: false,
        message: 'An error occurred while registering the user.',
      };
    }
  }
}
