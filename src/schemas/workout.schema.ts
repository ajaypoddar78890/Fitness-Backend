import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type WorkoutDocument = Workout & Document;

@Schema({ _id: false })
export class WorkoutEquipmentItem {
  @Prop({ required: true })
  name: string;

  @Prop()
  icon: string;

  @Prop()
  quantityLabel: string;

  @Prop({ default: false })
  optional: boolean;
}

@Schema({ _id: false })
export class WorkoutSectionItem {
  @Prop({ enum: ['exercise', 'rest'], default: 'exercise' })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Exercise' })
  exerciseId: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  durationLabel: string;

  @Prop()
  reps: number;

  @Prop()
  restSeconds: number;

  @Prop({ default: true })
  showInfoIcon: boolean;

  // ── Per-item prescription shown on the Workout Details rows ──
  @Prop()
  setsLabel: string; // "4 Sets"

  @Prop()
  repsLabel: string; // "10-12 Reps" or "30s"

  @Prop()
  restLabel: string; // "90S"

  @Prop()
  tempo: string; // "2-0-2"

  @Prop()
  rpe: number; // 8.5

  @Prop()
  weightLabel: string; // "12KG"

  @Prop()
  note: string; // coaching cue under the row
}

@Schema({ _id: false })
export class WorkoutSection {
  @Prop({ required: true })
  title: string;

  @Prop()
  totalExercises: number;

  @Prop()
  totalMinutes: number;

  @Prop({ type: [WorkoutSectionItem], default: [] })
  items: WorkoutSectionItem[];
}

@Schema({ timestamps: true })
export class Workout extends BaseDocumentSchema {
  @Prop({ required: true })
  name: string;

  @Prop()
  imageUrl: string;

  @Prop()
  description: string;

  @Prop({ type: Array, default: [] })
  exercises: any[];

  @Prop()
  duration: number;

  @Prop()
  caloriesKcal: number;

  @Prop()
  difficulty: string;

  @Prop({ type: [WorkoutEquipmentItem], default: [] })
  equipmentItems: WorkoutEquipmentItem[];

  @Prop({ type: [WorkoutSection], default: [] })
  sections: WorkoutSection[];

  @Prop()
  playlistUrl: string;

  @Prop()
  scheduledAt: Date;

  // Optional now: curated/catalog workouts are not owned by a user.
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  // ── Catalog links + Workout Details header fields ──
  @Prop({ type: Types.ObjectId, ref: 'WorkoutType', index: true })
  workoutTypeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MuscleGroup', index: true })
  muscleGroupId: Types.ObjectId;

  @Prop({ enum: ['hypertrophy', 'strength', 'endurance', 'fat_loss', 'mobility', 'mixed'] })
  goal: string;

  @Prop()
  levelLabel: string; // "ADVANCED"

  @Prop({ enum: ['ai_coach', 'coach', 'user'], default: 'ai_coach' })
  creatorType: string;

  @Prop()
  creatorName: string;

  @Prop({ default: 0 })
  rating: number; // 4.9

  @Prop({ default: 0 })
  ratingCount: number; // 1200

  @Prop({ default: 0 })
  timesCompleted: number; // 128

  @Prop({ default: 0 })
  totalSets: number;

  // Target-muscle emphasis bar
  @Prop()
  targetMuscleLabel: string; // "CHEST/TRI"

  @Prop({ default: 0 })
  targetMusclePercent: number; // 80

  @Prop({ default: false })
  isCatalog: boolean;

  @Prop({ default: 0 })
  popularity: number;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
applyBaseSchemaFeatures(WorkoutSchema);
