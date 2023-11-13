import {IsString} from "class-validator";

export class CreateConversationDto {
  @IsString()
  target_id: string;
  
  @IsString()
  name: string;
}

