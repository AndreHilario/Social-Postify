import { Module } from '@nestjs/common';
import { MediasService } from './medias.service';
import { MediasController } from './medias.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MediasRepository } from './medias.repository';
import { PublicationsModule } from 'src/publications/publications.module';

@Module({
  controllers: [MediasController],
  providers: [MediasService, MediasRepository],
  imports: [PrismaModule, PublicationsModule],
  exports: [MediasService]
})
export class MediasModule {}
