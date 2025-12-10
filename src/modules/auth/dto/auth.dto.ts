import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString()
  photo?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class FirebaseLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Firebase ID token is required' })
  idToken: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  preferences?: any;

  @IsOptional()
  profile?: {
    age?: number;
    height?: number;
    weight?: number;
    gender?: 'male' | 'female' | 'other';
    fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  };
}

export class UpdateFitnessProfileDto {
  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsNumber()
  height?: number; // in cm

  @IsOptional()
  @IsNumber()
  weight?: number; // in kg

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsIn(['weight_loss', 'muscle_gain', 'maintenance', 'endurance'])
  fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';

  @IsOptional()
  @IsIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active'])
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
}