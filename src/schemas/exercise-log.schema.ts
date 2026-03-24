import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type ExerciseLogDocument = ExerciseLog & Document;

@Schema({ collection: 'exercise_logs', timestamps: true })
export class ExerciseLog extends BaseDocumentSchema {
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
}

export const ExerciseLogSchema = SchemaFactory.createForClass(ExerciseLog);
applyBaseSchemaFeatures(ExerciseLogSchema);
