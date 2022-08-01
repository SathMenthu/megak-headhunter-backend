import { Inject, Injectable } from '@nestjs/common';
import {
  AdminFilters,
  DefaultResponse,
  FilteredUser,
  FilterPayload,
  FindUserResponse,
  FindUsersResponse,
  ImportedStudentData,
  MinimalInformationToCreateEmail,
  RoleEnum,
  UserBasicData,
  UserFilters,
} from 'types';
import * as Papa from 'papaparse';
import { v4 as uuid } from 'uuid';
import { createEmailContent } from 'src/templates/email/email';
import { Like, Not } from 'typeorm';
import {
  BooleanValidator,
  CityValidator,
  ExpectedContractTypeValidator,
  ExpectedTypeWorkValidator,
  LinksValidator,
  NumberInRangeValidator,
  StudentStatusValidator,
} from './helpers/user.validators';
import { StudentBasicData } from '../../types/interfaces/user/student';
import { MailService } from '../mail/mail.service';
import { mainConfigInfo, papaParseConfig } from '../../config/config';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(UtilitiesService)
    private readonly utilitiesService: UtilitiesService,
    @Inject(MailService) private mailService: MailService,
  ) {}

  baseUserFilter(user: User): FilteredUser {
    const {
      id,
      email,
      firstName,
      lastName,
      permission,
      avatar,
      accountBlocked,
    } = user;

    return {
      id,
      email,
      firstName,
      lastName,
      permission,
      avatar,
      accountBlocked,
    };
  }

  private static async checkAndAddStudent(
    studentObj: ImportedStudentData,
  ): Promise<MinimalInformationToCreateEmail | null> {
    try {
      const foundUser = await User.findOneBy({ email: studentObj.email });

      if (!foundUser) {
        const newStudent = new User();

        newStudent.id = uuid();
        newStudent.permission = RoleEnum.STUDENT;
        newStudent.email = studentObj.email;
        newStudent.courseCompletion = studentObj.courseCompletion;
        newStudent.courseEngagement = studentObj.courseEngagement;
        newStudent.projectDegree = studentObj.projectDegree;
        newStudent.teamProjectDegree = studentObj.teamProjectDegree;
        // @TODO add project urls
        newStudent.activationLink = uuid();

        await newStudent.save();

        return {
          id: newStudent.id,
          email: newStudent.email,
          activationLink: newStudent.activationLink,
        };
      }
      return null;
    } catch (e) {
      console.error(e.message);
      return null;
    }
  }

  private static validateDataWhileParsing(validatedObject) {
    const { value, field } = validatedObject;
    // Transforming string into array of strings
    if (field === 'bonusProjectUrls') {
      if (value) {
        const arrayOfUrls = value.split(',');
        const regex =
          /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)/;

        // filtering if url fits to gitUrl standards
        return arrayOfUrls.filter(gitUrl => regex.test(gitUrl));
      }
    } else if (field === 'email') {
      // Checking if we have an email here
      const regex = /\S+@\S+\.\S+/;
      return regex.test(value) ? value : null;
    } else if (
      Number(value) <= 5 &&
      Number(value) >= 0 &&
      Number.isInteger(Number(value))
    ) {
      // If we can make a number from value , we're doing it
      // while parsing, we're not using dynamicTyping, which would have to parse thru list again.
      return Number(value);
    }
    // in any other case the value will be null
    return null;
  }

  private static createUrlsSentToStudents(
    studentData: MinimalInformationToCreateEmail,
  ): string[] {
    return [
      `${mainConfigInfo.yourDomainName}/${studentData.id}/${studentData.activationLink}`,
      studentData.email,
    ];
  }

  async findAll({
    limit,
    filters,
    page,
  }: FilterPayload<UserFilters & AdminFilters>): Promise<FindUsersResponse> {
    try {
      const [results, total] = await User.findAndCount({
        where: [
          {
            email: Like(`%${filters.search}%`) || Not('0xError404'),
            permission: filters.permission.value,
            accountBlocked: filters.accountBlocked,
          },
          {
            firstName: Like(`%${filters.search}%`) || Not('0xError404'),
            permission: filters.permission.value,
            accountBlocked: filters.accountBlocked,
          },
          {
            lastName: Like(`%${filters.search}%`) || Not('0xError404'),
            permission: filters.permission.value,
            accountBlocked: filters.accountBlocked,
          },
        ],
        take: limit,
        skip: (page - 1) * limit,
        order: {
          [filters.sortTarget]: filters.sortDirection ? 'DESC' : 'ASC',
        },
      });
      results.map(user => this.baseUserFilter(user));
      return {
        users: results,
        total,
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
    { email, password, permission }: UserBasicData,
  ): Promise<FindUserResponse> {
    try {
      const user = await User.findOneByOrFail({ id });
      user.email = email || user.email;
      user.password = password
        ? this.utilitiesService.hashPassword(password)
        : user.password;
      user.permission = permission || user.permission;
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
      const { email, password, permission } = user;
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
        newUser.permission = permission;
        await newUser.save();
        const filtratedUser = this.baseUserFilter(newUser);
        return {
          message: `User was successfully created.`,
          isSuccess: true,
          user: filtratedUser,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        message: 'An error occurred while creating the user',
        isSuccess: false,
      };
    }
  }

  async addManyStudents(file): Promise<boolean> {
    try {
      const { data } = Papa.parse(file, {
        header: true,
        preview: papaParseConfig.maxNumberOfLinesParsed,
        transform(
          value: string,
          field: string | number,
        ): string[] | number | string {
          return UserService.validateDataWhileParsing({
            value,
            field,
          });
        },
      });
      const filteredStudents = data.filter(student => {
        const values = Object.values(student);
        // If we have null anywhere, that means the record is not good
        return !values.includes(null);
      }) as ImportedStudentData[];

      const studentsAddedToDb = (
        await Promise.all(
          filteredStudents.map(async student => {
            try {
              return await UserService.checkAndAddStudent(student);
            } catch (e) {
              console.error(e.message);
              return null;
            }
          }),
        )
      ).filter(student => student !== null);

      const generatedUrlsToRegisterWithEmails = studentsAddedToDb.map(student =>
        UserService.createUrlsSentToStudents(student),
      );

      await Promise.all(
        generatedUrlsToRegisterWithEmails.map(async oneStudent => {
          try {
            return await this.sendInvitationEmail(oneStudent);
          } catch (e) {
            console.error(e.message);
            return null;
          }
        }),
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private async sendInvitationEmail(studentData: string[]) {
    try {
      await this.mailService.sendMail(
        studentData[1],
        `Account created for ${studentData[1]}`,
        createEmailContent(studentData),
      );
    } catch (e) {
      console.error(e.message);
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
      return {
        isSuccess: false,
        message: 'An error occurred while registering the user.',
      };
    }
  }

  async resetPasswordForTargetUser(id: string, payload: { password: string }) {
    try {
      const user = await User.findOneByOrFail({ id });
      user.password = this.utilitiesService.hashPassword(payload.password);
      await user.save();
      return {
        isSuccess: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return {
        isSuccess: false,
        message: 'An error occurred while changing the password',
      };
    }
  }

  async blockTargetUser(id: string) {
    try {
      const user = await User.findOneByOrFail({ id });
      user.accountBlocked = true;
      await user.save();
      return {
        isSuccess: true,
        message: 'The user has been successfully blocked',
      };
    } catch (error) {
      return {
        isSuccess: false,
        message: 'An error occurred while trying to lock the user',
      };
    }
  }
}
