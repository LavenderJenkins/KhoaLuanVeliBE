import { IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    old_password: string;
    
    @IsString()
    @MinLength(6, { message: "Mật khẩu phải ít nhất 6 ký tự"})
    new_password: string;

    @IsString()
    @MinLength(6, { message: "Mật khẩu phải ít nhất 6 ký tự"})
    new_password_confirm: string;
}
