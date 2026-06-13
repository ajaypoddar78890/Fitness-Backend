import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type FitnessActivityDocument = FitnessActivity & Document;

@Schema({ _id: false })
export class ActiveHour {
  @Prop({ required: true })
  hour: number;

  @Prop({ required: true, default: 0 })
  activityCount: number;
}

export const ActiveHourSchema = SchemaFactory.createForClass(ActiveHour);

@Schema({ collection: 'user_fitness_activities', timestamps: true })
export class FitnessActivity extends BaseDocumentSchema {
  // One user can have many activity records (userId -> User._id)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ default: 0 })
  steps: number;

  @Prop({ default: 0 })
  caloriesBurned: number;

  @Prop({ default: 0 })
  distanceKm: number;

  @Prop({ default: 0 })
  workoutDurationMinutes: number;

  @Prop({ type: [ActiveHourSchema], default: [] })
  activeHours: ActiveHour[];
}

export const FitnessActivitySchema = SchemaFactory.createForClass(FitnessActivity);
applyBaseSchemaFeatures(FitnessActivitySchema);

// One activity record per user per day
FitnessActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
