import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    required: true,
    trim: true 
  })
  name: string;

  @Prop({ 
    unique: true,
    sparse: true // allows multiple null values, making it optional for existing users
  })
  uid?: string; // Unique ID for each user

  @Prop({ 
    unique: true, 
    sparse: true // allows multiple null values
  })
  firebaseUid?: string;

  @Prop()
  photo?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ 
    type: String,
    enum: ['email', 'firebase', 'google'],
    default: 'email' 
  })
  authProvider: string;

  @Prop({ default: Date.now })
  lastLogin?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  preferences: any;

  @Prop({ type: Object, default: {} })
  profile: {
    age?: number;
    height?: number; // in cm
    weight?: number; // in kg
    gender?: 'male' | 'female' | 'other';
    fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ uid: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ authProvider: 1 });
UserSchema.index({ isActive: 1 });

// Add virtual for full name or display name
UserSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};
