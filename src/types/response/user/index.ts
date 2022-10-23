export interface RequestRegister {
  username: string;
  password: string;
  email: string;
}

export interface CreateUserParams extends RequestRegister {

}

export interface RequestValidateUser {
  username: string;
  otp: string;
}