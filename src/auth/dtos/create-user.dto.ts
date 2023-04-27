import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

import { messagesHelper } from '../../helpers/messages-helper';
import { regExHelper } from '../../helpers/regExHelper';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(regExHelper.password, {
    message: messagesHelper.PASSWORD_VALID,
  })
  password: string;
}
