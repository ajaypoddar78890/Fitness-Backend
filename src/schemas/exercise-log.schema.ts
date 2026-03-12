import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExerciseLogDocument = ExerciseLog & Document;

@Schema({ collection: 'exercise_logs' })
export class ExerciseLog {
  @Prop({ type: Types.ObjectId, ref: 'Exercise', required: true })
  exerciseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  sets: number;

  @Prop({ required: true })
  reps: number;

  @Prop()
  weightKg: number;

  @Prop()
  notes: string;

  @Prop({ default: false })
  isPersonalRecord: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ExerciseLogSchema = SchemaFactory.createForClass(ExerciseLog);
