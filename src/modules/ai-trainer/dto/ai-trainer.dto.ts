import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartConversationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  // Free-form kickoff text (e.g. "Generate"). Optional — defaults handled in service.
  @IsString()
  @IsOptional()
  message?: string;
}

export class RespondToQuestionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  selectedOption: string;
}
