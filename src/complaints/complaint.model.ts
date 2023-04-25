import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ComplaintDocument = Complaint & Document;

@Schema()
export class Complaint {

  @Prop()
  Title: string;
  
  @Prop()
  description: string;

  @Prop()
  createdBy: string;

  @Prop({default:Date.now})
  createdDate: Date;

}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
