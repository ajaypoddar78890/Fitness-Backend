import { IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreateMuscleGroupDto {
  @IsNotEmpty()
  @IsMongoId()
  workoutTypeId: string;

  @IsNotEmpty()
  @IsString()
  label: string;
}
