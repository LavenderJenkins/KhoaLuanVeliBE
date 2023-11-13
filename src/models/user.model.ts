import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import {UserStatus} from "src/constants";


export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
  _id: string;
  
  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, default: UserStatus.UnActive })
  status: number;
  
  @Prop({ required: true })
  password: string;
  
  @Prop({default: ''})
  avatar: string;

  @Prop({default: 'male'})
  gender: string;

  @Prop()
  address: string;

  @Prop()
  email: string;

  @Prop()
  date_of_birth: Date;

  @Prop({type: SchemaTypes.ObjectId, default: null, ref: "School"})
  school_id: string;

  @Prop({default: ['member']})
  roles: [string];
};

export const UserSchema = SchemaFactory.createForClass(User);
