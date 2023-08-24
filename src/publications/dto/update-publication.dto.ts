import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicationDto } from './create-publication.dto';
import { IsInt, IsNotEmpty, IsISO8601 } from 'class-validator';

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {
    @IsInt()
    @IsNotEmpty()
    mediaId?: number;

    @IsInt()
    @IsNotEmpty()
    postId?: number;
    
    @IsISO8601()
    @IsNotEmpty()
    date?: Date;
}
