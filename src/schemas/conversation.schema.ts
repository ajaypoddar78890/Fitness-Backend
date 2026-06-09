import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocumentSchema, applyBaseSchemaFeatures } from '../common/schemas/base-document.schema';

export type ConversationDocument = Conversation & Document;

/**
 * A single chat turn between the user and the AI trainer.
 */
@Schema({ _id: false })
export class ConversationMessage {
  @Prop({ enum: ['user', 'assistant', 'system'], required: true })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: () => new Date() })
  timestamp: Date;
}

/**
 * Structured profile we build up as the user answers the 5 onboarding questions.
 * Every field is optional until the matching question has been answered.
 */
@Schema({ _id: false })
export class UserProfile {
  @Prop()
  goal: string; // build_muscle | lose_fat | get_stronger | endurance

  @Prop()
  level: string; // beginner | intermediate | advanced

  @Prop()
  daysPerWeek: number; // derived from "2-3" | "4-5" | "6+"

  @Prop({ type: [String], default: undefined })
  equipment: string[]; // home | full_gym | both | bodyweight

  @Prop({ type: [String], default: [] })
  injuries: string[];

  @Prop()
  timePerSession: number; // derived from "30" | "45-60" | "90+"
}

@Schema({ timestamps: true })
export class Conversation extends BaseDocumentSchema {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true, index: true })
  conversationId: string;

  @Prop({ type: [ConversationMessage], default: [] })
  messages: ConversationMessage[];

  @Prop({ enum: ['asking_questions', 'complete'], default: 'asking_questions' })
  stage: string;

  @Prop({ type: UserProfile, default: () => ({}) })
  userProfile: UserProfile;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
applyBaseSchemaFeatures(ConversationSchema);
