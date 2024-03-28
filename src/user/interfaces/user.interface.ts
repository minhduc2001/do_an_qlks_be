import { ERole } from '@/role/enum/roles.enum';

export interface IUserGetByUniqueKey {
  username?: string;
  email?: string;
}

export interface ICreateUser {
  email: string;
  password: string;
  username: string;
}
