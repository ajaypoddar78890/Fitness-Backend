import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type ExerciseDocument = Exercise & Document;

@Schema({ _id: false })
export class ExercisePrescription {
  @Prop()
  setsLabel: string; // "3-4"

  @Prop()
  repsLabel: string; // "10-12" or "30s"

  @Prop()
  restLabel: string; // "45s", "90S"

  @Prop()
  tempo: string; // "2-0-2", "Expl."

  @Prop()
  rpe: number; // 7

  @Prop()
  caloriesPerMin: number; // ~12
}

export const ExercisePrescriptionSchema = SchemaFactory.createForClass(ExercisePrescription);

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

  // ── Rich coaching fields for the Exercise Detail screen ──
  @Prop({ type: [String], default: [] })
  mediaUrls: string[]; // image/video carousel

  @Prop({ type: [String], default: [] })
  primaryMuscles: string[]; // ['Quads','Glutes','Deltoids']

  @Prop({ type: [String], default: [] })
  secondaryMuscles: string[]; // ['Calves','Core','Traps']

  @Prop({ enum: ['cardio', 'strength', 'mobility', 'core', 'plyometric'], default: 'strength' })
  category: string;

  @Prop({ enum: ['compound', 'isolation'], default: 'compound' })
  mechanic: string;

  @Prop({ enum: ['push', 'pull', 'static', 'multi'], default: 'push' })
  force: string;

  @Prop({ type: ExercisePrescriptionSchema })
  prescription: ExercisePrescription;

  @Prop()
  breathingCue: string;

  @Prop({ type: [String], default: [] })
  safetyNotes: string[];

  @Prop({ type: [String], default: [] })
  commonMistakes: string[];

  // Names of alternative/substitute exercises (kept as labels for simplicity)
  @Prop({ type: [String], default: [] })
  alternatives: string[];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
applyBaseSchemaFeatures(ExerciseSchema);
