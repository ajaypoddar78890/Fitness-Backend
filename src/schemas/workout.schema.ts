import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutDocument = Workout & Document;

@Schema({ timestamps: true })
export class Workout {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Array, default: [] })
  exercises: any[];

  @Prop()
  duration: number;

  @Prop()
  difficulty: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
