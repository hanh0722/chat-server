import { QuerySort } from "../../base";

export interface RequestRegister {
  username: string;
  password: string;
  email: string;
}

export interface RequestLogin {
  username: string;
  password: string;
}

export interface CreateUserParams extends RequestRegister {

}

export interface RequestValidateUser {
  username: string;
  otp: string;
}

export interface RequestParamsUser extends QuerySort {
  username: string;
}