import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutTypeDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateWorkoutTypeDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
