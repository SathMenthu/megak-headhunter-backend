import { Inject, Injectable } from '@nestjs/common';
import {
  AdminFilters,
  ConfirmRegisterUserDto,
  DefaultResponse,
  FilteredUser,
  FilterPayload,
  FindUserResponse,
  FindUsersResponse,
  ImportedStudentData,
  ManuallyCreatedUser,
  MinimalInformationToCreateEmail,
  RoleEnum,
  UrlAndEmailToSend,
  UserFilters,
} from 'types';
import * as Papa from 'papaparse';
import { v4 as uuid } from 'uuid';
import {
  createForgotPasswordEmailHTML,
  createInvitationEmailHTML,
} from 'src/templates/email/email';
import { Like, Not } from 'typeorm';
import {
  BooleanValidator,
  CityValidator,
  ExpectedContractTypeValidator,
  ExpectedTypeWorkValidator,
  LinksValidator,
  MailValidator,
  NumberInRangeValidator,
  StudentStatusValidator,
} from './helpers/user.validators';
import { MailService } from '../mail/mail.service';
import { mainConfigInfo, papaParseConfig } from '../../config/config';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';
import { ForgotPasswordDto } from './forgot-password/forgot-password.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(UtilitiesService)
    private readonly utilitiesService: UtilitiesService,
    @Inject(MailService) private mailService: MailService,
  ) {}

  baseUserFilter(user: User): FilteredUser {
    const { password: deletedKey, ...otherKeys } = user;
    return otherKeys;
  }

  userToCreateEmailUrls(user: User): MinimalInformationToCreateEmail {
    const { id, email, activationLink, permission } = user;
    return {
      id,
      email,
      activationLink,
      permission,
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
        newStudent.bonusProjectUrls = studentObj.bonusProjectUrls;
        newStudent.activationLink = uuid();

        await newStudent.save();

        return {
          id: newStudent.id,
          email: newStudent.email,
          activationLink: newStudent.activationLink,
          permission: newStudent.permission,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private static checkIfThisIsAnEmail(email: string): string | null {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email) ? email : null;
  }

  private static validateDataWhileParsing(validatedObject: {
    value: string;
    field: string;
  }): string[] | string | number | null {
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
      return UserService.checkIfThisIsAnEmail(value);
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

  private static createUrlsSentToUsers(
    userData: MinimalInformationToCreateEmail,
    apiString: string,
    firstParamName: string,
    secondParamName: string,
  ): UrlAndEmailToSend {
    return {
      url: `${mainConfigInfo.yourDomainName}/${apiString}?${firstParamName}=${
        userData.id
      }&${secondParamName}=${
        userData.activationLink || userData.resetPasswordLink
      }`,
      email: userData.email,
      permission: userData.permission,
    };
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

  async getOneAndSendEmailWithPassRecovery(
    emailObj: ForgotPasswordDto,
  ): Promise<DefaultResponse> {
    try {
      if (UserService.checkIfThisIsAnEmail(emailObj.email)) {
        const user = await User.findOneByOrFail({ email: emailObj.email });
        const studentData: MinimalInformationToCreateEmail = {
          id: user.id,
          email: user.email,
          resetPasswordLink: uuid(),
          permission: user.permission,
        };

        const newPasswordUrlAndEmail = UserService.createUrlsSentToUsers(
          studentData,
          'retrieve-password',
          'id',
          'token',
        );

        await this.sendForgotPasswordEmail(newPasswordUrlAndEmail);
        user.resetPasswordLink = studentData.resetPasswordLink;
        await user.save();

        return {
          message: 'Message sent, check your email.',
          isSuccess: true,
        };
      }
      return {
        message: `Sorry, this is not an email you have sent my friend.`,
        isSuccess: false,
      };
    } catch (e) {
      return {
        message: `The're is not such email in MegaK. Check it again please.`,
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

  async create(user: ManuallyCreatedUser) {
    try {
      const {
        email,
        firstName,
        lastName,
        permission,
        maxReservedStudents,
        company,
      } = user;
      const foundUser = await User.findOneBy({ email });
      if (foundUser) {
        return {
          message: 'E-mail address is in use.',
          isSuccess: false,
        };
      } else {
        const newUser = new User();
        newUser.email = MailValidator(email);
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        if (!Object.values(RoleEnum).includes(permission))
          throw Error('Invalid permission');
        newUser.permission = permission;
        if (newUser.permission === 'HR') {
          newUser.company = company || '';
          newUser.maxReservedStudents =
            NumberInRangeValidator(maxReservedStudents, 1, 999) || 1;
        }
        newUser.activationLink = uuid();
        await newUser.save();

        const oneUser: UrlAndEmailToSend = UserService.createUrlsSentToUsers(
          newUser,
          'confirm-registration',
          'id',
          'token',
        );

        await this.sendInvitationEmail(oneUser);
        return {
          message: `User was successfully created.`,
          isSuccess: true,
        };
      }
    } catch (error) {
      return {
        message: 'An error occurred while creating the user',
        isSuccess: false,
      };
    }
  }

  async addManyStudents(file: string): Promise<DefaultResponse> {
    try {
      const { data } = Papa.parse(file, {
        header: true,
        preview: papaParseConfig.maxNumberOfLinesParsed,
        transform(
          value: string,
          field: string,
        ): string[] | number | string | null {
          return UserService.validateDataWhileParsing({
            value,
            field,
          });
        },
      });

      /** ------------ IMPORTANT TO FILTER CONSERVATIVE OR AGGRESSIVE -------------- */
      const filteredStudents = data.filter((student: ImportedStudentData) => {
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
              return null;
            }
          }),
        )
      ).filter(student => student !== null);

      const generatedUrlsToRegisterWithEmails = studentsAddedToDb.map(student =>
        UserService.createUrlsSentToUsers(
          student,
          'confirm-registration',
          'id',
          'token',
        ),
      );

      const sentEmails = (
        await Promise.all(
          generatedUrlsToRegisterWithEmails.map(async oneStudent => {
            try {
              return await this.sendInvitationEmail(oneStudent);
            } catch (e) {
              return null;
            }
          }),
        )
      ).filter(obj => obj);

      return {
        message: `Created ${studentsAddedToDb.length} new users out of ${
          data.length - 1
        } positions. We have sent ${sentEmails.length} confirmation emails.`,
        isSuccess: true,
      };
    } catch (e) {
      return {
        message: 'Could not create new users.',
        isSuccess: false,
      };
    }
  }

  private async sendInvitationEmail(
    studentData: UrlAndEmailToSend,
  ): Promise<boolean> {
    try {
      await this.mailService.sendMail(
        studentData.email,
        `Account created for ${studentData.email}`,
        createInvitationEmailHTML(studentData),
      );
      return true;
    } catch (e) {
      return null;
    }
  }

  private async sendForgotPasswordEmail(studentData: UrlAndEmailToSend) {
    try {
      await this.mailService.sendMail(
        studentData.email,
        `Retrieve Your Password ${studentData.email}`,
        createForgotPasswordEmailHTML(studentData),
      );
    } catch (e) {
      console.error(e.message);
    }
  }

  async editUser(
    foundedUser: User,
    {
      phoneNumber,
      password,
      firstName,
      lastName,
      company,
      maxReservedStudents,
      permission,
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
      githubUsername,
    }: Partial<ConfirmRegisterUserDto>,
  ): Promise<DefaultResponse> {
    try {
      foundedUser.firstName = firstName;
      foundedUser.lastName = lastName;
      foundedUser.password = password
        ? this.utilitiesService.hashPassword(password)
        : foundedUser.password;
      if (permission === 'STUDENT') {
        //@TODO check validation - can no works
        // Github and avatar
        foundedUser.githubUsername =
          LinksValidator([`https://github.com/${githubUsername}/`]).length &&
          githubUsername;

        if (foundedUser.githubUsername) {
          foundedUser.avatar = decodeURIComponent(
            LinksValidator([`https://github.com/${githubUsername}.png`])[0],
          );
        }

        // Student Status
        foundedUser.studentStatus =
          StudentStatusValidator(studentStatus) || foundedUser.studentStatus;
        // Portfolio Urls
        foundedUser.portfolioUrls =
          LinksValidator(portfolioUrls) || foundedUser.portfolioUrls;
        // Project Urls
        foundedUser.projectUrls =
          LinksValidator(projectUrls) || foundedUser.projectUrls;
        // Bio
        foundedUser.bio = bio || foundedUser.bio;
        // Expected Type Work
        foundedUser.expectedTypeWork =
          ExpectedTypeWorkValidator(expectedTypeWork) ||
          foundedUser.expectedTypeWork;
        // Target Work City
        foundedUser.targetWorkCity =
          CityValidator(targetWorkCity) || foundedUser.targetWorkCity;
        // Expected Contract Type
        foundedUser.expectedContractType =
          ExpectedContractTypeValidator(expectedContractType) ||
          foundedUser.expectedContractType;
        // Expected Salary
        foundedUser.expectedSalary =
          NumberInRangeValidator(expectedSalary, 1, 9999999) ||
          foundedUser.expectedSalary;
        // Can Take Apprenticeship
        //@TODO add validation
        foundedUser.canTakeApprenticeship = canTakeApprenticeship;
        // Month of Commercial Experience
        foundedUser.monthsOfCommercialExp =
          NumberInRangeValidator(monthsOfCommercialExp, 1, 999) ||
          foundedUser.monthsOfCommercialExp;
        // Education
        foundedUser.education = education || foundedUser.education;
        // Work Experience
        foundedUser.workExperience =
          workExperience || foundedUser.workExperience;
        // Courses
        foundedUser.courses = courses || foundedUser.courses;
        // Course Completion
        foundedUser.courseCompletion =
          NumberInRangeValidator(courseCompletion, 1, 5) ||
          foundedUser.courseCompletion;
        // Course Engagement
        foundedUser.courseEngagement =
          NumberInRangeValidator(courseEngagement, 1, 5) ||
          foundedUser.courseEngagement;
        // Project Degree
        foundedUser.projectDegree =
          NumberInRangeValidator(projectDegree, 1, 5) ||
          foundedUser.projectDegree;
        // Team Project Degree
        foundedUser.teamProjectDegree =
          NumberInRangeValidator(teamProjectDegree, 1, 5) ||
          foundedUser.teamProjectDegree;
        // Bonus Project Urls
        foundedUser.bonusProjectUrls =
          LinksValidator(bonusProjectUrls) || foundedUser.bonusProjectUrls;

        //@TODO add phone validation
        foundedUser.phoneNumber = phoneNumber || foundedUser.phoneNumber;
      } else if (permission === 'HR') {
        foundedUser.company = company || '';
        foundedUser.maxReservedStudents =
          NumberInRangeValidator(maxReservedStudents, 1, 999) || 1;
      }
      // Clear Token
      foundedUser.activationLink = null;
      foundedUser.accountBlocked = false;
      // Save User
      await foundedUser.save();
      return {
        isSuccess: true,
        message: 'User has been successfully updated.',
      };
    } catch (error) {
      console.log(error);
      return {
        isSuccess: false,
        message: 'An error occurred while updated the user.',
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

  async checkRegisterLink(id: string, token: string) {
    try {
      const user = await User.findOneByOrFail({ id });
      if (user.activationLink !== token) {
        throw Error();
      }
      return {
        isSuccess: true,
        message: 'Link and user has been properly validated.',
        user: this.baseUserFilter(user),
      };
    } catch (error) {
      return {
        isSuccess: false,
        message: 'Link has expired and is no longer up to date.',
      };
    }
  }

  async closeStudentAccount(id: string) {
    try {
      const foundStudent = await User.findOneBy({ id });
      if (foundStudent) {
        foundStudent.accountBlocked = true;
        await foundStudent.save;
        return {
          isSuccess: true,
          message: 'Student account has been successfully closed',
        };
      }
      throw new Error();
    } catch (error) {
      return {
        isSuccess: true,
        message: 'An error occurred while closing the student account',
      };
    }
  }
}
