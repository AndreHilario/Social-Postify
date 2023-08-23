import { PartialType } from '@nestjs/mapped-types';
import { CreateMediaDto } from './create-media.dto';
import { IsString } from 'class-validator';

export class UpdateMediaDto extends PartialType(CreateMediaDto) {
    @IsString()
    title?: string;
    
    @IsString()
    username?: string;
}
