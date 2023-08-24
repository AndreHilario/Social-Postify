import { Module } from '@nestjs/common';
import { MediasService } from './medias.service';
import { MediasController } from './medias.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MediasRepository } from './medias.repository';

@Module({
  controllers: [MediasController],
  providers: [MediasService, MediasRepository],
  imports: [PrismaModule],
  exports: [MediasService]
})
export class MediasModule {}
