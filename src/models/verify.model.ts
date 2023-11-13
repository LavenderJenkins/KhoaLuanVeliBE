import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({timestamps: true})
export class Verify {
  _id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user_id: string;

  @Prop()
  otp_code: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  modified_at: Date;



}

export const VerifySchema = SchemaFactory.createForClass(Verify);