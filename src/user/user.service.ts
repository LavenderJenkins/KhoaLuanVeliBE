import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import {ExceptionResponse} from 'src/exceptions/common.exception';
import { User } from 'src/models/user.model';
import {UpdateUserDto} from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findOne(userId: string) {
    const user = await this.userModel.findById(userId).populate('school_id').lean();

    user && delete user.password;

    return user;
  }

  async update(userId: string, body: UpdateUserDto) {
    const user = await this.userModel.findById(userId).lean();
    const { date_of_birth: dateOfBirth, avatar } = body;
    if (!moment(dateOfBirth, "DD/MM/YYYY").isValid()) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Ngày sinh không hợp lệ")
    }

    if (!user) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Người dùng không tồn tại");

    const newUser = await this.userModel.findByIdAndUpdate(
      userId, 
      { 
        ...body,
        ...(avatar && { avatar }),
        ...(dateOfBirth && { date_of_birth: moment(dateOfBirth, "DD/MM/YYYY").toDate()})
      }, 
      { new: true }
    );
    
    return newUser;

  }
}
