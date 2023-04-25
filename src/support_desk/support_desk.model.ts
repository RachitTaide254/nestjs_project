import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Support_deskDocument = Support_desk & Document;

@Schema()
export class Support_desk{

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

  @Prop({ default: 'Support_desk' })
  role: string;
}

export const Support_deskSchema = SchemaFactory.createForClass(Support_desk);
