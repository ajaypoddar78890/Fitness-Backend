import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ActiveHourDto {
  @IsInt()
  @Min(0)
  hour: number;

  @IsInt()
  @Min(0)
  activityCount: number;
}

export class CreateFitnessActivityDto {
  // ISO date string for the activity day (e.g. "2026-06-13")
  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  steps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  caloriesBurned?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workoutDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActiveHourDto)
  activeHours?: ActiveHourDto[];
}

export class UpdateGoalsDto {
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(50000)
  stepsGoal?: number;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(10000)
  caloriesGoal?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(600)
  workoutDurationGoal?: number;
}
