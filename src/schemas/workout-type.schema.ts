import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type WorkoutTypeDocument = WorkoutType & Document;

@Schema({ collection: 'workout_types', timestamps: true })
export class WorkoutType extends BaseDocumentSchema {
  @Prop({ required: true })
  label: string;

  @Prop()
  icon: string;

  // ── Rich fields for the Workout Types browse screen ──
  @Prop()
  description: string;

  @Prop({ enum: ['hypertrophy', 'strength', 'endurance', 'fat_loss', 'mobility', 'mixed'] })
  goal: string;

  @Prop()
  levelLabel: string; // e.g. "INT-ADV", "ALL LEVELS", "ADVANCED"

  @Prop({ type: [String], default: [] })
  levels: string[]; // ['beginner','intermediate','advanced']

  @Prop()
  bodyArea: string; // e.g. "Full Body", "Core & Cardio", "Posterior Chain"

  @Prop({ default: 0 })
  workoutCount: number;

  @Prop({ enum: ['none', 'bodyweight', 'minimal', 'gym'], default: 'gym' })
  equipment: string;

  @Prop()
  durationRangeLabel: string; // e.g. "30-45M"

  @Prop()
  accentColor: string;

  @Prop({ type: [String], default: [] })
  gradient: string[];

  @Prop({ default: 0 })
  sortOrder: number;
}

export const WorkoutTypeSchema = SchemaFactory.createForClass(WorkoutType);
applyBaseSchemaFeatures(WorkoutTypeSchema);
