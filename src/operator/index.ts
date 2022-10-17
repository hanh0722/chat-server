import { REGEX_PASSWORD } from "../constants/operator";

export const isContainUpperCase = (value: string) => {
  return value !== value.toUpperCase();
}

export const isPasswordContainSpecialCharacter = (value: string) => {
  return REGEX_PASSWORD.test(value);
}