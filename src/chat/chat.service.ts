import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Conversation } from 'src/models/converation.model';
import { Message } from 'src/models/message.model';
import { UserMessage } from 'src/models/user-message.model';
import { User } from 'src/models/user.model';
import { RedisConnectionService } from 'src/redis-connection/redis-connection.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(UserMessage.name)
    private readonly userMessageModel: Model<UserMessage>,
    private readonly redisService: RedisConnectionService,
  ) {}

  async createConversation(userId: string, body: CreateConversationDto) {
    const { target_id: targetId, name = '' } = body;
    const converation = await this.conversationModel
      .findOne({
        member_ids: { $all: [userId, targetId], $size: 2 },
      })
      .populate({
        path: 'member_ids',
        populate: {
          path: 'school_id',
        },
      })
      .lean();

    if (converation) {
      return converation;
    }

    const _conv = await this.conversationModel.create({
      name,
      member_ids: [userId, targetId],
    });

    const newConvertsation = await this.conversationModel
      .findById(_conv._id)
      .populate({
        path: 'member_ids',
        populate: {
          path: 'school_id',
        },
      })
      .lean();

    return { ...newConvertsation, lastMessage: null };
  }

  async getConversations(userId: string) {
    const conversations = await this.conversationModel
      .find({
        member_ids: userId,
      })
      .populate({
        path: 'member_ids',
        populate: {
          path: 'school_id',
        },
      })
      .lean();

    const conversationIds = conversations.map((conv) => conv._id);
    const lastMessages = await this.messageModel.aggregate([
      {
        $match: { conversation_id: { $in: conversationIds } }, // Lọc theo conversation_id
      },
      {
        $sort: { created_at: -1 }, // Sắp xếp theo created_at giảm dần để lấy tin mới nhất
      },
      {
        $group: {
          _id: '$conversation_id', // Nhóm theo conversation_id
          latestMessage: { $last: '$$ROOT' }, // Chọn message đầu tiên trong mỗi nhóm
        },
      },
      {
        $lookup: {
          from: 'users', // Tên của collection chứa thông tin createdBy
          localField: 'latestMessage.created_by', // Trường trong latestMessage chứa thông tin createdBy
          foreignField: '_id', // Trường ID trong collection users
          as: 'created_by', // Tên của trường kết quả
        },
      },
      {
        $unwind: '$created_by',
      },
      {
        $lookup: {
          from: 'schools', // Tên của collection chứa thông tin school
          localField: 'created_by.school_id', // Trường school_id trong đối tượng created_by
          foreignField: '_id', // Trường ID trong collection schools
          as: 'created_by.school_id', // Thêm thông tin school vào created_by
        },
      },
      {
        $unwind: {
          path: '$created_by.school_id',
          preserveNullAndEmptyArrays: true, // Nếu không tìm thấy school, vẫn giữ nguyên đối tượng created_by mà không xoá nó
        },
      },
    ]);

    const messageKeyBy = global._.keyBy(lastMessages, '_id');
    const unreadMessages = await this.userMessageModel.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          conversation_id: { $in: conversationIds },
          is_seen: false,
        },
      },
      {
        $group: {
          _id: '$conversation_id',
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMessageKeyBy = global._.keyBy(unreadMessages, '_id');

    const result = conversations.map((conv) => {
      const members: any[] = conv.member_ids.filter(
        (mem: any) => mem._id.toString() != userId,
      );
      const unreadMessage: any = unreadMessageKeyBy[conv._id] || {};
      const lastMessage: any = messageKeyBy[conv._id] || null;

      return {
        ...conv,
        name: members[0].full_name,
        member_ids: members,
        last_message:
          lastMessage != null
            ? {
                ...lastMessage.latestMessage,
                created_by: lastMessage.created_by,
              }
            : null,
        unread_count: unreadMessage.count || 0,
      };
    });

    return result.sort((a, b) => (b.last_message?.createdAt - a.last_message?.createdAt));
  }

  async getDetailConversation(userId: string, conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate({
        path: 'member_ids',
        populate: {
          path: 'school_id',
        },
      })
      .lean();

    const members: User[] = conversation.member_ids.filter(
      (mem: any) => mem._id.toString() != userId,
    ) as any;
    return {
      ...conversation,
      name: members[0].full_name,
      member_ids: members,
      last_message: null,
      unread_count: 0,
    };
  }

  async readMessages(userId: string, conversationId: string) {
    await this.userMessageModel.updateMany(
      { user_id: userId, conversation_id: conversationId, is_seen: false },
      {
        is_seen: true,
      },
    );
    return true;
  }

  async getConversationMessages(conversationId: string) {
    // thêm skip, limit sau
    const messages = await this.messageModel
      .find({
        conversation_id: conversationId,
      })
      .populate({
        path: 'created_by',
        populate: {
          path: 'school_id',
        },
      })
      .lean();

    return messages;
  }
}
