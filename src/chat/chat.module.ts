import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ConverastionSchema, Conversation} from 'src/models/converation.model';
import {Message, MessageSchema} from 'src/models/message.model';
import {UserMessage, UserMessageSchema} from 'src/models/user-message.model';
import {User, UserSchema} from 'src/models/user.model';
import {ChatController} from './chat.controller';
import {ChatService} from './chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
      {name: Conversation.name, schema: ConverastionSchema},
      {name: Message.name, schema: MessageSchema},
      {name: UserMessage.name, schema: UserMessageSchema},
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
