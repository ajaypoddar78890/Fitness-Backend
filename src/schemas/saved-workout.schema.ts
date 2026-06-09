import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type SavedWorkoutDocument = SavedWorkout & Document;

/**
 * A single exercise inside a generated workout plan.
 * Shape matches exactly what the AI trainer is prompted to return.
 */
@Schema({ _id: false })
export class WorkoutExercise {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  sets: number;

  @Prop({ required: true })
  reps: number;

  @Prop()
  weight: string; // e.g. "80kg", "bodyweight"

  @Prop()
  rest: number; // seconds

  @Prop({ type: [String], default: [] })
  formTips: string[];

  @Prop({ type: [String], default: [] })
  commonMistakes: string[];
}

/**
 * The generated workout plan (single day/session for V1).
 */
@Schema({ _id: false })
export class WorkoutPlan {
  @Prop({ default: 1 })
  day: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  focus: string;

  @Prop({ type: [WorkoutExercise], default: [] })
  exercises: WorkoutExercise[];
}

/**
 * Snapshot of the answers the user gave, kept with the workout so it can be
 * regenerated / contextualised later without re-running the conversation.
 */
@Schema({ _id: false })
export class WorkoutUserPreferences {
  @Prop({ required: true })
  goal: string;

  @Prop({ required: true })
  fitnessLevel: string;

  @Prop({ required: true })
  daysPerWeek: number;

  @Prop({ type: [String], default: [] })
  equipment: string[];

  @Prop({ type: [String], default: [] })
  injuries: string[];

  @Prop()
  timePerSession: number;
}

@Schema({ timestamps: true })
export class SavedWorkout extends BaseDocumentSchema {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  // Array of day plans (one entry per training day).
  @Prop({ type: [WorkoutPlan], default: [] })
  workoutPlan: WorkoutPlan[];

  @Prop({ type: WorkoutUserPreferences, required: true })
  userPreferences: WorkoutUserPreferences;

  @Prop({ enum: ['active', 'archived'], default: 'active' })
  status: string;

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: 0 })
  completedSessions: number;
}

export const SavedWorkoutSchema = SchemaFactory.createForClass(SavedWorkout);
applyBaseSchemaFeatures(SavedWorkoutSchema);
