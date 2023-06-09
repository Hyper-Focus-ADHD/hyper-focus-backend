import { Expose } from 'class-transformer';

import { Gender, Language, Role } from '../../enums/user.enum';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  role: Role;

  @Expose()
  email: string;

  @Expose()
  birthdate: Date;

  @Expose()
  gender: Gender;

  @Expose()
  nationality: string;

  @Expose()
  language: Language;

  @Expose()
  profile_picture?: string;

  @Expose()
  created_at: Date;
}
