import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createPost(newpost: CreatePostDto) {
        return await this.prisma.post.create({
            data: {
                title: newpost.title,
                text: newpost.text,
                image: newpost.image,
            }
        });
    }

    async getAllPosts() {
        return await this.prisma.post.findMany();
    }

    async getPostById(id: number) {
        return await this.prisma.post.findFirst({
            where: {
                id
            },
        });
    }

    async updatePost(id: number, newpost: UpdatePostDto) {
        return await this.prisma.post.update({
            where: {
                id
            },
            data: {
                title: newpost.title,
                text: newpost.text
            }
        });
    }

    async removePost(id: number) {
        return await this.prisma.post.delete({
            where: {
                id
            }
        });
    }
}