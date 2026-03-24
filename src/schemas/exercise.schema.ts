import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type ExerciseDocument = Exercise & Document;

@Schema({ collection: 'exercises', timestamps: true })
export class Exercise extends BaseDocumentSchema {
  @Prop({ type: Types.ObjectId, ref: 'MuscleGroup', required: true })
  muscleGroupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkoutType', required: true })
  workoutTypeId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  imageUrl: string;

  @Prop()
  summary: string;

  @Prop({ enum: ['barbell', 'dumbbell', 'cable', 'bodyweight', 'machine'] })
  equipment: string;

  @Prop()
  equipmentDetails: string;

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: string;

  @Prop()
  instructions: string;

  @Prop()
  videoUrl: string;

  @Prop({ type: [String], default: [] })
  techniqueSteps: string[];

  @Prop()
  durationSeconds: number;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
applyBaseSchemaFeatures(ExerciseSchema);
