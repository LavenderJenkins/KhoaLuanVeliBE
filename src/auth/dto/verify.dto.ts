import { IsString } from "class-validator";

export class VerifyDto {
    @IsString()
    otp_code: string;
}