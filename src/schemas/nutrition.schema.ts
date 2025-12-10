import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NutritionDocument = Nutrition & Document;

@Schema({ timestamps: true })
export class Nutrition {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Array, default: [] })
  items: { name: string; calories: number; macros?: any }[];

  @Prop({ default: Date.now })
  date: Date;
}

export const NutritionSchema = SchemaFactory.createForClass(Nutrition);
