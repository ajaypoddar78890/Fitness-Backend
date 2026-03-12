import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsEnum,
} from 'class-validator';

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  MACHINE = 'machine',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class CreateExerciseDto {
  @IsNotEmpty()
  @IsMongoId()
  muscleGroupId: string;

  @IsNotEmpty()
  @IsMongoId()
  workoutTypeId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(Equipment)
  equipment?: Equipment;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}
