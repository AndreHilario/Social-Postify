import { IsISO8601, IsInt, IsNotEmpty } from "class-validator";

export class CreatePublicationDto {
    @IsInt()
    @IsNotEmpty()
    mediaId: number

    @IsInt()
    @IsNotEmpty()
    postId: number

    @IsISO8601()
    @IsNotEmpty()
    date: Date
}
