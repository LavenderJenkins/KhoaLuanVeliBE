import { IsPhoneNumber, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @MinLength(6, { message: "Họ và tên phải ít nhất 6 ký tự"})
    full_name: string;
    
    @IsPhoneNumber('VN', { message: 'Số điện thoại phải đúng 10 số! theo số điện thoại Việt Nam' })
    phone: string;
    
    @IsString()
    @MinLength(6, { message: "Mật khẩu phải ít nhất 6 ký tự"})
    password: string;
}
