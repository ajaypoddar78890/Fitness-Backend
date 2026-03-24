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
}

export const WorkoutTypeSchema = SchemaFactory.createForClass(WorkoutType);
applyBaseSchemaFeatures(WorkoutTypeSchema);
