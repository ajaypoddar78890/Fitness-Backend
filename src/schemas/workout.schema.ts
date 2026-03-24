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

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
applyBaseSchemaFeatures(WorkoutSchema);
