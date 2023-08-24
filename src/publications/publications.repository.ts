import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { UpdatePublicationDto } from "./dto/update-publication.dto";

@Injectable()
export class PublicationsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createPublication(newPublication: CreatePublicationDto) {
        return await this.prisma.publication.create({
            data: {
                mediaId: newPublication.mediaId,
                postId: newPublication.postId,
                date: newPublication.date,
            }
        });
    }

    async getAllPublications() {
        return await this.prisma.publication.findMany();
    }

    async getPublicationById(id: number) {
        return await this.prisma.publication.findFirst({
            where: {
                id
            },
        });
    }

    async updatePublication(id: number, newPublication: UpdatePublicationDto) {
        return await this.prisma.publication.update({
            where: {
                id
            },
            data: {
                mediaId: newPublication.mediaId,
                postId: newPublication.postId,
                date: newPublication.date,
            }
        });
    }

    async removePublication(id: number) {
        return await this.prisma.publication.delete({
            where: {
                id
            }
        });
    }
}