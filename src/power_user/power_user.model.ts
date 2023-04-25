import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Power_userDocument = Power_user & Document;

@Schema()
export class Power_user {

  @Prop()
  firstName: string;
  
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  accessToken: string;
  
  @Prop()
  createdBy: string;

  @Prop({ default: 'PowerUser' })
  role: string;
}

export const Power_userSchema = SchemaFactory.createForClass(Power_user);
