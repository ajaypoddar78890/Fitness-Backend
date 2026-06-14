import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type MuscleGroupDocument = MuscleGroup & Document;

@Schema({ collection: 'muscle_groups', timestamps: true })
export class MuscleGroup extends BaseDocumentSchema {
  @Prop({ type: Types.ObjectId, ref: 'WorkoutType', required: true })
  workoutTypeId: Types.ObjectId;

  @Prop({ required: true })
  label: string;

  // ── Rich fields for the Target Muscle screen ──
  @Prop()
  imageUrl: string;

  @Prop({ default: 0 })
  workoutCount: number;

  // Functional role tag shown on the card: MAIN / CORE / STABILITY / MIXED
  @Prop({ enum: ['main', 'core', 'stability', 'mixed'], default: 'main' })
  roleTag: string;

  @Prop({ enum: ['upper', 'lower', 'core', 'full'], default: 'upper' })
  region: string;

  @Prop({ default: false })
  isFullBody: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const MuscleGroupSchema = SchemaFactory.createForClass(MuscleGroup);
applyBaseSchemaFeatures(MuscleGroupSchema);
