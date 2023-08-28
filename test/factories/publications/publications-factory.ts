import { PrismaService } from "./../../../src/prisma/prisma.service";
import { PublicationFactory } from "./publications-factory.entity";

async function createPublication(prisma: PrismaService, mediaId: number, postId: number) {
    const newPublication = new PublicationFactory(mediaId, postId, new Date());
    return await prisma.publication.create({
        data: {
            mediaId: newPublication.mediaId,
            postId: newPublication.postId,
            date: newPublication.date
        }
    });
}

async function getPublications(prisma: PrismaService) {
    return await prisma.publication.findMany();
}
async function getPublicationById(prisma: PrismaService, id: number) {
    return await prisma.publication.findFirst({
        where: {
            id
        },
    });
}

const publicationsFactory = {
    createPublication,
    getPublications,
    getPublicationById
}

export default publicationsFactory;