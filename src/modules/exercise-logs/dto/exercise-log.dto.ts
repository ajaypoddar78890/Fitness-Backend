import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateExerciseLogDto {
  @IsNotEmpty()
  @IsMongoId()
  exerciseId: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  sets: number;

  @IsNotEmpty()
  @IsNumber()
  reps: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
