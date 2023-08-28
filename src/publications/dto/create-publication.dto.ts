import { IsISO8601, IsInt, IsNotEmpty } from "class-validator";

export class CreatePublicationDto {
    @IsInt({
        message: "All fields are required or use the correct format"
    })
    @IsNotEmpty({
        message: "All fields are required or use the correct format"
    })
    mediaId: number

    @IsInt({
        message: "All fields are required or use the correct format"
    })
    @IsNotEmpty({
        message: "All fields are required or use the correct format"
    })
    postId: number

    @IsISO8601()
    @IsNotEmpty({
        message: "All fields are required or use the correct format"
    })
    date: Date
}
