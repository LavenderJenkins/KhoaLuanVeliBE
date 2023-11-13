import {Body, Controller, Get, HttpStatus, Param, Post, Put, Res} from '@nestjs/common';
import {Response} from 'express';
import {CatchException} from 'src/exceptions/common.exception';
import {GetUserIdFromToken} from 'src/utils/utils.decorators';
import {BaseResponse} from 'src/utils/utils.response';
import {ChatService} from './chat.service';
import {CreateConversationDto} from './dto/create-conversation.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversation')
  async createConversation(
    @GetUserIdFromToken() userId: string,
    @Body() body: CreateConversationDto,
    @Res() res: Response) {
    try {
      const data = await this.chatService.createConversation(userId, body);
      return res.status(HttpStatus.CREATED).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('conversations')
  async getConversations(@GetUserIdFromToken() userId: string, @Res() res: Response) {
    try {
      const data = await this.chatService.getConversations(userId);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('conversations/:conversationId')
  async getDetailConversation(@GetUserIdFromToken() userId: string, @Param('conversationId') conversationId: string, @Res() res: Response) {
    try {
      const data = await this.chatService.getDetailConversation(userId, conversationId);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }
  
  @Put('conversations/:conversationId')
  async readMessages(@GetUserIdFromToken() userId: string, @Param('conversationId') conversationId: string, @Res() res: Response) {
    try {
      const data = await this.chatService.readMessages(userId, conversationId);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('/:conversationId')
  async getConversationMessages(@GetUserIdFromToken() userId: string, @Param('conversationId') conversationId: string, @Res() res: Response) {
    try {
      const data = await this.chatService.getConversationMessages(conversationId);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}));
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
