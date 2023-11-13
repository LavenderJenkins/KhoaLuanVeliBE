import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({timestamps: true})
export class Subject {  
  @Prop()
  name: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now})
  modified_at: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  created_by: string;

}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
