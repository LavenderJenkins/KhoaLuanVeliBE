import { Body, Controller, Get, HttpStatus, Param, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { CatchException } from 'src/exceptions/common.exception';
import { BaseResponse } from 'src/utils/utils.response';
import { UserService } from './user.service';
import { GetUserIdFromToken } from 'src/utils/utils.decorators';
import {UpdateUserDto} from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async findOne(
    @GetUserIdFromToken() user: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.userService.findOne(userId);
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Put(':userId')
  async update(
    @GetUserIdFromToken() user: string,
    @Param('userId') userId: string,
    @Body() body: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.userService.update(userId, body);
      return res.status(HttpStatus.OK).send(new BaseResponse({ data, message: "Cập nhật thông tin người dùng thành công" }));
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
