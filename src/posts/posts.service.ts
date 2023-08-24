import { ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostsRepository } from './posts.repository';
import { PublicationsService } from '../publications/publications.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @Inject(forwardRef(() => PublicationsService))
    private readonly publicationsService: PublicationsService
  ) { }

  create(createPostDto: CreatePostDto) {
    const newPost = new Post(createPostDto.title, createPostDto.text, createPostDto.image);
    return this.postsRepository.createPost(newPost);
  }

  findAll() {
    return this.postsRepository.getAllPosts();
  }

  async findOne(id: number) {
    await this.findRegisterOrNotFound(id);
    return this.postsRepository.getPostById(id);
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.findRegisterOrNotFound(id);
    return this.postsRepository.updatePost(id, updatePostDto);
  }

  async remove(id: number) {
    await this.findRegisterOrNotFound(id);
    const postAlreadyPublished = await this.publicationsService.findAll();

    const publishedOrScheduled = postAlreadyPublished.find(i => i.postId === id);

    if (publishedOrScheduled) {
      throw new ForbiddenException("This post is already published, you can't remove");
    }
    return this.postsRepository.removePost(id);
  }

  private async findRegisterOrNotFound(id: number) {
    const postById = await this.postsRepository.getPostById(id);

    if (!postById) {
      throw new NotFoundException("Post not found");
    }

    return postById;
  }
}
