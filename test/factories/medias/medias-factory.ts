import { PrismaService } from "./../../../src/prisma/prisma.service";
import * as faker from 'faker';
import { MediaFactory } from "./medias-factory.entity";

async function createMedia(prisma: PrismaService) {
    const newMedia = new MediaFactory(
        faker.lorem.words(3),
        faker.internet.userName(),
    );
    
    return await prisma.media.create({
        data: {
            title: newMedia.title,
            username: newMedia.username,
        },
    });
}

async function getMediaById(prisma: PrismaService, id: number) {
    return await prisma.media.findFirst({
        where: {
            id
        },
    });
}

async function updateMedia(prisma: PrismaService, id: number) {
    const updatedMedia = new MediaFactory(
        faker.lorem.words(4),
        faker.internet.userName()
    );
    
    return await prisma.media.update({
        where: {
            id
        },
        data: {
            title: updatedMedia.title,
            username: updatedMedia.username,
        },
    });
}

const mediasFactory = {
    createMedia,
    getMediaById,
    updateMedia
}

export default mediasFactory;