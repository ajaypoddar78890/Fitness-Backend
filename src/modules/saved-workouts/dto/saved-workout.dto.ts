import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  sets: number;

  @IsNumber()
  reps: number;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsNumber()
  @IsOptional()
  rest?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  formTips?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  commonMistakes?: string[];
}

export class WorkoutPlanDto {
  @IsNumber()
  @IsOptional()
  day?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  focus?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises: ExerciseDto[];
}

export class UserPreferencesDto {
  @IsString()
  @IsNotEmpty()
  goal: string;

  @IsString()
  @IsNotEmpty()
  fitnessLevel: string;

  @IsNumber()
  daysPerWeek: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipment?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  injuries?: string[];

  @IsNumber()
  @IsOptional()
  timePerSession?: number;
}

export class SaveWorkoutDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanDto)
  workoutPlan: WorkoutPlanDto[];

  @ValidateNested()
  @Type(() => UserPreferencesDto)
  userPreferences: UserPreferencesDto;
}
