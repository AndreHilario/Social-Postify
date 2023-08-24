import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';
import { MediasRepository } from './medias.repository';
import { PublicationsService } from '../publications/publications.service';

@Injectable()
export class MediasService {
  constructor(
    private readonly mediasRepository: MediasRepository,
    @Inject(forwardRef(() => PublicationsService))
    private readonly publicationsService: PublicationsService
  ) { }

  async create(createMediaDto: CreateMediaDto) {
    await this.findDuplicateMedia(createMediaDto.title, createMediaDto.username);

    const newMedia = new Media(createMediaDto.title, createMediaDto.username);
    return this.mediasRepository.createMedia(newMedia);
  }

  async findAll() {
    const medias = await this.mediasRepository.getAllMedias();
    return medias;
  }

  async findOne(id: number) {
    const mediaById = await this.registerNotFound(id);
    return mediaById;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto) {
    const mediaById = await this.registerNotFound(id);

    const titleToUpdate = updateMediaDto.title !== undefined ? updateMediaDto.title : mediaById.title;
    const usernameToUpdate = updateMediaDto.username !== undefined ? updateMediaDto.username : mediaById.username;

    await this.findDuplicateMedia(titleToUpdate, usernameToUpdate);

    return this.mediasRepository.updateMedia(id, updateMediaDto);
  }

  async remove(id: number) {
    await this.mediasRepository.getMediaById(id);
    const mediaAlreadyPublished = this.publicationsService.findOne(id);

    if (mediaAlreadyPublished) {
      throw new ForbiddenException("This media is already published, you can remove");
    }

    return this.mediasRepository.removeMedia(id);
  }

  private async registerNotFound(id: number) {
    const mediaById = await this.mediasRepository.getMediaById(id);

    if (!mediaById) {
      throw new NotFoundException("Media not found");
    }

    return mediaById;
  }

  private async findDuplicateMedia(title: string, username: string) {
    const existingMedias = await this.findAll();
    const duplicateMedia = existingMedias.find(
      (media) =>
        media.title === title &&
        media.username === username
    );

    if (duplicateMedia) {
      throw new ConflictException("You already have a equal media");
    }

    return duplicateMedia;
  }
}
