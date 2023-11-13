import {IsDateString, IsEmail} from 'class-validator';

export class UpdateUserDto {
  full_name: string;

  email: string;

  avatar: string;

  gender: string;

  school_id: string;

  date_of_birth: string;
  
  address: string;
}
