export interface RequestRegister {
  username: string;
  password: string;
  email: string;
}

export interface CreateUserParams extends RequestRegister {

}