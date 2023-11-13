import { IsBoolean, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateDocumentDto {
    @IsString()
    school_id: string;

    @IsString()
    subject_id: string;

    @IsString()
    @MinLength(6, {message: "Tiêu đề phải tối thiểu 6 ký tự"})
    name: string;

    @IsBoolean()
    is_free: boolean;

    @IsString()
    @MaxLength(250, {message: "Mô tả chỉ được tối đa 250 ký tự"})
    description: string;

    @IsString()
    @MinLength(6, {message: "Địa chỉ phải tối thiểu 6 ký tự"})
    address: string;

    @IsNumber()
    @Min(0, { message: "Giá phải tối thiểu 0 đ"})
    price: number;

    images: string[];
}
