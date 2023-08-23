import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';
import { MediasRepository } from './medias.repository';

@Injectable()
export class MediasService {
  constructor(private readonly mediasRepository: MediasRepository) { }

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
    const mediaById = await this.mediasRepository.getMediaById(id);
    //A media só pode ser deletada se não estiver fazendo parte de nenhuma publicação (agendada ou publicada). 
    //Neste caso, retornar o status code 403 Forbidden => Procurar a media em publications (import e export) e trazer o erro caso exista

    return this.mediasRepository.removeMedia(id);
  }

  private async registerNotFound(id: number) {
    const mediaById = await this.mediasRepository.getMediaById(id);

    if (!mediaById) {
      //dar um error 404 Not Found
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
      //Erro 409 - Conflict
    }

    return duplicateMedia;
  }
}
