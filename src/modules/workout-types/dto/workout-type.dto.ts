import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutTypeDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
