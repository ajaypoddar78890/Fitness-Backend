import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExerciseDocument = Exercise & Document;

@Schema({ collection: 'exercises' })
export class Exercise {
  @Prop({ type: Types.ObjectId, ref: 'MuscleGroup', required: true })
  muscleGroupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkoutType', required: true })
  workoutTypeId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['barbell', 'dumbbell', 'cable', 'bodyweight', 'machine'] })
  equipment: string;

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: string;

  @Prop()
  instructions: string;

  @Prop()
  videoUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
