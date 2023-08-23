import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) { }

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
    //A media só pode ser deletada se não estiver fazendo parte de nenhuma publicação (agendada ou publicada). 
    //Neste caso, retornar o status code 403 Forbidden => Procurar a media em publications (import e export) e trazer o erro caso exista
    return this.postsRepository.removePost(id);
  }

  private async findRegisterOrNotFound(id: number) {
    const postById = await this.postsRepository.getPostById(id);

    if (postById) {
      // retorna o erro 404 
    }

    return postById;
  }
}
