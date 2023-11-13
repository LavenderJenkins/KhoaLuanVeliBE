import {HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {Model} from 'mongoose';
import {TimeToLive} from 'src/enums';
import {ExceptionResponse} from 'src/exceptions/common.exception';
import {User} from 'src/models/user.model';
import {RegisterDto} from './dto/register.dto';
import {InjectModel} from '@nestjs/mongoose';
import {LoginDto} from './dto/login.dto';
import {Verify} from 'src/models/verify.model';
import {UtilCommonTemplate} from 'src/utils/utils.common';
import {SmsService} from 'src/sms/sms.service';
import {QueueService} from 'src/queue/queue.service';
import {VerifyDto} from './dto/verify.dto';
import {UserStatus} from 'src/constants';
import {ChangePasswordDto} from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly queueService: QueueService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Verify.name)
    private readonly verifyModel: Model<Verify>,
  ) {}

  generateAccessToken(
    userId: string,
    full_name: string,
    phone: string,
  ): string {
    return this.jwtService.sign(
      {
        userId,
        full_name,
        phone,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: TimeToLive.OneDay,
      },
    );
  }

  async getUser(phone: string): Promise<User> | null {
    return this.userModel.findOne({phone: phone}).populate("school_id").lean();
  }

  async register(data: RegisterDto): Promise<any> {
    const {full_name: fullName, phone, password} = data;

    const userExist = await this.getUser(phone);

    if (userExist) {
      throw new ExceptionResponse(
        HttpStatus.CONFLICT,
        'Số điện thoại đã được đăng ký',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = (
      await this.userModel.create({
        full_name: fullName,
        phone: phone,
        password: hashedPassword,
      })
    ).toObject();

    console.log(newUser);

    delete newUser.password;
    return newUser;
  }

  async login(body: LoginDto) {
    const {phone, password} = body;

    const user = await this.getUser(phone);

    if (!user) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Số điện thoại chưa được đăng ký',
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Số điện thoại / mật khẩu không chính xác',
      );
    }

    delete user.password;

    const accessToken = this.generateAccessToken(
      user._id,
      user.full_name,
      user.phone,
    );
    return {
      ...user,
      accessToken,
    };
  }

  async getVerifiedCode(userId: string) {
    const verify = await this.verifyModel
      .findOne()
      .populate({
        path: 'user_id',
        match: {_id: userId},
      })
      .lean();

    if (verify)
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Vui lòng thử lại sau ít phút',
      );

    const user = await this.userModel.findById(userId).lean();

    if (!user)
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Yêu cầu không hợp lệ',
      );

    const otpCode = UtilCommonTemplate.generateOTP();
    await this.smsService.sendSMS(
      `+84${user.phone.slice(1)}`,
      `Ma xac thuc Veli cua ban la: ${otpCode} (co hieu luc 1 phut)`
    );

    const newVerify = await this.verifyModel.create({
      user_id: user._id,
      otp_code: otpCode,
    });

    await this.queueService.addJob(
      'delete-expired-otp',
      newVerify.toObject(),
      TimeToLive.OneMinuteMillisecond
    );
  }


  async verify(userId: string, body: VerifyDto) {
    const {otp_code: otpCode} = body;
    const verify = await this.verifyModel.findOne({
      otp_code: otpCode,
      user_id: userId,
    });

    if (!verify)
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Mã OTP không chính xác',
      );

    await this.verifyModel.findByIdAndDelete(verify._id);
    await this.userModel.findByIdAndUpdate(
      userId,
      {status: UserStatus.Active}
    );

    return null;
  }

  async verifyUpdatePass(phone: string, body: VerifyDto) {
    const {otp_code: otpCode} = body;
    const user = await this.getUser(phone);

    if (!user) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Số điện thoại chưa được đăng ký")
    }

    const verify = await this.verifyModel.findOne({
      otp_code: otpCode,
      user_id: user?._id,
    });

    if (!verify || !user)
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Mã OTP không chính xác',
      );

    await this.verifyModel.findByIdAndDelete(verify._id);

    return null;
  }

  async forgotPassword(phone: string) {
    const user = await this.getUser(phone);

    if (!user) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Số điện thoại chưa được đăng ký")
    }

    const otpCode = UtilCommonTemplate.generateOTP();
    await this.smsService.sendSMS(
      `+84${phone.slice(1)}`,
      `Ma xac thuc dat lai mat khau Veli cua ban la: ${otpCode} (co hieu luc 1 phut)`
    );

    const newVerify = await this.verifyModel.create({
      user_id: user._id,
      otp_code: otpCode,
    });

    await this.queueService.addJob(
      'delete-expired-otp',
      newVerify.toObject(),
      TimeToLive.OneMinuteMillisecond
    );
  }

  async updateForgotPassword(phone: string, body: any) {
    const {password = ''} = body;

    const user = await this.getUser(phone);

    if (!user) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Số điện thoại chưa được đăng ký")
    }

    if (password.length < 6) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Mật khẩu phải tối thiểu 6 ký tự")
    };

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword
      }
    );

    return null;

  }

  async changePassword(userId: string, body: ChangePasswordDto) {
    const {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    } = body;

    if (newPassword != newPasswordConfirm) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Xác nhận mật khẩu mới không trùng khớp!");
    }

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Người dùng không tồn tại!");
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Mật khẩu cũ không chính xác',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword
      }
    );

    return null;
  }
}
