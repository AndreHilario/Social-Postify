import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator"

export class CreatePostDto {
    @IsString({
        message: "All fields are required or use the correct format"
    })
    @IsNotEmpty({
        message: "All fields are required or use the correct format"
    })
    title: string

    @IsString({
        message: "All fields are required or use the correct format"
    })
    @IsNotEmpty({
        message: "All fields are required or use the correct format"
    })
    text: string

    @IsNotEmpty()
    @IsUrl()
    @IsOptional()
    image?: string
}
