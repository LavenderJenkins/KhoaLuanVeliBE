import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import {CONVERSATION_STATUS} from "src/constants";

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({timestamps: true})
export class Conversation {
  _id: string;
  
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [{type: SchemaTypes.ObjectId }], ref: "User"})
  member_ids: string[];

  @Prop({ required: true, default: CONVERSATION_STATUS.Active})
  status: number;
};

export const ConverastionSchema = SchemaFactory.createForClass(Conversation);
