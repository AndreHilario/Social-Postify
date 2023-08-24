import { ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsRepository } from './publications.repository';
import { MediasService } from '../medias/medias.service';
import { PostsService } from '../posts/posts.service';
import { Publication } from './entities/publication.entity';

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
    const newPublication = new Publication(createPublicationDto.mediaId, createPublicationDto.postId, createPublicationDto.date);
    return this.publicationsRepository.createPublication(newPublication);
  }

  async findAll(published: boolean, after: string) {
    const publications = await this.publicationsRepository.getAllPublications();

    if (!published && !after) {
      return publications;
    }

    if (published === false && !after) {
      const notPublishedYet = publications.filter(p => p.date > new Date());
      return notPublishedYet;
    } else if (published === true) {
      if (!after) {
        const alreadyPublished = publications.filter(p => p.date < new Date());
        return alreadyPublished;
      } else {
        const alreadyPublishedAfter = publications.filter(p => p.date < new Date(after));
        return alreadyPublishedAfter;
      }
    }

    if (!published && after) {
      const publishedAfter = publications.filter(p => p.date < new Date(after));
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

    return this.publicationsRepository.updatePublication(id, updatePublicationDto);
  }

  async remove(id: number) {
    await this.findRegisterOrNotFoundError(id);
    return this.publicationsRepository.removePublication(id);
  }

  private async findMediaAndPostRegister(mediaId: number, postId: number) {
    const media = await this.mediasService.findOne(mediaId);
    const post = await this.postsService.findOne(postId);

    if (!media) {
      throw new NotFoundException("Media not found");
    }

    if (!post) {
      throw new NotFoundException("Post not found");
    }
  }

  private async findRegisterOrNotFoundError(id: number) {
    const publicationId = await this.publicationsRepository.getPublicationById(id);

    if (!publicationId) {
      throw new NotFoundException("Publication not found");
    }

    return publicationId;
  }
}
