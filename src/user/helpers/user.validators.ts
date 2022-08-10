import * as urlExists from 'url-exists';
import { ExpectedContractTypeEnum, ExpectedTypeWorkEnum, StudentStatus } from '../../types';

export const StudentStatusValidator = (studentStatus: StudentStatus) =>
  studentStatus in StudentStatus && studentStatus;

export const ExpectedContractTypeValidator = (
  expectedContractType: ExpectedContractTypeEnum,
) => expectedContractType in ExpectedContractTypeEnum && expectedContractType;

export const ExpectedTypeWorkValidator = (
  expectedTypeWork: ExpectedTypeWorkEnum,
) => expectedTypeWork in ExpectedTypeWorkEnum && expectedTypeWork;

export const LinksValidator = (arrayOfLinks: Array<string> | string) => {
  if (typeof arrayOfLinks === 'string') {
    arrayOfLinks = arrayOfLinks.split(',');
  }
  return (
    arrayOfLinks &&
    arrayOfLinks.filter(async link => urlExists(link, (err, exists) => exists))
  );
};

export const CityValidator = (city: string) =>
  RegExp(
    "^(?:[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]{2,}(?:(.s|'ss|s?-s?|s)?(?=[A-Za-z]+))){1,2}(?:[A-Za-z]+)?$",
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
