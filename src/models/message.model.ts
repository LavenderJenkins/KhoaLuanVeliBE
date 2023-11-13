import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import {MESSAGE_STATUS, MESSAGE_TYPE} from "src/constants";

export type MessageDocument = HydratedDocument<Message>;

@Schema({timestamps: true})
export class Message {
  _id: string;
  
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: MESSAGE_TYPE.Text})
  type: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Conversation' })
  conversation_id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  created_by: string;
};

export const MessageSchema = SchemaFactory.createForClass(Message);
