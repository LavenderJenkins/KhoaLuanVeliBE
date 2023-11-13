import {Body, Controller, Get, HttpStatus, Param, Post, Res} from '@nestjs/common';
import {Response} from 'express';
import {CatchException} from 'src/exceptions/common.exception';
import {BaseResponse} from 'src/utils/utils.response';
import {AuthService} from './auth.service';
import {RegisterDto} from './dto/register.dto';
import {RegisterResponse} from './responses/Register.response';
import {LoginDto} from './dto/login.dto';
import {GetUserIdFromToken} from 'src/utils/utils.decorators';
import {VerifyDto} from './dto/verify.dto';
import {ChangePasswordDto} from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    try {
      const data = await this.authService.register(body);
      return res.status(HttpStatus.CREATED).send(new BaseResponse({data, message: "Đăng ký thành công"}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const data = await this.authService.login(body);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post('change-password')
  async changePassword(
    @GetUserIdFromToken() userId: string,
    @Body() body: ChangePasswordDto, @Res() res: Response) {
    try {
      const data = await this.authService.changePassword(userId, body);
      return res.status(HttpStatus.OK).send(new BaseResponse({data, message: "Cập nhật mật khẩu thành công"}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post('forgot-password/:phone')
  async updateForgotPassword(
    @Param('phone') phone: string,
    @Body() body: any, @Res() res: Response) {
    try {
      const data = await this.authService.updateForgotPassword(phone, body);
      return res.status(HttpStatus.OK).send(new BaseResponse({data, message: "Cập nhật mật khẩu thành công"}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('forgot-password/:phone')
  async forgotPassword(
    @Param('phone') phone: string,
    @Res() res: Response) {
    try {
      const data = await this.authService.forgotPassword(phone);
      return res.status(HttpStatus.OK).send(new BaseResponse({data, message: "Đã gửi mã OTP đến số điện thoại của bạn"}));
    } catch (e) {
      throw new CatchException(e);
    }
  }
  
  @Post("verify-update-pass/:phone")
  async verifyUpdatePass(
    @Param('phone') phone: string,
    @Body() body: VerifyDto,
    @Res() res: Response
  ) {
    try {
      const data = await this.authService.verifyUpdatePass(phone, body);
      return res.status(HttpStatus.OK).send(new BaseResponse({data, message: "Xác minh tài khoản thành công"}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post("verify")
  async getVerifiedCode(
    @GetUserIdFromToken() userId: string,
    @Res() res: Response
  ) {
    try {
      const data = await this.authService.getVerifiedCode(userId);
      return res.status(HttpStatus.OK).send(new BaseResponse({data, message: "Đã gửi mã xác minh tới điện thoại"}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post("verify/:userId")
  async verify(
    @GetUserIdFromToken() check: string,
    @Param("userId") userId: string,
    @Body() body: VerifyDto,
    @Res() res: Response
  ) {
    try {
      const data = await this.authService.verify(userId, body);
      return res.status(HttpStatus.OK).send(new BaseResponse({data, message: "Xác minh tài khoản thành công"}));
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
