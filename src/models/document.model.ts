import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({timestamps: true})
export class Document {

  @Prop({ type: SchemaTypes.ObjectId, ref: 'School' })
  school_id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Subject' })
  subject_id: string;

  @Prop()
  name: string;

  @Prop({default: false})
  is_free: boolean;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  images: [string];

  @Prop({ default: false })
  is_sold: boolean;

  @Prop()
  address: string;  

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  modified_at: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  created_by: string;

}

export const DocumentSchema = SchemaFactory.createForClass(Document);
