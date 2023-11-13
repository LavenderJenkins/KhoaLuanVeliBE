import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import mongoose, {Model} from 'mongoose';
import {Conversation} from 'src/models/converation.model';
import {Message} from 'src/models/message.model';
import {UserMessage} from 'src/models/user-message.model';
import {User} from 'src/models/user.model';

@Injectable()
export class SocketService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(UserMessage.name)
    private readonly userMessageModel: Model<UserMessage>,
  ) {}

  async joinRoom(userId: string, conversationId: string) {}

  async sendChatMessage(userId: string, conversationId: string, content: string, type: number) {
    const message = await this.messageModel.create({
      created_by: userId,
      conversation_id: conversationId,
      content,
      type,
    });

    const conversation = await this.conversationModel
      .findById(new mongoose.Types.ObjectId(conversationId))
      .populate({
        path: 'member_ids',
        populate: {
          path: 'school_id',
        },
      })
      .lean();

    const users: User[] = conversation.member_ids as any;

    const userDocuments = users.map(user => ({
      message_id: message.toObject()._id,
      user_id: user._id,
      conversation_id: conversationId,
      is_seen: user._id == userId ? true : false,
    }));

    await this.userMessageModel.insertMany(
      userDocuments,
      {ordered: false}
    );

    const newMessage = await this.messageModel
      .findById(message._id)
      .populate({
        path: 'created_by',
        populate: {
          path: 'school_id',
        },
      })
      .lean()

    return newMessage;
  }

  async readMessage(userId: string, messageId: string) {

  }
}
