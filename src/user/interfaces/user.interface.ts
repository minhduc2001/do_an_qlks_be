export interface IUserGetByUniqueKey {
  username?: string;
  email?: string;
}

export interface ICreateUser {
  email: string;
  password: string;
}
