import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
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
