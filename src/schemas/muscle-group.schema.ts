import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MuscleGroupDocument = MuscleGroup & Document;

@Schema({ collection: 'muscle_groups' })
export class MuscleGroup {
  @Prop({ type: Types.ObjectId, ref: 'WorkoutType', required: true })
  workoutTypeId: Types.ObjectId;

  @Prop({ required: true })
  label: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MuscleGroupSchema = SchemaFactory.createForClass(MuscleGroup);
