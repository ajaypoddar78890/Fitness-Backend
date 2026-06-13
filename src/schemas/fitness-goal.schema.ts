import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type FitnessGoalDocument = FitnessGoal & Document;

/**
 * Per-user daily targets used as the ring/progress denominators on the
 * Activity screen. One document per user (kept in the same fitness-activity
 * domain as the per-day records).
 */
@Schema({ collection: 'user_fitness_goals', timestamps: true })
export class FitnessGoal extends BaseDocumentSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: 10000 })
  stepsGoal: number;

  @Prop({ default: 600 })
  caloriesGoal: number;

  @Prop({ default: 45 })
  workoutDurationGoal: number; // minutes
}

export const FitnessGoalSchema = SchemaFactory.createForClass(FitnessGoal);
applyBaseSchemaFeatures(FitnessGoalSchema);
