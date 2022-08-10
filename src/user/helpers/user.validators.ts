import * as urlExists from 'url-exists';
import fetch from 'node-fetch';
import {
  ExpectedContractTypeEnum,
  ExpectedTypeWorkEnum,
  StudentStatus,
} from '../../types';
import { User } from '../entities/user.entity';

export const StudentStatusValidator = (studentStatus: StudentStatus) =>
  studentStatus in StudentStatus && studentStatus;

export const ExpectedContractTypeValidator = (
  expectedContractType: ExpectedContractTypeEnum,
) => {
  if (
    !(expectedContractType in ExpectedContractTypeEnum && expectedContractType)
  ) {
    throw new Error(
      'Preferowany rodzaj umowy powinien zostać wybrany z opcji dostępnych na stronie.',
    );
  }
  return expectedContractType;
};

export const ExpectedTypeWorkValidator = (
  expectedTypeWork: ExpectedTypeWorkEnum,
) => {
  if (!(expectedTypeWork in ExpectedTypeWorkEnum && expectedTypeWork)) {
    throw new Error(
      'Preferowany tryb pracy powinien zostać wybrany z opcji dostępnych na stronie.',
    );
  }
  return expectedTypeWork;
};

export const LinksValidator = (
  arrayOfLinks: Array<string> | string,
  checkedValue: string,
  escapeFlag: boolean,
) => {
  if (typeof arrayOfLinks === 'string') {
    arrayOfLinks = arrayOfLinks.split(',');
  }
  if (
    arrayOfLinks &&
    arrayOfLinks.filter(async link => urlExists(link, (err, exists) => exists))
  ) {
    return arrayOfLinks;
  }
  if (escapeFlag) {
    throw new Error(`Pole ${checkedValue} zostało źle wypełnione`);
  }
  return null;
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
  checkedValue: string,
) => {
  if (
    (Number.isInteger(Number(value)) || Number(value) === 0) &&
    Number(value) >= starts &&
    Number(value) <= ends
  ) {
    return value;
  }
  throw new Error(
    `Liczba w polu ${checkedValue} powinna zmieścić się w przedziale ${starts} do ${ends} i być liczbą całkowitą.`,
  );
};

export const BooleanValidator = (
  value: boolean | null | string,
  checkedValue: string,
) => {
  if (typeof value === 'boolean' && (value === true || value === false)) {
    return value;
  }
  throw new Error(
    `Wybór w polu ${checkedValue} powinien zostać wybrany z opcji dostępnych na stronie.`,
  );
};

export const ValidateEmail = async (email, foundUserEmail, foundUserId) => {
  if (!MailValidator(email)) {
    throw new Error('To nie jest email.');
  }
  const checkUserByEmail = await User.findBy({ email });
  if (
    checkUserByEmail.length > 1 ||
    checkUserByEmail[0].email !== foundUserEmail ||
    checkUserByEmail[0].id !== foundUserId
  ) {
    throw new Error('Ten email jest już użyty w naszej bazie.');
  }
  return email;
};

export const StringValidator = (
  string: string,
  len: number,
  nameOfField: string,
) => {
  if (string.length < len) {
    throw new Error(`Minimalna długość pola ${nameOfField} wynosi ${len}.`);
  }
  return string;
};

export const GitHubUserNameValidator = async (userName: string) => {
  const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  if (!RegExp(regex).test(userName)) {
    throw new Error(
      'Niestety, podana wartość pola Nazwa na GitHub jest nieprawidłowa',
    );
  }
  const { status } = await fetch(`https://github.com/${userName}/`);
  if (status !== 200) {
    throw new Error(
      'Niestety, podana wartość pola Nazwa na GitHub jest nieprawidłowa. GitHub nie ma takiego użytkownika.',
    );
  }
  return userName;
};

export const GitHubAvatarGetter = async (userName: string) => {
  const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  if (!RegExp(regex).test(userName)) {
    throw new Error(
      'Niestety, podana wartość pola Nazwa na GitHub jest nieprawidłowa',
    );
  }
  const { status } = await fetch(`https://github.com/${userName}/`);
  if (status !== 200) {
    throw new Error(
      'Niestety, podana wartość pola Nazwa na GitHub jest nieprawidłowa. GitHub nie ma takiego użytkownika.',
    );
  }
  return userName;
};
export const PhoneNumberValidator = (
  value: number,
  starts: number,
  ends: number,
) => {
  if (
    Number.isInteger(Number(value)) &&
    Number(value) >= starts &&
    Number(value) <= ends &&
    value
  ) {
    return value;
  }
  throw new Error(
    'Numer telefonu jest zły. Powinien to być numer krajowy, mieć 9 cyfr bez numeru kierunkowego Polski i zera na początku. Pole może być puste.',
  );
};
