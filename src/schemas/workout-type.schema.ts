import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkoutTypeDocument = WorkoutType & Document;

@Schema({ collection: 'workout_types' })
export class WorkoutType {
  @Prop({ required: true })
  label: string;

  @Prop()
  icon: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WorkoutTypeSchema = SchemaFactory.createForClass(WorkoutType);
