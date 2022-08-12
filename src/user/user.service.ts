import { Inject, Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';
import { v4 as uuid } from 'uuid';
import {
  createForgotPasswordEmailHTML,
  createInvitationEmailHTML,
} from 'src/templates/email/email';
import { Between, In, Like, MoreThanOrEqual, Not } from 'typeorm';
import {
  AdminFilters,
  ConfirmRegisterUserDto,
  DefaultResponse,
  ExpectedContractTypeEnum,
  ExpectedTypeWorkEnum,
  FilteredUser,
  FilterPayload,
  FilterPayloadForHr,
  FindUserResponse,
  FindUsersResponse,
  HrFilters,
  ImportedStudentData,
  ManuallyCreatedUser,
  MinimalInformationToCreateEmail,
  RoleEnum,
  StudentStatus,
  UrlAndEmailToSend,
  UserFilters,
} from '../types';
import {
  BooleanValidator,
  CityValidator,
  ExpectedContractTypeValidator,
  ExpectedTypeWorkValidator,
  GitHubUserNameValidator,
  LinksValidator,
  MailValidator,
  NumberInRangeValidator,
  PhoneNumberValidator,
  StringValidator,
  StudentStatusValidator,
  ValidateEmail,
} from './helpers/user.validators';
import { MailService } from '../mail/mail.service';
import { mainConfigInfo, papaParseConfig } from '../config/config';
import { UtilitiesService } from '../utilities/utilities.service';
import { User } from './entities/user.entity';
import { ForgotPasswordDto } from './forgot-password/forgot-password.dto';
import { compareArrays } from './helpers/compare.arrays';
import { UserToUser } from './entities/user-to-user.entity';

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
  ): Promise<MinimalInformationToCreateEmail | null | true> {
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
      } else {
        let ifSomethingChanged = null;
        Object.keys(studentObj).forEach(key => {
          if (key === 'bonusProjectUrls') {
            if (
              !compareArrays(
                foundUser.bonusProjectUrls,
                studentObj.bonusProjectUrls,
              )
            ) {
              foundUser.bonusProjectUrls = studentObj.bonusProjectUrls;
              ifSomethingChanged = true;
            }
          } else if (
            foundUser[key] !== studentObj[key] &&
            key !== 'email' &&
            key !== 'bonusProjectUrls'
          ) {
            foundUser[key] = studentObj[key];
            ifSomethingChanged = true;
          }
        });

        if (ifSomethingChanged) {
          await foundUser.save();
        }

        /** ------------ Could change it by Conditional operator but Kuba wanted to change only those variables, which changed comparing to User in DB. ---------------*/
        // That doesn't make to much sense, because TypeORM sends it to DB as a whole object
        // but now i know if something changed
        // I used it as a chance and thanks to that the answer messages to tells how many object were updated
        return ifSomethingChanged;
      }
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
        courseCompletion,
        courseEngagement,
        projectDegree,
        teamProjectDegree,
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
            NumberInRangeValidator(
              maxReservedStudents,
              1,
              999,
              'Maksymalna liczba rozmów',
            ) || 1;
        }
        if (newUser.permission === 'STUDENT') {
          newUser.courseCompletion = NumberInRangeValidator(
            courseCompletion,
            1,
            5,
            'Ocena stopnia przejścia kursu',
          );
          newUser.courseEngagement = NumberInRangeValidator(
            courseEngagement,
            1,
            5,
            'Aktywność w kursie',
          );
          newUser.projectDegree = NumberInRangeValidator(
            projectDegree,
            1,
            5,
            'Ocena z projektu zaliczeniowego',
          );
          newUser.teamProjectDegree = NumberInRangeValidator(
            teamProjectDegree,
            1,
            5,
            'Ocena z projektu grupowego',
          );
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
      const allEmails = [];
      /** ------------ IMPORTANT TO FILTER CONSERVATIVE OR AGGRESSIVE -------------- */
      const filteredStudents = data.filter((student: ImportedStudentData) => {
        const values = Object.values(student);

        if (allEmails.includes(student.email)) {
          return false;
        }
        if (values.includes(null)) {
          return false;
        }
        allEmails.push(student.email);
        return true;
      }) as ImportedStudentData[];

      const arrayOfStudentsAfterConnectingToDb = (
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

      const studentsCreatedInDB = arrayOfStudentsAfterConnectingToDb.filter(
        student => student !== true,
      ) as MinimalInformationToCreateEmail[];

      const generatedUrlsToRegisterWithEmails = studentsCreatedInDB.map(
        student =>
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
        message: `Created ${studentsCreatedInDB.length} new users ${
          arrayOfStudentsAfterConnectingToDb.length > 0
            ? `and updated ${
                arrayOfStudentsAfterConnectingToDb.length -
                  studentsCreatedInDB.length >=
                0
                  ? `${
                      arrayOfStudentsAfterConnectingToDb.length -
                      studentsCreatedInDB.length
                    }`
                  : '0'
              } old users `
            : ''
        }out of ${data.length - 1} positions. System have sent ${
          sentEmails.length
        } confirmation emails.`,
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
      email,
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
      githubUsername,
    }: Partial<ConfirmRegisterUserDto>,
  ): Promise<DefaultResponse> {
    try {
      foundedUser.email = await ValidateEmail(
        email,
        foundedUser.email,
        foundedUser.id,
      );

      foundedUser.firstName = StringValidator(firstName, 1, 'Imię');
      foundedUser.lastName = StringValidator(lastName, 1, 'Nazwisko');
      foundedUser.password = password
        ? this.utilitiesService.hashPassword(
            StringValidator(password, 6, 'Hasło'),
          )
        : foundedUser.password;
      if (permission === RoleEnum.STUDENT) {
        // Github and avatar *
        foundedUser.githubUsername = await GitHubUserNameValidator(
          githubUsername,
        );

        if (foundedUser.githubUsername) {
          foundedUser.avatar = decodeURIComponent(
            `https://github.com/${githubUsername}.png`,
          );
        }

        // Phone number
        foundedUser.phoneNumber = phoneNumber
          ? PhoneNumberValidator(phoneNumber, 100000000, 999999999)
          : null;
        // Student Status *
        foundedUser.studentStatus =
          StudentStatusValidator(studentStatus) || foundedUser.studentStatus;
        // Portfolio Urls
        foundedUser.portfolioUrls =
          portfolioUrls && portfolioUrls[0] !== ''
            ? await LinksValidator(portfolioUrls, 'Linki do portfolio')
            : null;
        // Project Urls *
        foundedUser.projectUrls = await LinksValidator(
          projectUrls,
          'Linki do projektów',
        );
        // Bio
        foundedUser.bio = bio || foundedUser.bio;
        // Expected Type Work *
        foundedUser.expectedTypeWork =
          ExpectedTypeWorkValidator(expectedTypeWork);
        // Target Work City
        foundedUser.targetWorkCity =
          CityValidator(targetWorkCity) || foundedUser.targetWorkCity;
        // Expected Contract Type *
        foundedUser.expectedContractType =
          ExpectedContractTypeValidator(expectedContractType) ||
          foundedUser.expectedContractType;
        // Expected Salary
        foundedUser.expectedSalary =
          NumberInRangeValidator(expectedSalary, 0, 9999999, 'Wynagrodzenie') ||
          foundedUser.expectedSalary;
        // Can Take Apprenticeship *
        foundedUser.canTakeApprenticeship = BooleanValidator(
          canTakeApprenticeship,
          'Zgoda na bezpłatny staż',
        );
        // Month of Commercial Experience *
        foundedUser.monthsOfCommercialExp = NumberInRangeValidator(
          monthsOfCommercialExp,
          0,
          999,
          'Miesiące doświadczenia komercyjnego',
        );
        // Education
        foundedUser.education = education || foundedUser.education;
        // Work Experience
        foundedUser.workExperience =
          workExperience || foundedUser.workExperience;
        // Courses
        foundedUser.courses = courses || foundedUser.courses;
      } else if (permission === RoleEnum.HR) {
        foundedUser.company = StringValidator(company, 1, 'Nazwa firmy');
        foundedUser.maxReservedStudents = maxReservedStudents
          ? NumberInRangeValidator(
              maxReservedStudents,
              1,
              999,
              'Maksymalna liczba rozmów',
            )
          : 1;
      }

      // Clear Token
      foundedUser.activationLink = null;
      foundedUser.accountBlocked = false;
      // Save User
      await foundedUser.save();
      return {
        isSuccess: true,
        message: 'Dane użytkownika zostały pomyślnie zaktualizowane.',
      };
    } catch (error) {
      console.log(error);
      return {
        isSuccess: false,
        message: error.message,
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
        foundStudent.studentStatus = StudentStatus.HIRED;
        foundStudent.accountBlocked = true;
        await foundStudent.save();

        return {
          isSuccess: true,
          message: 'User account has been successfully closed.',
        };
      } else {
        throw new Error('No User Found');
      }
    } catch (error) {
      return {
        isSuccess: true,
        message: error.message,
      };
    }
  }

  async changeStudentStatus(
    id: string,
    { status }: { status: StudentStatus },
    hrId: string,
  ) {
    try {
      const foundStudent = await User.findOneBy({ id });
      const foundUserToUser = await UserToUser.findOneByOrFail({
        hrId,
        studentId: id,
      });

      if (foundStudent) {
        await UserToUser.remove(foundUserToUser);
        if (status === StudentStatus.HIRED) {
          foundStudent.studentStatus = StudentStatus.HIRED;
          foundStudent.accountBlocked = true;
        }

        await foundStudent.save();

        return {
          isSuccess: true,
          message: 'User account has been successfully closed.',
        };
      } else {
        throw new Error('No User Found');
      }
    } catch (error) {
      return {
        isSuccess: true,
        message: error.message,
      };
    }
  }

  async findUsersForHR(
    { id, filters, limit, page, studentStatus }: FilterPayloadForHr<HrFilters>,
    userFromRequest: string,
  ) {
    try {
      const salaryRange = [
        filters.minSalary ? filters.minSalary : 0,
        filters.maxSalary ? filters.maxSalary : 9999999,
      ];
      const arrayOfStudentsTalkingToHr = await UserToUser.findBy({
        hrId: userFromRequest,
      });

      const results = await User.find({
        where: [
          {
            firstName: Like(`%${filters.search}%`) || Not('0xError404'),
            courseCompletion: filters.courseCompletion.length
              ? In(filters.courseCompletion)
              : null,
            courseEngagement: filters.courseEngagement.length
              ? In(filters.courseEngagement)
              : null,
            projectDegree: filters.projectDegree.length
              ? In(filters.projectDegree)
              : null,
            teamProjectDegree: filters.teamProjectDegree.length
              ? In(filters.teamProjectDegree)
              : null,
            expectedTypeWork: filters.expectedTypeWork.length
              ? In([
                  ExpectedTypeWorkEnum.IRRELEVANT,
                  ...filters.expectedTypeWork,
                ])
              : null,
            expectedContractType: filters.expectedContractType.length
              ? In([
                  ExpectedContractTypeEnum['NO PREFERENCES'],
                  ...filters.expectedContractType,
                ])
              : null,
            expectedSalary: Between(salaryRange[0], salaryRange[1]),
            canTakeApprenticeship: filters.canTakeApprenticeship,
            monthsOfCommercialExp: filters.monthsOfCommercialExp
              ? MoreThanOrEqual(filters.monthsOfCommercialExp)
              : MoreThanOrEqual(0),
            permission: RoleEnum.STUDENT,
          },
          {
            lastName: Like(`%${filters.search}%`) || Not('0xError404'),
            courseCompletion: filters.courseCompletion.length
              ? In(filters.courseCompletion)
              : null,
            courseEngagement: filters.courseEngagement.length
              ? In(filters.courseEngagement)
              : null,
            projectDegree: filters.projectDegree.length
              ? In(filters.projectDegree)
              : null,
            teamProjectDegree: filters.teamProjectDegree.length
              ? In(filters.teamProjectDegree)
              : null,
            expectedTypeWork: filters.expectedTypeWork.length
              ? In([
                  ExpectedTypeWorkEnum.IRRELEVANT,
                  ...filters.expectedTypeWork,
                ])
              : null,
            expectedContractType: filters.expectedContractType.length
              ? In([
                  ExpectedContractTypeEnum['NO PREFERENCES'],
                  ...filters.expectedContractType,
                ])
              : null,
            expectedSalary: Between(salaryRange[0], salaryRange[1]),
            canTakeApprenticeship: filters.canTakeApprenticeship,
            monthsOfCommercialExp: filters.monthsOfCommercialExp
              ? MoreThanOrEqual(filters.monthsOfCommercialExp)
              : MoreThanOrEqual(0),
            permission: RoleEnum.STUDENT,
            studentStatus: studentStatus,
          },
        ],
        take: limit,
        skip: (page - 1) * limit,
      });
      const filteredStudentIdsForHr = {};
      arrayOfStudentsTalkingToHr.forEach(user => {
        filteredStudentIdsForHr[user.studentId] = user.reservationEndDate;
      });

      const finalResults = results
        .filter(user => {
          if (studentStatus === 'BUSY') {
            return (
              Object.keys(filteredStudentIdsForHr).includes(user.id) &&
              user.studentStatus !== 'HIRED'
            );
          } else if (studentStatus === 'AVAILABLE') {
            return (
              !Object.keys(filteredStudentIdsForHr).includes(user.id) &&
              user.studentStatus !== 'HIRED'
            );
          }
          return false;
        })
        .map(user => {
          user.reservationEndDate = filteredStudentIdsForHr[user.id]
            ? filteredStudentIdsForHr[user.id]
            : null;
          return this.baseUserFilter(user);
        });

      return {
        users: finalResults,
        total: finalResults && finalResults.length,
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

  async findUsersForTargetHR(
    id: string,
    { filters, limit, page, studentStatus }: FilterPayloadForHr<HrFilters>,
  ) {
    try {
      const [results, total] = await User.findAndCount({
        where: [
          {
            email: Like(`%${filters.search}%`) || Not('0xError404'),
            studentStatus: studentStatus,
            permission: RoleEnum.STUDENT,
            assignedHR: {
              id,
            },
          },
          {
            firstName: Like(`%${filters.search}%`) || Not('0xError404'),
            studentStatus: studentStatus,
            permission: RoleEnum.STUDENT,
            assignedHR: {
              id,
            },
          },
          {
            lastName: Like(`%${filters.search}%`) || Not('0xError404'),
            studentStatus: studentStatus,
            permission: RoleEnum.STUDENT,
            assignedHR: {
              id,
            },
          },
        ],
        take: limit,
        skip: (page - 1) * limit,
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

  async reserveUser(id: string, payload: FilteredUser) {
    try {
      await User.findOneByOrFail({ id });
      await User.findOneByOrFail({ id: payload.id });
      // foundedStudent.studentStatus = StudentStatus.BUSY;
      // foundedStudent.assignedHR = foundHr;
      // // set 10 days cooldown, cron will check if experience student status will be changed to avaiable
      // foundedStudent.reservationEndDate = new Date(
      //   new Date().setDate(new Date().getDate() + 10),
      // );
      // await foundedStudent.save();

      const newUserToUser =
        (await UserToUser.findOneBy({
          hrId: payload.id,
          studentId: id,
        })) || new UserToUser();
      newUserToUser.id = newUserToUser.id || uuid();
      newUserToUser.hrId = payload.id;
      newUserToUser.studentId = id;
      newUserToUser.reservationEndDate = new Date(
        new Date().setDate(new Date().getDate() + 10),
      );

      await newUserToUser.save();

      return {
        isSuccess: true,
        message: 'The student has been successfully booked.',
      };
    } catch (e) {
      return {
        isSuccess: true,
        message: 'An error occurred while booking the student.',
      };
    }
  }
}
