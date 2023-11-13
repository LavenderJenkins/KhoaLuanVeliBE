import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ConverastionSchema, Conversation} from 'src/models/converation.model';
import {Message, MessageSchema} from 'src/models/message.model';
import {UserMessage, UserMessageSchema} from 'src/models/user-message.model';
import {User, UserSchema} from 'src/models/user.model';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Conversation.name, schema: ConverastionSchema },
      { name: Message.name, schema: MessageSchema },
      { name: UserMessage.name, schema: UserMessageSchema },
    ])
  ],
  providers: [SocketGateway, SocketService]
})
export class SocketModule {}
