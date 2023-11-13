import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import {MESSAGE_STATUS, MESSAGE_TYPE} from "src/constants";

export type UserMessageDocument = HydratedDocument<UserMessage>;

@Schema({timestamps: true})
export class UserMessage {
  _id: string;

  @Prop({ required: true, default: MESSAGE_STATUS.Normal})
  status: number;

  @Prop({ required: true, default: false })
  is_seen: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Message' })
  message_id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Conversation' })
  conversation_id: string;
  
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user_id: string;
};

export const UserMessageSchema = SchemaFactory.createForClass(UserMessage);
