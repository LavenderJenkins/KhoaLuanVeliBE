import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {Response} from 'express';
import {CatchException} from 'src/exceptions/common.exception';
import {GetUserIdFromToken} from 'src/utils/utils.decorators';
import {BaseResponse, ListResponse} from 'src/utils/utils.response';
import {DocumentService} from './document.service';
import {CreateDocumentDto} from './dto/create.dto';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  async getList(
    @GetUserIdFromToken() userId: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    try {
      const {data, skip, total} = await this.documentService.getList(
        userId,
        query,
      );
      return res
        .status(HttpStatus.OK)
        .send(new ListResponse({data, skip, total}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('saves')
  async getSavedList(
    @GetUserIdFromToken() userId: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    try {
      const data = await this.documentService.getSavedList(userId);
      return res
        .status(HttpStatus.OK)
        .send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post()
  async create(
    @GetUserIdFromToken() userId: string,
    @Body() body: CreateDocumentDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.documentService.create(userId, body);
      return res
        .status(HttpStatus.CREATED)
        .send(
          new BaseResponse({data, message: 'Đăng tài liệu mới thành công'}),
        );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post('save/:documentId')
  async addToSave(
    @GetUserIdFromToken() userId: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    try {
      const message = await this.documentService.addToSave(userId, documentId);
      return res
        .status(HttpStatus.OK)
        .send(
          new BaseResponse({message}),
        );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('/schools')
  async getListSchool(
    @GetUserIdFromToken() userId: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    try {
      const data = await this.documentService.getListSchool(userId, query);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('/subjects')
  async getListSubject(
    @GetUserIdFromToken() userId: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    try {
      const data = await this.documentService.getListSubject(userId, query);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post('remove-all')
  async removeAll(
    @GetUserIdFromToken() userId: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.documentService.removeAll(userId);
      return res
        .status(HttpStatus.OK)
        .send(
          new BaseResponse({data, message: 'Đã xoá toàn bộ tài liệu'}),
        );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('/:documentId')
  async getDetail(
    @GetUserIdFromToken() userId: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.documentService.getDetail(documentId);
      return res
        .status(HttpStatus.OK)
        .send(
          new BaseResponse({data}),
        );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Put('/:documentId')
  async update(
    @GetUserIdFromToken() userId: string,
    @Param('documentId') documentId: string,
    @Body() body: CreateDocumentDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.documentService.update(documentId, userId, body);
      return res
        .status(HttpStatus.CREATED)
        .send(
          new BaseResponse({data, message: 'Cập nhật tài liệu thành công'}),
        );
    } catch (e) {
      throw new CatchException(e);
    }
  }


}

