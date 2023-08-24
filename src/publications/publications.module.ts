import { Module, forwardRef } from '@nestjs/common';
import { PublicationsController } from './publications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicationsRepository } from './publications.repository';
import { MediasModule } from '../medias/medias.module';
import { PostsModule } from '../posts/posts.module';
import { PublicationsService } from './publications.service';

@Module({
  imports: [PrismaModule, forwardRef(() => MediasModule), forwardRef(() => PostsModule)],
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationsRepository],
  exports: [PublicationsService]
})
export class PublicationsModule { }
