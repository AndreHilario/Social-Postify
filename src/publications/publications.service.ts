import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsRepository } from './publications.repository';
import { MediasService } from '../medias/medias.service';
import { PostsService } from '../posts/posts.service';
import { Publication } from './entities/publication.entity';
import { isBooleanString, isISO8601 } from 'class-validator';

@Injectable()
export class PublicationsService {
  constructor(
    private readonly publicationsRepository: PublicationsRepository,
    @Inject(forwardRef(() => MediasService))
    private readonly mediasService: MediasService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService
  ) { }

  async create(createPublicationDto: CreatePublicationDto) {
    await this.findMediaAndPostRegister(createPublicationDto.mediaId, createPublicationDto.postId);
    const newPublication = new Publication(createPublicationDto.mediaId, createPublicationDto.postId, new Date(createPublicationDto.date));
    return this.publicationsRepository.createPublication(newPublication);
  }

  async findAll(published?: string, after?: string) {
    const publications = await this.publicationsRepository.getAllPublications();

    if (!published && !after) {
      return publications;
    }

    if (published && !isBooleanString(published)) {
      throw new HttpException(
        `Invalid value for query parameter 'published'. It should be a boolean.`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (after && !isISO8601(after)) {
      throw new HttpException(
        `Invalid value for query parameter 'after'. It should be a valid date in ISO 8601 format.`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (published === "false" && !after) {
      const notPublishedYet = publications.filter(p => p.date > new Date());
      return notPublishedYet;
    } else if (published === "true") {
      if (!after) {
        const alreadyPublished = publications.filter(p => p.date < new Date());
        return alreadyPublished;
      } else {
        const alreadyPublishedAfter = publications.filter(p => p.date > new Date(after) && p.date < new Date());
        return alreadyPublishedAfter;
      }
    }

    if (!published && after) {
      const publishedAfter = publications.filter(p => p.date > new Date(after) && p.date < new Date());
      return publishedAfter;
    }

  }

  async findOne(id: number) {
    await this.findRegisterOrNotFoundError(id);
    return this.publicationsRepository.getPublicationById(id);
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    await this.findRegisterOrNotFoundError(id);
    await this.findMediaAndPostRegister(updatePublicationDto.mediaId, updatePublicationDto.postId);
    const publication = await this.publicationsRepository.getPublicationById(id);

    if (publication.date < new Date()) {
      throw new ForbiddenException("Publication already published");
    }
    const updatedPublication = new Publication(updatePublicationDto.mediaId, updatePublicationDto.postId, new Date(updatePublicationDto.date));
    return this.publicationsRepository.updatePublication(id, updatedPublication);
  }

  async remove(id: number) {
    await this.findRegisterOrNotFoundError(id);
    return this.publicationsRepository.removePublication(id);
  }

  private async findMediaAndPostRegister(mediaId: number, postId: number) {
    await this.mediasService.findOne(mediaId);
    await this.postsService.findOne(postId);
  }

  private async findRegisterOrNotFoundError(id: number) {
    const publicationId = await this.publicationsRepository.getPublicationById(id);

    if (!publicationId) {
      throw new NotFoundException("Publication not found");
    }

    return publicationId;
  }
}
