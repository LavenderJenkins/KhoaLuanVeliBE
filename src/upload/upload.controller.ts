import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UploadService } from './upload.service';
import { GetUserIdFromToken } from 'src/utils/utils.decorators';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @FormDataRequest()
  async handleUploadFile(
    @GetUserIdFromToken() userId: string,
    @Body() uploadBody: CreateUploadDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.uploadService.handleUploadFile(userId, uploadBody.files);
      return res
        .status(HttpStatus.CREATED)
        .send(new BaseResponse({ data, message: 'Upload thành công' }));
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
