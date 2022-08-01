import { StudentStatus } from 'types/enums/student.status.enum';
import * as urlExists from 'url-exists';
import { ExpectedContractTypeEnum, ExpectedTypeWorkEnum } from '../../../types';

export const StudentStatusValidator = (studentStatus: StudentStatus) =>
  studentStatus in StudentStatus && studentStatus;

export const ExpectedContractTypeValidator = (
  expectedContractType: ExpectedContractTypeEnum,
) => expectedContractType in ExpectedContractTypeEnum && expectedContractType;

export const ExpectedTypeWorkValidator = (
  expectedTypeWork: ExpectedTypeWorkEnum,
) => expectedTypeWork in ExpectedTypeWorkEnum && expectedTypeWork;

export const LinksValidator = (arrayOfLinks: Array<string>) =>
  arrayOfLinks &&
  arrayOfLinks
    .filter(async link => urlExists(link, (err, exists) => exists))
    .map(link => encodeURIComponent(link));

export const CityValidator = (city: string) =>
  RegExp(
    "^(?:[A-Za-z]{2,}(?:(.s|'ss|s?-s?|s)?(?=[A-Za-z]+))){1,2}(?:[A-Za-z]+)?$",
  ).test(city) && city;

export const MailValidator = (email: string) =>
  RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$').test(email) &&
  email;

export const NumberInRangeValidator = (
  value: number,
  starts: number,
  ends: number,
) => Number(value) && value >= starts && value <= ends && value;

export const BooleanValidator = (value: boolean | null | string) =>
  typeof value === 'boolean' && value;
