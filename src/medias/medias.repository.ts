import { CreateMediaDto } from "./dto/create-media.dto";
import { Injectable } from "@nestjs/common";
import { UpdateMediaDto } from "./dto/update-media.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MediasRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createMedia(newMedia: CreateMediaDto) {
        return await this.prisma.media.create({
            data: {
                title: newMedia.title,
                username: newMedia.username,
            }
        });
    }

    async getAllMedias() {
        return await this.prisma.media.findMany();
    }

    async getMediaById(id: number) {
        return await this.prisma.media.findFirst({
            where: {
                id
            },
        });
    }

    async updateMedia(id: number, newMedia: UpdateMediaDto) {
        return await this.prisma.media.update({
            where: {
                id
            },
            data: {
                title: newMedia.title,
                username: newMedia.username
            }
        });
    }

    async removeMedia(id: number) {
        return await this.prisma.media.delete({
            where: {
                id
            }
        })
    }
}