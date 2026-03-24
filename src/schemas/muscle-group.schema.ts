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
}

export const MuscleGroupSchema = SchemaFactory.createForClass(MuscleGroup);
applyBaseSchemaFeatures(MuscleGroupSchema);
