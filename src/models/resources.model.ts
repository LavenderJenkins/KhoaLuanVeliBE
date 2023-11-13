import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';

export type ResourcesDocument = HydratedDocument<Resources>;

@Schema({timestamps: true})
export class Resources extends Document {

  @Prop()
  file_name: string;

  @Prop()
  is_keep: number;

  @Prop()
  type: number;

  @Prop()
  size: number; 

  @Prop()
  path: string;

  @Prop()
  encoding: string;

  @Prop()
  ext: string;

  @Prop()
  created_at: Date;

  @Prop({
    type: SchemaTypes.ObjectId
  })
  created_by: string;

  @Prop()
  updated_at: Date;
}

export const ResourcesSchema = SchemaFactory.createForClass(Resources);